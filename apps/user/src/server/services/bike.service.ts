import {
  connectDB,
  Bike as BikeCompany,
  BikeService,
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

export const getBikes = async (query: any = {}, userId: any = null) => {
  await connectDB();
  const { city = "", page = 1, limit = 10 } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const bikes = await BikeService.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: "bikecompanies",
        localField: "bike",
        foreignField: "_id",
        as: "company",
      },
    },
    { $unwind: "$company" },
    {
      $match: {
        "company.isActive": true,
        ...(city ? { "company.location.city": { $regex: city, $options: "i" } } : {}),
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        bikeName: 1,
        bikeType: 1,
        pricePerDay: 1,
        discountPrice: 1,
        images: 1,
        "company._id": 1,
        "company.name": 1,
        "company.rating": 1,
        "company.location": 1,
      },
    },
    { $sort: { pricePerDay: 1 } },
    { $skip: Number(skip) },
    { $limit: Number(limit) },
  ]);

  const formattedBikes = bikes.map((b) => ({
    ...b,
    serviceType: "bike",
  }));

  const total = await BikeService.countDocuments({ isActive: true });

  const data = await attachFavoriteFlag(formattedBikes, userId, "bike");

  return {
    data,
    total,
    count: data.length,
    page: Number(page),
    limit: Number(limit),
  };
};

export const getBikeCompanyDetails = async (id: any, userId: any = null) => {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid company id");
  }

  const company: any = await BikeCompany.findOne({
    _id: id,
    isActive: true,
  })
    .select("name location description images rating features rentalPolicies")
    .lean();

  if (!company) {
    throw new Error("Bike company not found");
  }

  const services: any[] = await BikeService.find({
    bike: id,
    isActive: true,
  })
    .select("title bikeName bikeType pricePerDay discountPrice images features meta")
    .sort({ pricePerDay: 1 })
    .lean();

  const taxDoc: any = await Tax.findOne({ isActive: true }).lean();
  const taxPercentage = taxDoc?.taxPercentage || 0;

  const formattedServices = services.map((service: any) => {
    const effectivePrice =
      service.discountPrice > 0 ? service.discountPrice : service.pricePerDay;

    const totalTax = Number(
      ((effectivePrice * taxPercentage) / 100).toFixed(2)
    );

    const totalPriceWithTax = Number((effectivePrice + totalTax).toFixed(2));

    return {
      serviceId: service._id,
      serviceType: "bike",
      bikeName: service.bikeName,
      bikeType: service.bikeType,
      mileage: service.meta?.mileage,
      gearType: service.meta?.gearType,
      pricePerDay: effectivePrice,
      totalPriceWithTax,
      taxPercentage,
      thumbnail: service.images?.[0] || null,
      features: service.features || [],
    };
  });

  const isFavorite = await checkIsFavorite(company._id, userId, "bike");

  const formattedCompany = {
    companyId: company._id,
    serviceType: "bike",
    isFavorite,
    name: company.name,
    description: company.description,
    city: company.location?.city,
    state: company.location?.state,
    rating: company.rating?.average || 0,
    reviews: company.rating?.count || 0,
    images: company.images || [],
    features: company.features || [],
    rentalPolicies: company.rentalPolicies || {},
  };

  return {
    company: formattedCompany,
    services: formattedServices,
    isFavorite,
  };
};

export const getBikeServiceDetails = async (id: any, userId: any = null) => {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid service id");
  }

  const service: any = await BikeService.findOne({
    _id: id,
    isActive: true,
  }).lean();

  if (!service) {
    throw new Error("Bike service not found");
  }

  const company: any = await BikeCompany.findOne({
    _id: service.bike,
    isActive: true,
  })
    .select("name location rating images description rentalPolicies")
    .lean();

  const taxDoc: any = await Tax.findOne({ isActive: true }).lean();
  const taxPercentage = taxDoc?.taxPercentage || 0;

  const effectivePrice =
    service.discountPrice > 0 ? service.discountPrice : service.pricePerDay;

  const totalTax = Number(
    ((effectivePrice * taxPercentage) / 100).toFixed(2)
  );

  const totalPriceWithTax = Number((effectivePrice + totalTax).toFixed(2));

  const isFavorite = await checkIsFavorite(company?._id, userId, "bike");

  return {
    service: {
      ...service,
      serviceId: service._id,
      serviceType: "bike",
      isFavorite,
      pricePerDay: effectivePrice,
      totalPriceWithTax,
      taxPercentage,
      company: company || null,
    },
    company,
    isFavorite,
  };
};

