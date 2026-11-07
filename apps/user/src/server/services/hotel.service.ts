import {
  connectDB,
  Hotel,
  RoomType,
  Availability,
  Tax,
  Booking,
  Favorite,
  Review,
  PopularSection,
} from "@repo/database";
import mongoose from "mongoose";
import { optimizeCloudinary } from "../utils/cloudinary";

const attachFavoriteFlag = async (hotels: any[], userId: any) => {
  if (!userId || hotels.length === 0) {
    hotels.forEach((hotel: any) => (hotel.isFavorite = false));
    return hotels;
  }

  const hotelIds = hotels.map((h: any) => h._id);

  const favorites = await Favorite.find({
    user: userId,
    itemType: "hotel",
    itemId: { $in: hotelIds },
  } as any).select("itemId");

  const favoriteSet = new Set(favorites.map((fav) => fav.itemId.toString()));

  hotels.forEach((hotel: any) => {
    hotel.isFavorite = favoriteSet.has(hotel._id.toString());
  });

  return hotels;
};

const formatAmenityName = (amenity: string): string => {
  const map: Record<string, string> = {
    free_wifi: "Free WiFi",
    wifi: "Free WiFi",
    free_parking: "Free Parking",
    parking: "Parking",
    breakfast: "Breakfast",
    mountain_view: "Mountain View",
    room_service: "Room Service",
    bonfire: "Bonfire",
    garden: "Garden",
    restaurant: "Restaurant",
    terrace: "Terrace",
    balcony: "Balcony",
  };
  return (
    map[amenity.toLowerCase()] ||
    amenity
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
};

function matchesSection(hotel: any, section: any): boolean {
  if (!hotel || !section) return false;
  const sectionCity = (section.city || "").toLowerCase().trim();
  const hotelCity = (hotel.city || hotel.address?.city || "")
    .toLowerCase()
    .trim();
  if (sectionCity && hotelCity && hotelCity.includes(sectionCity)) return true;

  if (Array.isArray(section.aliases)) {
    for (const alias of section.aliases) {
      const a = (alias || "").toLowerCase().trim();
      if (a && hotelCity && hotelCity.includes(a)) return true;
    }
  }
  return false;
}

export const getAllHotels = async (query: any = {}, userId: any = null) => {
  await connectDB();
  const {
    city,
    checkIn,
    checkOut,
    minRating,
    minPrice,
    maxPrice,
    amenities,
    minSize,
    maxSize,
    adults,
    children,
    page = 1,
    limit = 10,
  }: any = query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 10);
  const skip = (pageNum - 1) * limitNum;

  const filter: any = {
    isActive: true,
    verificationStatus: "verified",
  };

  if (city && String(city).trim()) {
    const cityRegex = { $regex: String(city).trim(), $options: "i" };
    filter.$or = [
      { "address.city": cityRegex },
      { "address.areaName": cityRegex },
      { "address.district": cityRegex },
      { "address.streetAddress": cityRegex },
      { "address.landmark": cityRegex },
      { "address.formattedAddress": cityRegex },
      { city: cityRegex },
    ];
  }

  if (minRating) {
    filter.rating = { $gte: Number(minRating) };
  }

  if (amenities) {
    const arr = Array.isArray(amenities) ? amenities : String(amenities).split(",");
    if (arr.length > 0) {
      filter.amenities = { $all: arr };
    }
  }

  const [total, hotelsRaw] = await Promise.all([
    Hotel.countDocuments(filter),
    Hotel.find(filter)
      .select("name city address images rating numReviews isFeatured rank amenities location")
      .sort({ isFeatured: -1, rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
  ]);

  const hotelIds = hotelsRaw.map((h: any) => h._id);

  // Price aggregation from RoomType
  const priceAgg = await RoomType.aggregate([
    {
      $match: {
        hotelId: { $in: hotelIds },
        isActive: true,
      },
    },
    {
      $group: {
        _id: "$hotelId",
        minPrice: {
          $min: {
            $cond: [
              { $gt: ["$discountPrice", 0] },
              "$discountPrice",
              "$basePrice",
            ],
          },
        },
      },
    },
  ]);

  const priceMap: Record<string, number> = {};
  priceAgg.forEach((p: any) => {
    priceMap[p._id.toString()] = p.minPrice;
  });

  const formattedHotels = hotelsRaw.map((hotel: any) => {
    const rawImg = hotel.images?.[0]?.url;
    const image = rawImg
      ? optimizeCloudinary(rawImg, "f_auto,q_auto,w_600,c_limit")
      : "/hotels/room1.png";

    return {
      _id: hotel._id,
      name: hotel.name,
      city: hotel.address?.city || hotel.city,
      country: hotel.address?.country || "India",
      address: hotel.address,
      rating: hotel.rating || 0,
      numReviews: hotel.numReviews || 0,
      amenities: (hotel.amenities || []).slice(0, 3).map(formatAmenityName),
      image,
      startingPrice: priceMap[hotel._id.toString()] || 0,
    };
  });

  const updatedHotels = await attachFavoriteFlag(formattedHotels, userId);

  return {
    hotels: updatedHotels,
    total,
  };
};

export const getHomeHotels = async (query: any = {}, userId: any = null) => {
  await connectDB();
  const { city } = query;

  const hotelsWithActiveRooms = await RoomType.distinct("hotelId", {
    isActive: true,
  });

  if (!hotelsWithActiveRooms || hotelsWithActiveRooms.length === 0) {
    return { hotels: [], sections: [] };
  }

  const filter: any = {
    _id: { $in: hotelsWithActiveRooms },
    isActive: true,
    verificationStatus: "verified",
  };

  if (city && String(city).trim()) {
    const cityRegex = { $regex: String(city).trim(), $options: "i" };
    filter.$or = [
      { "address.city": cityRegex },
      { "address.areaName": cityRegex },
      { "address.district": cityRegex },
      { "address.streetAddress": cityRegex },
      { "address.landmark": cityRegex },
      { "address.formattedAddress": cityRegex },
      { city: cityRegex },
    ];
  }

  const hotels = await Hotel.find(filter)
    .select("name city address images rating numReviews isFeatured rank amenities")
    .sort({ isFeatured: -1, rank: 1, rating: -1, createdAt: -1 })
    .lean();

  const hotelIds = hotels.map((h: any) => h._id);

  const priceAgg = await RoomType.aggregate([
    {
      $match: {
        hotelId: { $in: hotelIds },
        isActive: true,
      },
    },
    {
      $group: {
        _id: "$hotelId",
        minPrice: {
          $min: {
            $cond: [
              { $gt: ["$discountPrice", 0] },
              "$discountPrice",
              "$basePrice",
            ],
          },
        },
      },
    },
  ]);

  const priceMap: Record<string, number> = {};
  priceAgg.forEach((p: any) => {
    priceMap[p._id.toString()] = p.minPrice;
  });

  const formattedHotels = hotels.map((hotel: any) => {
    const rawImg = hotel.images?.[0]?.url;
    const image = rawImg
      ? optimizeCloudinary(rawImg, "f_auto,q_auto,w_600,c_limit")
      : "/hotels/room1.png";

    return {
      _id: hotel._id,
      name: hotel.name,
      city: hotel.address?.city || hotel.city,
      country: hotel.address?.country || "India",
      address: hotel.address,
      rating: hotel.rating || 0,
      numReviews: hotel.numReviews || 0,
      amenities: (hotel.amenities || []).slice(0, 3).map(formatAmenityName),
      image,
      startingPrice: priceMap[hotel._id.toString()] || 0,
    };
  });

  const updatedHotels = await attachFavoriteFlag(formattedHotels, userId);

  // Active destination sections
  let sectionsWithItems: any[] = [];
  try {
    const activeSections = await PopularSection.find({
      category: "hotel",
      isActive: true,
    })
      .sort({ order: 1 })
      .lean();

    sectionsWithItems = activeSections
      .map((section: any) => {
        const matchingHotels = updatedHotels.filter((hotel: any) =>
          matchesSection(hotel, section)
        );

        const limit = Number(section.limit) || 12;
        const sliced = matchingHotels.slice(0, limit);

        const items = sliced.map((h: any) => ({
          id: h._id.toString(),
          _id: h._id.toString(),
          title: h.name,
          location: `${h.city}, ${h.country || "India"}`,
          image: h.image,
          href: `/hotels/${h._id.toString()}`,
          price: h.startingPrice ?? null,
          rating: h.rating,
          numReviews: h.numReviews,
          amenities: h.amenities,
          isFavorite: h.isFavorite,
        }));

        return {
          section: {
            _id: section._id.toString(),
            tagline: section.tagline,
            city: section.city,
            aliases: section.aliases || [],
            order: section.order,
            limit: section.limit,
          },
          items,
        };
      })
      .filter((s: any) => s.items.length > 0);
  } catch (err) {
    console.warn("Could not load popular sections:", err);
  }

  return {
    hotels: updatedHotels,
    sections: sectionsWithItems,
  };
};

export const getHotelDetails = async (hotelId: any, userId: any = null) => {
  await connectDB();
  const hotel = await Hotel.findOne({
    _id: hotelId,
    isActive: true,
    verificationStatus: "verified",
  }).lean();

  if (!hotel) throw new Error("Hotel not found");

  const roomTypes = await RoomType.find({
    hotelId,
    isActive: true,
  }).lean();

  let isFavorite = false;
  if (userId) {
    const favorite = await Favorite.findOne({
      user: userId,
      itemType: "hotel",
      itemId: hotel._id,
    }).select("_id");
    isFavorite = !!favorite;
  }

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const roomTypeIds = roomTypes.map((r) => r._id);

  const [todayAvailability, activeBookingsToday] = await Promise.all([
    Availability.find({
      roomTypeId: { $in: roomTypeIds },
      date: {
        $gte: new Date(todayStart.getTime() - 24 * 3600 * 1000),
        $lte: new Date(todayEnd.getTime() + 24 * 3600 * 1000),
      },
    }).lean(),
    Booking.find({
      hotelId,
      roomTypeId: { $in: roomTypeIds },
      status: { $in: ["confirmed", "checked_in", "staying"] },
      checkIn: { $lt: todayEnd },
      checkOut: { $gt: todayStart },
    })
      .select("roomTypeId roomsBooked")
      .lean(),
  ]);

  const availabilityMap: Record<string, any> = {};
  for (const doc of todayAvailability) {
    availabilityMap[doc.roomTypeId.toString()] = doc;
  }

  const activeBookingsCountMap: Record<string, number> = {};
  for (const b of activeBookingsToday) {
    const rId = b.roomTypeId.toString();
    activeBookingsCountMap[rId] =
      (activeBookingsCountMap[rId] || 0) + (b.roomsBooked || 1);
  }

  const optimizedHotelImages = (hotel.images || [])
    .map((img: any) =>
      optimizeCloudinary(img?.url, "f_auto,q_auto,w_1200,c_limit")
    )
    .filter(Boolean);

  return {
    _id: hotel._id,
    name: hotel.name,
    description: (hotel as any).description,
    address: hotel.address,
    city: hotel.city,
    location: hotel.location,
    images: optimizedHotelImages,
    amenities: hotel.amenities,
    rating: hotel.rating || 0,
    numReviews: hotel.numReviews || 0,
    isFavorite,
    roomTypes: roomTypes.map((room: any) => {
      const avail = availabilityMap[room._id.toString()];
      const activeCount = activeBookingsCountMap[room._id.toString()] || 0;
      const booked = activeCount;
      const blocked = avail?.blockedRooms || 0;
      const availableRooms = Math.max(room.totalRooms - booked - blocked, 0);

      const optimizedRoomImages = (room.images || [])
        .map((rImg: any) => {
          const u = typeof rImg === "string" ? rImg : rImg?.url;
          return optimizeCloudinary(u, "f_auto,q_auto,w_800,c_limit");
        })
        .filter(Boolean);

      return {
        _id: room._id,
        name: room.name,
        description: room.description,
        basePrice: room.basePrice,
        discountPrice: room.discountPrice,
        capacity: room.capacity,
        beds: room.beds,
        roomSizeSqm: room.roomSizeSqm,
        viewType: room.viewType,
        amenities: room.amenities,
        images: optimizedRoomImages,
        totalRooms: room.totalRooms,
        displayPrice:
          room.discountPrice && room.discountPrice > 0
            ? room.discountPrice
            : room.basePrice,
        availableRooms,
      };
    }),
  };
};

export const getHotelAvailability = async (
  hotelId: any,
  checkIn: any,
  checkOut: any,
  adults?: number,
  children?: number
) => {
  await connectDB();
  if (!checkIn || !checkOut) throw new Error("Check-in and check-out required");

  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(0, 0, 0, 0);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error("Invalid date format");
  }

  if (startDate >= endDate) throw new Error("Invalid date range");

  const nights = Math.max(
    1,
    Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  const hotel = await Hotel.findOne({
    _id: hotelId,
    isActive: true,
  }).lean();

  if (!hotel) throw new Error("Hotel not found");

  const roomTypes = await RoomType.find({
    hotelId,
    isActive: true,
  }).lean();

  if (!roomTypes.length) {
    return { roomTypes: [] };
  }

  const taxDoc = await Tax.findOne({ isActive: true }).lean();
  const taxPercentage = taxDoc?.taxPercentage || 0;

  const roomTypeIds = roomTypes.map((r) => r._id);

  const [availabilityDocs, activeBookings] = await Promise.all([
    Availability.find({
      roomTypeId: { $in: roomTypeIds },
      date: { $gte: startDate, $lt: endDate },
    }).lean(),
    Booking.find({
      hotelId,
      roomTypeId: { $in: roomTypeIds },
      status: { $in: ["confirmed", "checked_in", "staying"] },
      checkIn: { $lt: endDate },
      checkOut: { $gt: startDate },
    })
      .select("roomTypeId roomsBooked")
      .lean(),
  ]);

  const bookingCounts: Record<string, number> = {};
  activeBookings.forEach((b: any) => {
    const rid = b.roomTypeId.toString();
    bookingCounts[rid] = (bookingCounts[rid] || 0) + (b.roomsBooked || 1);
  });

  const formattedRoomTypes = roomTypes.map((room: any) => {
    const booked = bookingCounts[room._id.toString()] || 0;
    const availForRoom = availabilityDocs.filter(
      (a: any) => a.roomTypeId.toString() === room._id.toString()
    );
    const maxBlocked = availForRoom.reduce(
      (max: number, a: any) => Math.max(max, a.blockedRooms || 0),
      0
    );
    const availableRooms = Math.max(0, room.totalRooms - booked - maxBlocked);

    const pricePerNight =
      room.discountPrice && room.discountPrice > 0
        ? room.discountPrice
        : room.basePrice;

    const baseAmount = pricePerNight * nights;
    const taxAmount = Number(((baseAmount * taxPercentage) / 100).toFixed(2));
    const totalAmount = Number((baseAmount + taxAmount).toFixed(2));

    const optimizedRoomImages = (room.images || [])
      .map((rImg: any) => {
        const u = typeof rImg === "string" ? rImg : rImg?.url;
        return optimizeCloudinary(u, "f_auto,q_auto,w_800,c_limit");
      })
      .filter(Boolean);

    return {
      _id: room._id,
      name: room.name,
      description: room.description,
      basePrice: room.basePrice,
      discountPrice: room.discountPrice,
      pricePerNight,
      baseAmount,
      taxAmount,
      totalAmount,
      taxPercentage,
      capacity: room.capacity,
      beds: room.beds,
      roomSizeSqm: room.roomSizeSqm,
      viewType: room.viewType,
      amenities: room.amenities,
      images: optimizedRoomImages,
      totalRooms: room.totalRooms,
      availableRooms,
      isAvailable: availableRooms > 0,
      nights,
    };
  });

  return {
    hotelId,
    nights,
    checkIn: startDate.toISOString(),
    checkOut: endDate.toISOString(),
    roomTypes: formattedRoomTypes,
  };
};

export const getSuggestions = async (query: any) => {
  await connectDB();
  if (!query || String(query).trim().length < 2) {
    return [];
  }

  const cleanQuery = String(query).trim();
  const reg = { $regex: cleanQuery, $options: "i" };

  const results = await Hotel.find(
    {
      isActive: true,
      verificationStatus: "verified",
      $or: [
        { name: reg },
        { "address.city": reg },
        { "address.areaName": reg },
        { "address.district": reg },
        { "address.streetAddress": reg },
        { "address.landmark": reg },
        { "address.formattedAddress": reg },
        { "address.state": reg },
        { city: reg },
      ],
    },
    {
      name: 1,
      city: 1,
      address: 1,
    }
  )
    .limit(30)
    .lean();

  const locationMap = new Map();

  for (const hotel of results) {
    const city = hotel.address?.city || hotel.city || "";
    const state = hotel.address?.state || "";

    if (city) {
      const key = `city:${city.toLowerCase()}`;
      if (!locationMap.has(key)) {
        locationMap.set(key, {
          type: "city",
          value: city,
          label: [city, state].filter(Boolean).join(", "),
          city,
          state,
        });
      }
    }
  }

  return Array.from(locationMap.values());
};

export const searchHotels = async (query: any = {}, userId: any = null) => {
  return (await getAllHotels(query, userId)).hotels;
};

export const findNearbyHotels = async (
  lng: number,
  lat: number,
  radiusMeters: number = 2000,
  limit: number = 20,
  userId: any = null
) => {
  await connectDB();
  const validRadius = Math.min(Math.max(Number(radiusMeters) || 2000, 50), 50000);
  const validLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

  let hotels: any[] = [];
  try {
    hotels = await Hotel.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lng, lat],
          },
          key: "location",
          distanceField: "distance",
          maxDistance: validRadius,
          spherical: true,
          query: { isActive: true, verificationStatus: "verified" },
        },
      },
      { $limit: validLimit },
    ]);
  } catch {
    hotels = await Hotel.find({
      isActive: true,
      verificationStatus: "verified",
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: validRadius,
        },
      },
    })
      .limit(validLimit)
      .lean();
  }

  const hotelIds = hotels.map((h: any) => h._id);

  const priceAgg = await RoomType.aggregate([
    {
      $match: {
        hotelId: { $in: hotelIds },
        isActive: true,
      },
    },
    {
      $group: {
        _id: "$hotelId",
        minPrice: {
          $min: {
            $cond: [
              { $gt: ["$discountPrice", 0] },
              "$discountPrice",
              "$basePrice",
            ],
          },
        },
      },
    },
  ]);

  const priceMap: Record<string, number> = {};
  priceAgg.forEach((p: any) => {
    priceMap[p._id.toString()] = p.minPrice;
  });

  const formattedHotels = hotels.map((hotel: any) => {
    const rawImg = hotel.images?.[0]?.url;
    const image = rawImg
      ? optimizeCloudinary(rawImg, "f_auto,q_auto,w_600,c_limit")
      : "/hotels/room1.png";

    return {
      _id: hotel._id,
      name: hotel.name,
      city: hotel.address?.city || hotel.city,
      rating: hotel.rating || 0,
      numReviews: hotel.numReviews || 0,
      image,
      startingPrice: priceMap[hotel._id.toString()] || 0,
      distance: hotel.distance || 0,
    };
  });

  return await attachFavoriteFlag(formattedHotels, userId);
};

export const getRankedHotels = async (
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

  const filter: any = {
    rank,
    isActive: true,
    verificationStatus: "verified",
  };

  const total = await Hotel.countDocuments(filter);

  if (total === 0) {
    return { items: [], total: 0, page: pageNum, limit: limitNum, hasMore: false };
  }

  const hotels = await Hotel.find(filter)
    .select("name city address images advertisementImage rating numReviews isFeatured description")
    .sort({ isFeatured: -1, rating: -1, createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  const items = hotels.map((hotel: any) => {
    const rawUrl =
      hotel.advertisementImage?.url || hotel.images?.[0]?.url || null;
    return {
      _id: hotel._id,
      name: hotel.name,
      city: hotel.address?.city || hotel.city,
      rating: hotel.rating,
      numReviews: hotel.numReviews,
      description: hotel.description,
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
