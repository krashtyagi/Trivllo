import {
  connectDB,
  Adventure,
  Service,
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

export const searchAdventures = async (query: any = {}, userId: any = null) => {
  await connectDB();
  const { city } = query;

  if (!city) {
    return [];
  }

  const adventures: any[] = await Adventure.find({
    "location.city": new RegExp(city, "i"),
    isActive: true,
  })
    .select("_id category")
    .lean();

  if (!adventures.length) return [];

  const categoryMap: Record<string, any[]> = {};
  adventures.forEach((adv: any) => {
    if (!categoryMap[adv.category]) {
      categoryMap[adv.category] = [];
    }
    categoryMap[adv.category].push(adv._id);
  });

  const categoryConfig: Record<string, string> = {
    rafting: "River Rafting",
    paragliding: "Paragliding",
    bungee: "Bungee Jumping",
    trekking: "Trekking",
  };

  const results = await Promise.all(
    Object.keys(categoryMap).map(async (category) => {
      const adventureIds = categoryMap[category];
      const minService: any = await Service.find({
        adventure: { $in: adventureIds },
        isActive: true,
      })
        .sort({ basePrice: 1 })
        .select("basePrice")
        .limit(1)
        .lean();

      const startingPrice = minService[0]?.basePrice || null;

      return {
        category,
        title: categoryConfig[category] || category,
        startingPrice,
        serviceType: "adventure",
      };
    })
  );

  return results;
};

export const getAdventures = async (query: any = {}, userId: any = null) => {
  await connectDB();
  const { category, city } = query;

  const match: any = { isActive: true };
  if (category) match.category = category;
  if (city) match["location.city"] = new RegExp(city, "i");

  const adventures = await Adventure.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "services",
        localField: "_id",
        foreignField: "adventure",
        as: "services",
      },
    },
    {
      $match: {
        "services.0": { $exists: true },
      },
    },
    {
      $addFields: {
        priceStart: { $min: "$services.basePrice" },
      },
    },
    {
      $project: {
        name: 1,
        category: 1,
        city: "$location.city",
        description: 1,
        features: { $slice: ["$features", 3] },
        rating: "$rating.average",
        reviews: "$rating.count",
        image: { $arrayElemAt: ["$images", 0] },
        priceStart: 1,
      },
    },
    { $sort: { priceStart: 1 } },
  ]);

  const formattedAdventures = adventures.map((adv) => ({
    ...adv,
    serviceType: "adventure",
  }));

  return await attachFavoriteFlag(formattedAdventures, userId, "adventure");
};

export const getAdventureDetails = async (id: any, userId: any = null) => {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid adventure id");
  }

  const adventure: any = await Adventure.findOne({
    _id: id,
    isActive: true,
  })
    .select("name category location description images rating")
    .lean();

  if (!adventure) {
    throw new Error("Adventure not found");
  }

  const services: any[] = await Service.find({
    adventure: id,
    isActive: true,
  })
    .select("title type basePrice discountPrice meta features itinerary")
    .sort({ basePrice: 1 })
    .lean();

  const taxDoc: any = await Tax.findOne({ isActive: true }).lean();
  const taxPercentage = taxDoc?.taxPercentage || 0;

  const formattedServices = services.map((service: any) => {
    const effectivePrice =
      (service.discountPrice ?? 0) > 0
        ? service.discountPrice!
        : service.basePrice;
    const totalTax = Number(
      ((effectivePrice * taxPercentage) / 100).toFixed(2)
    );
    const totalPriceWithTax = Number((effectivePrice + totalTax).toFixed(2));

    return {
      ...service,
      serviceType: "adventure",
      taxPercentage,
      totalTax,
      totalPriceWithTax,
    };
  });

  const isFavorite = await checkIsFavorite(adventure._id, userId, "adventure");

  const formattedAdventure = {
    _id: adventure._id,
    serviceType: "adventure",
    isFavorite,
    name: adventure.name,
    category: adventure.category,
    city: adventure.location?.city,
    description: adventure.description,
    rating: adventure.rating?.average || 0,
    reviews: adventure.rating?.count || 0,
    images: adventure.images || [],
  };

  return {
    adventure: formattedAdventure,
    services: formattedServices,
    isFavorite,
  };
};

export const getAdventureServiceDetails = async (
  id: any,
  userId: any = null
) => {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid service id");
  }

  const service: any = await Service.findOne({
    _id: id,
    isActive: true,
  })
    .populate({
      path: "adventure",
      select: "name category location images",
    })
    .lean();

  if (!service) {
    throw new Error("Service not found");
  }

  const taxDoc: any = await Tax.findOne({ isActive: true }).lean();
  const taxPercentage = taxDoc?.taxPercentage || 0;

  const effectivePrice =
    service.discountPrice > 0 ? service.discountPrice : service.basePrice;
  const discountAmount = service.basePrice - effectivePrice;
  const discountPercentage =
    service.discountPrice > 0
      ? Math.round((discountAmount / service.basePrice) * 100)
      : 0;
  const taxAmount = Number(((effectivePrice * taxPercentage) / 100).toFixed(2));
  const finalPrice = Number((effectivePrice + taxAmount).toFixed(2));

  const isFavorite = await checkIsFavorite(
    service.adventure?._id,
    userId,
    "adventure"
  );

  return {
    service: {
      ...service,
      serviceType: "adventure",
      taxPercentage,
      taxAmount,
      discountAmount,
      discountPercentage,
      effectivePrice,
      finalPrice,
    },
    isFavorite,
  };
};

