import {
  connectDB,
  Cab as CabCompany,
  CabService,
  Tax,
  Favorite,
} from "@repo/database";
import mongoose from "mongoose";

const checkIsFavorite = async (itemId: any, userId: any, itemType: any) => {
  if (!userId || !itemId) return false;
  const fav = await Favorite.findOne({
    user: new mongoose.Types.ObjectId(userId),
    itemType,
    itemId: new mongoose.Types.ObjectId(itemId),
  }).select("_id");
  return !!fav;
};

const attachFavoriteFlag = async (items: any[], userId: any, itemType: any) => {
  if (!userId || items.length === 0) {
    items.forEach((item: any) => (item.isFavorite = false));
    return items;
  }

  const itemIds = items.map((i: any) => new mongoose.Types.ObjectId(i._id));

  const favorites = await Favorite.find({
    user: new mongoose.Types.ObjectId(userId),
    itemType,
    itemId: { $in: itemIds },
  }).select("itemId");

  const favoriteSet = new Set(favorites.map((f: any) => f.itemId.toString()));

  items.forEach((item: any) => {
    item.isFavorite = favoriteSet.has(item._id.toString());
  });

  return items;
};

export const getCabs = async (query: any = {}, userId: any = null) => {
  await connectDB();
  const { pickup = "", drop = "", page = 1, limit = 10 } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const matchStage: any = { isActive: true };
  if (pickup) {
    matchStage.pickupLocation = { $regex: pickup, $options: "i" };
  }
  if (drop) {
    matchStage.dropLocation = { $regex: drop, $options: "i" };
  }

  const cabs = await CabService.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "cabcompanies",
        localField: "cab",
        foreignField: "_id",
        as: "company",
      },
    },
    { $unwind: "$company" },
    {
      $match: {
        "company.isActive": true,
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        carName: 1,
        cabType: 1,
        capacity: 1,
        images: 1,
        basePrice: 1,
        discountPrice: 1,
        meta: 1,
        "company._id": 1,
        "company.name": 1,
        "company.rating": 1,
        "company.location": 1,
      },
    },
    { $sort: { basePrice: 1 } },
    { $skip: Number(skip) },
    { $limit: Number(limit) },
  ]);

  const taxDoc: any = await Tax.findOne({ isActive: true }).lean();
  const taxPercentage = taxDoc?.taxPercentage || 0;

  const formattedCabs = cabs.map((cab: any) => {
    const effectivePrice =
      cab.discountPrice && cab.discountPrice > 0
        ? cab.discountPrice
        : cab.basePrice;

    const totalTax = Number(
      ((effectivePrice * taxPercentage) / 100).toFixed(2)
    );

    const totalPriceWithTax = Number((effectivePrice + totalTax).toFixed(2));

    return {
      serviceId: cab._id,
      _id: cab._id,
      serviceType: "cab",
      title: cab.title,
      carName: cab.carName,
      cabType: cab.cabType,
      capacity: cab.capacity,
      price: effectivePrice,
      totalPriceWithTax,
      taxPercentage,
      images: cab.images || [],
      company: cab.company,
    };
  });

  const total = await CabService.countDocuments({ isActive: true });
  const data = await attachFavoriteFlag(formattedCabs, userId, "cab");

  return {
    data,
    total,
    count: data.length,
    page: Number(page),
    limit: Number(limit),
  };
};

export const getCabCompanyDetails = async (id: any, userId: any = null) => {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid company id");
  }

  const company: any = await CabCompany.findOne({
    _id: id,
    isActive: true,
  })
    .select("name location description images rating features")
    .lean();

  if (!company) {
    throw new Error("Cab company not found");
  }

  const services = await CabService.find({
    cab: id,
    isActive: true,
  })
    .select(
      "title carName cabType capacity basePrice discountPrice images meta features pickupLocation dropLocation"
    )
    .sort({ basePrice: 1 })
    .lean();

  const taxDoc: any = await Tax.findOne({ isActive: true }).lean();
  const taxPercentage = taxDoc?.taxPercentage || 0;

  const formattedServices = services.map((service: any) => {
    const effectivePrice =
      service.discountPrice && service.discountPrice > 0
        ? service.discountPrice
        : service.basePrice;

    const totalTax = Number(
      ((effectivePrice * taxPercentage) / 100).toFixed(2)
    );

    const totalPriceWithTax = Number((effectivePrice + totalTax).toFixed(2));

    return {
      serviceId: service._id,
      serviceType: "cab",
      title: service.title,
      carName: service.carName,
      cabType: service.cabType,
      capacity: service.capacity,
      route: {
        pickup: service.pickupLocation,
        drop: service.dropLocation,
      },
      price: effectivePrice,
      totalPrice: effectivePrice,
      totalTax,
      totalPriceWithTax,
      taxPercentage,
      images: service.images || [],
      features: service.features || [],
      meta: service.meta || {},
    };
  });

  const isFavorite = await checkIsFavorite(company._id, userId, "cab");

  return {
    companyId: company._id,
    name: company.name,
    location: company.location,
    description: company.description,
    rating: company.rating?.average || 0,
    reviews: company.rating?.count || 0,
    images: company.images || [],
    features: company.features || [],
    services: formattedServices,
    isFavorite,
  };
};

export const getCabServiceDetails = async (id: any, userId: any = null) => {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid service id");
  }

  const service: any = await CabService.findOne({
    _id: id,
    isActive: true,
  }).lean();

  if (!service) {
    throw new Error("Cab service not found");
  }

  const company: any = await CabCompany.findOne({
    _id: service.cab,
    isActive: true,
  })
    .select("name location rating images description")
    .lean();

  const taxDoc: any = await Tax.findOne({ isActive: true }).lean();
  const taxPercentage = taxDoc?.taxPercentage || 0;

  const effectivePrice =
    service.discountPrice && service.discountPrice > 0
      ? service.discountPrice
      : service.basePrice;

  const totalTax = Number(
    ((effectivePrice * taxPercentage) / 100).toFixed(2)
  );

  const totalPriceWithTax = Number((effectivePrice + totalTax).toFixed(2));

  const isFavorite = await checkIsFavorite(company?._id, userId, "cab");

  return {
    service: {
      ...service,
      serviceId: service._id,
      serviceType: "cab",
      isFavorite,
      price: effectivePrice,
      totalPriceWithTax,
      taxPercentage,
      company: company || null,
    },
    company,
    isFavorite,
  };
};

