import {
  connectDB,
  Tour as TourCompany,
  TourService,
  Tax,
  Favorite,
  Review,
} from "@repo/database";
import mongoose from "mongoose";
import { optimizeCloudinary } from "../utils/cloudinary";

const attachFavoriteFlag = async (
  items: any[],
  userId: any,
  itemType: string = "tour"
) => {
  if (!userId || items.length === 0) {
    items.forEach((item: any) => {
      item.isFavorite = false;
      item.isFavourite = false;
    });
    return items;
  }

  const itemIds = items.map((i: any) => i._id);

  const favorites = await Favorite.find({
    user: userId,
    itemType,
    itemId: { $in: itemIds },
  } as any).select("itemId").lean();

  const favoriteSet = new Set(favorites.map((fav: any) => fav.itemId?.toString()));

  items.forEach((item: any) => {
    const isFav = favoriteSet.has(item._id.toString());
    item.isFavorite = isFav;
    item.isFavourite = isFav;
  });

  return items;
};

export const getAllTourCompanies = async (
  query: any = {},
  userId: any = null
) => {
  await connectDB();
  const { city, search, rank, page = 1, limit = 50 }: any = query;

  const companiesWithActiveTours = await TourService.distinct("tour", {
    isActive: true,
  });

  if (!companiesWithActiveTours || companiesWithActiveTours.length === 0) {
    return {
      companies: [],
      total: 0,
      page: Math.max(1, Number(page) || 1),
      limit: Math.max(1, Number(limit) || 50),
    };
  }

  const filter: any = {
    _id: { $in: companiesWithActiveTours },
    verificationStatus: "verified",
    isActive: true,
  };

  if (city && String(city).trim()) {
    const cityRegex = { $regex: String(city).trim(), $options: "i" };
    filter.$or = [
      { "location.city": cityRegex },
      { "address.city": cityRegex },
      { "address.areaName": cityRegex },
      { "address.district": cityRegex },
      { "address.streetAddress": cityRegex },
      { "address.landmark": cityRegex },
      { "address.formattedAddress": cityRegex },
      { "address.state": cityRegex },
      { city: cityRegex },
    ];
  }

  if (search && String(search).trim()) {
    const searchRegex = { $regex: String(search).trim(), $options: "i" };
    const searchMatch = [
      { name: searchRegex },
      { "location.city": searchRegex },
      { "address.city": searchRegex },
      { description: searchRegex },
    ];
    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { $or: searchMatch }];
      delete filter.$or;
    } else {
      filter.$or = searchMatch;
    }
  }

  if (rank) {
    filter.rank = rank;
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 50);
  const skip = (pageNum - 1) * limitNum;

  const [total, companiesRaw] = await Promise.all([
    TourCompany.countDocuments(filter),
    TourCompany.find(filter)
      .select(
        "name location address city description images rating rank isFeatured features"
      )
      .sort({ isFeatured: -1, rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
  ]);

  const companyIds = companiesRaw.map((c: any) => c._id);

  // Compute starting price per company
  const priceAgg = await TourService.aggregate([
    {
      $match: {
        tour: { $in: companyIds },
        isActive: true,
      },
    },
    {
      $group: {
        _id: "$tour",
        minPrice: {
          $min: {
            $cond: [
              { $gt: ["$discountPrice", 0] },
              "$discountPrice",
              "$basePrice",
            ],
          },
        },
        totalTours: { $sum: 1 },
      },
    },
  ]);

  const priceMap: Record<string, { minPrice: number; totalTours: number }> = {};
  priceAgg.forEach((p: any) => {
    priceMap[p._id.toString()] = {
      minPrice: p.minPrice,
      totalTours: p.totalTours,
    };
  });

  const formattedCompanies = companiesRaw.map((company: any) => {
    const rawImg = company.images?.[0]?.url;
    const thumbnail = rawImg
      ? optimizeCloudinary(rawImg, "f_auto,q_auto,w_800,c_limit")
      : "/tours/tour.png";

    const pInfo = priceMap[company._id.toString()] || {
      minPrice: 0,
      totalTours: 0,
    };

    return {
      _id: company._id,
      name: company.name,
      city: company.location?.city || company.address?.city || company.city,
      address: company.address?.formattedAddress || company.address?.streetAddress,
      thumbnail,
      description: company.description,
      features: company.features || [],
      rating: {
        average: company.rating || 0,
        count: 0,
      },
      startingPrice: pInfo.minPrice,
      totalTours: pInfo.totalTours,
      isFeatured: company.isFeatured || false,
    };
  });

  const updatedCompanies = await attachFavoriteFlag(
    formattedCompanies,
    userId,
    "tour"
  );

  return {
    companies: updatedCompanies,
    total,
    page: pageNum,
    limit: limitNum,
  };
};

export const getTourCompanyById = async (id: any, userId: any = null) => {
  await connectDB();
  const company: any = await TourCompany.findOne({
    _id: id,
    isActive: true,
    verificationStatus: "verified",
  }).lean();

  if (!company) {
    throw new Error("Tour company not found");
  }

  const tours = await TourService.find({ tour: id, isActive: true }).lean();
  const resolvedLogo =
    company.logo?.url ||
    company.images?.[0]?.url ||
    `https://api.dicebear.com/10.x/initials/svg?seed=${encodeURIComponent(company.name)}`;

  let isFavorite = false;
  if (userId) {
    const fav = await Favorite.findOne({
      user: userId,
      itemType: "tour",
      itemId: company._id,
    }).select("_id");
    isFavorite = !!fav;
  }

  return {
    ...company,
    logo: resolvedLogo,
    isFavorite,
    tours,
  };
};

export const getRankedTourCompanies = async (
  rank: any,
  page: any = 1,
  limit: any = 10
) => {
  await connectDB();
  if (!rank || !["A", "B", "C"].includes(rank)) {
    return { items: [], total: 0, page: 1, limit: 10, hasMore: false };
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 10);
  const skip = (pageNum - 1) * limitNum;

  const companiesWithActiveTours = await TourService.distinct("tour", {
    isActive: true,
  });

  const filter: any = {
    _id: { $in: companiesWithActiveTours },
    rank,
    isActive: true,
    verificationStatus: "verified",
  };

  const total = await TourCompany.countDocuments(filter);

  if (total === 0) {
    return { items: [], total: 0, page: pageNum, limit: limitNum, hasMore: false };
  }

  const companies = await TourCompany.find(filter)
    .select("name location address city images advertisementImage rating")
    .sort({ isFeatured: -1, rating: -1, createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  const items = companies.map((c: any) => {
    const rawUrl =
      c.advertisementImage?.url || c.images?.[0]?.url || null;
    return {
      _id: c._id,
      name: c.name,
      city: c.location?.city || c.address?.city || c.city,
      image: rawUrl
        ? optimizeCloudinary(rawUrl, "f_auto,q_auto,w_1400,c_limit")
        : null,
    };
  });

  return {
    items,
    total,
    page: pageNum,
    limit: limitNum,
    hasMore: skip + limitNum < total,
  };
};

export const getTours = async (query: any, userId: any = null) => {
  await connectDB();
  const {
    search = "",
    city = "",
    minPrice,
    maxPrice,
    features,
    tourType,
    adults,
    children,
    page = 1,
    limit = 9,
  } = query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 9);
  const skip = (pageNum - 1) * limitNum;

  const matchStage: any = {
    isActive: true,
  };

  const totalGuests = (Number(adults) || 0) + (Number(children) || 0);
  if (totalGuests > 0) {
    matchStage.maxPeople = { $gte: totalGuests };
  }

  if (search && String(search).trim()) {
    matchStage.$or = [
      { title: { $regex: String(search).trim(), $options: "i" } },
      { destinations: { $regex: String(search).trim(), $options: "i" } },
      { description: { $regex: String(search).trim(), $options: "i" } },
    ];
  }

  const pMin =
    minPrice !== undefined && Number(minPrice) > 0 ? Number(minPrice) : null;
  const pMax =
    maxPrice !== undefined && Number(maxPrice) > 0 ? Number(maxPrice) : null;

  if (pMin !== null || pMax !== null) {
    const priceCond: any = {};
    if (pMin !== null) priceCond.$gte = pMin;
    if (pMax !== null) priceCond.$lte = pMax;

    const priceOr = [
      { discountPrice: { $gt: 0, ...priceCond } },
      {
        $and: [
          {
            $or: [
              { discountPrice: 0 },
              { discountPrice: null },
              { discountPrice: { $exists: false } },
            ],
          },
          { basePrice: priceCond },
        ],
      },
    ];

    if (matchStage.$or) {
      matchStage.$and = [{ $or: matchStage.$or }, { $or: priceOr }];
      delete matchStage.$or;
    } else {
      matchStage.$or = priceOr;
    }
  }

  const [total, toursRaw] = await Promise.all([
    TourService.countDocuments(matchStage),
    TourService.find(matchStage)
      .populate("tour", "name location city address rating images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
  ]);

  const taxDoc = await Tax.findOne({ isActive: true }).lean();
  const taxPercentage = taxDoc?.taxPercentage || 0;

  const formattedTours = toursRaw.map((service: any) => {
    const effectivePrice =
      service.discountPrice && service.discountPrice > 0
        ? service.discountPrice
        : service.basePrice || 0;

    const totalTax = Number(((effectivePrice * taxPercentage) / 100).toFixed(2));
    const totalPriceWithTax = Number((effectivePrice + totalTax).toFixed(2));

    const optimizedImages = (service.images || []).map((img: any) => {
      const u = typeof img === "string" ? img : img?.url;
      return { url: optimizeCloudinary(u, "f_auto,q_auto,w_800,c_limit") };
    });

    return {
      _id: service._id,
      serviceId: service._id,
      serviceType: "tour",
      title: service.title,
      description: service.description,
      duration: service.duration
        ? `${service.duration.days || 0}D/${service.duration.nights || 0}N`
        : "",
      price: effectivePrice,
      totalPrice: effectivePrice,
      totalTax,
      totalPriceWithTax,
      taxPercentage,
      thumbnail: optimizedImages[0] || { url: "/tours/tour.png" },
      thumbnails: optimizedImages,
      features: service.features || [],
      destinations: service.destinations || [],
      company: service.tour,
    };
  });

  return {
    tours: formattedTours,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
    },
  };
};

export const getCompanyDetails = async (id: any, userId: any = null) => {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid company id");
  }

  const company: any = await TourCompany.findOne({
    _id: id,
    isActive: true,
    verificationStatus: "verified",
  })
    .select("name location description images rating features")
    .lean();

  if (!company) {
    throw new Error("Tour company not found");
  }

  const services = await TourService.find({
    tour: id,
    isActive: true,
  })
    .select("title basePrice discountPrice duration images features")
    .sort({ basePrice: 1 })
    .lean();

  const taxDoc = await Tax.findOne({ isActive: true }).lean();
  const taxPercentage = taxDoc?.taxPercentage || 0;

  let isFavorite = false;
  if (userId) {
    const fav = await Favorite.findOne({
      user: userId,
      itemType: "tour",
      itemId: company._id,
    }).select("_id");
    isFavorite = !!fav;
  }

  const formattedServices = services.map((service: any) => {
    const effectivePrice =
      service.discountPrice && service.discountPrice > 0
        ? service.discountPrice
        : service.basePrice || 0;

    const totalTax = Number(((effectivePrice * taxPercentage) / 100).toFixed(2));
    const totalPriceWithTax = Number((effectivePrice + totalTax).toFixed(2));

    const optimizedImages = (service.images || []).map((img: any) => {
      const u = typeof img === "string" ? img : img?.url;
      return { url: optimizeCloudinary(u, "f_auto,q_auto,w_800,c_limit") };
    });

    return {
      serviceId: service._id,
      serviceType: "tour",
      title: service.title,
      duration: `${service.duration?.days || 0}D/${service.duration?.nights || 0}N`,
      price: effectivePrice,
      totalPrice: effectivePrice,
      totalTax,
      totalPriceWithTax,
      taxPercentage,
      thumbnail: optimizedImages[0] || { url: "/tours/tour.png" },
      thumbnails: optimizedImages,
      features: service.features || [],
    };
  });

  return {
    company: {
      ...company,
      isFavorite,
      isFavourite: isFavorite,
    },
    services: formattedServices,
  };
};

export const getTourServiceDetails = async (id: any, userId: any = null) => {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid service id");
  }

  const service = await TourService.findOne({
    _id: id,
    isActive: true,
  }).lean();

  if (!service) {
    throw new Error("Tour service not found");
  }

  const company = await TourCompany.findOne({
    _id: service.tour,
    isActive: true,
    verificationStatus: "verified",
  })
    .select("name location rating images description")
    .lean();

  if (!company) {
    throw new Error("Tour company not found");
  }

  const taxDoc = await Tax.findOne({ isActive: true }).lean();
  const taxPercentage = taxDoc?.taxPercentage || 0;

  const effectivePrice =
    service.discountPrice && service.discountPrice > 0
      ? service.discountPrice
      : service.basePrice || 0;

  const totalTax = Number(((effectivePrice * taxPercentage) / 100).toFixed(2));
  const totalPriceWithTax = Number((effectivePrice + totalTax).toFixed(2));

  let isFavorite = false;
  if (userId) {
    const fav = await Favorite.findOne({
      user: userId,
      itemType: "tour",
      itemId: company._id,
    }).select("_id");
    isFavorite = !!fav;
  }

  const optimizedImages = (service.images || []).map((img: any) => {
    const u = typeof img === "string" ? img : img?.url;
    return { url: optimizeCloudinary(u, "f_auto,q_auto,w_1200,c_limit") };
  });

  return {
    serviceId: service._id,
    serviceType: "tour",
    isFavorite,
    isFavourite: isFavorite,
    title: service.title,
    description: service.description,
    destinations: service.destinations || [],
    duration: service.duration
      ? `${service.duration.days || 0}D/${service.duration.nights || 0}N`
      : "",
    price: effectivePrice,
    totalPrice: effectivePrice,
    totalTax,
    totalPriceWithTax,
    taxPercentage,
    thumbnail: optimizedImages[0] || { url: "/tours/tour.png" },
    thumbnails: optimizedImages,
    features: service.features || [],
    itinerary: (service as any).itinerary || [],
    inclusions: (service as any).inclusions || [],
    exclusions: (service as any).exclusions || [],
    company,
  };
};
