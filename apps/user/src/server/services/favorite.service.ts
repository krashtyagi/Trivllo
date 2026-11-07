import {
  connectDB,
  Favorite,
  Hotel,
  Cab as CabCompany,
  Bike as BikeCompany,
  Tour as TourCompany,
  Adventure,
} from "@repo/database";
import mongoose from "mongoose";

const SERVICE_MODELS: Record<string, any> = {
  hotel: Hotel,
  cab: CabCompany,
  bike: BikeCompany,
  tour: TourCompany,
  adventure: Adventure,
};

const getThumbnail = (item: any, itemType: string) => {
  if (!item?.images?.length) return null;
  if (itemType === "hotel") {
    return item.images?.[0]?.url || item.images?.[0] || null;
  }
  return item.images?.[0]?.url || item.images?.[0] || null;
};

export const toggleFavorite = async (
  userId: any,
  itemId: any,
  itemType: string = "hotel"
) => {
  await connectDB();
  const validItemType = (itemType as any) || "hotel";
  const userObjId = new mongoose.Types.ObjectId(userId);
  const itemObjId = new mongoose.Types.ObjectId(itemId);

  const existing = await Favorite.findOne({
    user: userObjId,
    itemId: itemObjId,
    itemType: validItemType,
  } as any);

  if (existing) {
    await existing.deleteOne();
    return { isFavorite: false, liked: false };
  }

  await Favorite.create({
    user: userObjId,
    itemId: itemObjId,
    itemType: validItemType,
  } as any);

  return { isFavorite: true, liked: true };
};

export const getUserFavorites = async (userId: any, itemType?: string) => {
  await connectDB();
  const filter: any = {
    user: new mongoose.Types.ObjectId(userId),
  };

  if (itemType) {
    filter.itemType = itemType;
  }

  return await Favorite.find(filter).select("itemId itemType").lean();
};

export const getFavoritesSummary = async (userId: any) => {
  await connectDB();
  const favorites = await Favorite.find({
    user: new mongoose.Types.ObjectId(userId),
  })
    .limit(20)
    .lean();

  const totalSaved = favorites.length;

  if (totalSaved === 0) {
    return {
      name: "My Favorites",
      totalSaved: 0,
      coverImages: [],
    };
  }

  const coverImages: string[] = [];

  for (const fav of favorites) {
    const Model = SERVICE_MODELS[fav.itemType];
    if (!Model) continue;

    const item: any = await Model.findById(fav.itemId).select("images").lean();
    if (!item) continue;

    const thumbnail = getThumbnail(item, fav.itemType);
    if (thumbnail) {
      coverImages.push(thumbnail);
    }

    if (coverImages.length >= 4) {
      break;
    }
  }

  return {
    name: "My Favorites",
    totalSaved,
    coverImages,
  };
};

export const getMyTripFavorites = async (
  userId: any,
  page: any = 1,
  limit: any = 10
) => {
  await connectDB();
  const skip = (Number(page) - 1) * Number(limit);

  const favorites = await Favorite.find({
    user: new mongoose.Types.ObjectId(userId),
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const results: any[] = [];

  for (const fav of favorites) {
    const Model = SERVICE_MODELS[fav.itemType];
    if (!Model) continue;

    const item: any = await Model.findOne({
      _id: fav.itemId,
      isActive: true,
    }).lean();

    if (!item) continue;

    if (fav.itemType === "hotel") {
      results.push({
        _id: item._id,
        itemType: "hotel",
        name: item.name,
        city: item.city,
        rating: item.rating,
        numReviews: item.numReviews,
        thumbnail: getThumbnail(item, "hotel"),
        isFavorite: true,
      });
      continue;
    }

    results.push({
      _id: item._id,
      itemType: fav.itemType,
      name: item.name,
      location: item.location || {},
      rating: item.rating || {},
      thumbnail: getThumbnail(item, fav.itemType),
      isFavorite: true,
    });
  }

  return results;
};
