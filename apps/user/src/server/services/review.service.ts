import {
  connectDB,
  Review,
  Booking,
  GenericBooking,
  Hotel,
  Adventure,
  Bike as BikeCompany,
  Cab as CabCompany,
  Tour as TourCompany,
  Service as AdventureService,
  BikeService,
  CabService,
  TourService,
} from "@repo/database";
import mongoose from "mongoose";

export const updateCompanyRating = async (
  companyType: string,
  companyId: any
) => {
  try {
    const companyObjectId = mongoose.Types.ObjectId.isValid(companyId)
      ? new mongoose.Types.ObjectId(companyId)
      : companyId;

    const stats = await Review.aggregate([
      {
        $match: {
          companyType,
          $or: [
            { companyId: companyObjectId },
            { companyId: String(companyId) },
          ],
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const averageRating = stats[0]?.averageRating || 0;
    const totalReviews = stats[0]?.totalReviews || 0;

    switch (companyType) {
      case "hotel":
        await Hotel.findByIdAndUpdate(companyId, {
          rating: Number(averageRating.toFixed(1)),
          numReviews: totalReviews,
        });
        break;

      case "adventure":
        await Adventure.findByIdAndUpdate(companyId, {
          rating: {
            average: Number(averageRating.toFixed(1)),
            count: totalReviews,
          },
        });
        break;

      case "bike":
        await BikeCompany.findByIdAndUpdate(companyId, {
          rating: {
            average: Number(averageRating.toFixed(1)),
            count: totalReviews,
          },
        });
        break;

      case "cab":
        await CabCompany.findByIdAndUpdate(companyId, {
          rating: {
            average: Number(averageRating.toFixed(1)),
            count: totalReviews,
          },
        });
        break;

      case "tour":
        await TourCompany.findByIdAndUpdate(companyId, {
          rating: {
            average: Number(averageRating.toFixed(1)),
            count: totalReviews,
          },
        });
        break;

      default:
        break;
    }
  } catch (error) {
    console.error("updateCompanyRating error:", error);
  }
};

export const getCompanyReviews = async (
  companyType: string,
  companyId: string,
  query: any = {}
) => {
  await connectDB();
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Number(query.limit) || 10);
  const skip = (page - 1) * limit;

  const companyObjectId = mongoose.Types.ObjectId.isValid(companyId)
    ? new mongoose.Types.ObjectId(companyId)
    : companyId;

  const matchCompany: any = {
    companyType,
    $or: [{ companyId: companyObjectId }, { companyId: String(companyId) }],
  };

  const [reviews, total, statsAgg] = await Promise.all([
    Review.find(matchCompany)
      .populate("userId", "firstName lastName avatar name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(matchCompany),
    Review.aggregate([
      { $match: matchCompany },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          avgFacilities: { $avg: "$breakdown.facilities" },
          avgCleanliness: { $avg: "$breakdown.cleanliness" },
          avgServices: { $avg: "$breakdown.services" },
          avgComfort: { $avg: "$breakdown.comfort" },
          avgLocation: { $avg: "$breakdown.location" },
        },
      },
    ]),
  ]);

  const stats = statsAgg[0]
    ? {
        averageRating: Number(statsAgg[0].averageRating.toFixed(1)),
        totalReviews: statsAgg[0].totalReviews,
        breakdown: {
          facilities: Number((statsAgg[0].avgFacilities || 0).toFixed(1)),
          cleanliness: Number((statsAgg[0].avgCleanliness || 0).toFixed(1)),
          services: Number((statsAgg[0].avgServices || 0).toFixed(1)),
          comfort: Number((statsAgg[0].avgComfort || 0).toFixed(1)),
          location: Number((statsAgg[0].avgLocation || 0).toFixed(1)),
        },
      }
    : { averageRating: 0, totalReviews: 0 };

  return {
    reviews,
    total,
    stats,
    summary: stats,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getUserReviews = async (userId: any) => {
  await connectDB();
  const userObjId = new mongoose.Types.ObjectId(userId);

  const submittedReviews = await Review.find({ userId: userObjId })
    .sort({ createdAt: -1 })
    .lean();

  const reviewedBookingIds = submittedReviews.map((r: any) =>
    r.bookingId ? r.bookingId.toString() : ""
  );

  const hotelBookings: any[] = await Booking.find({
    userId: userObjId,
    status: { $in: ["completed", "checked_out"] },
  })
    .populate("hotelId", "name images rating")
    .lean();

  const genericBookings: any[] = await GenericBooking.find({
    userId: userObjId,
    status: { $in: ["completed", "checked_out"] },
  }).lean();

  const pendingHotelReviews = hotelBookings
    .filter(
      (b: any) => !reviewedBookingIds.includes(b._id.toString())
    )
    .map((b: any) => ({
      bookingId: b._id,
      companyId: b.hotelId?._id,
      companyType: "hotel",
      companyName: b.hotelId?.name || "Hotel",
      companyImage: b.hotelId?.images?.[0]?.url || "",
      bookingReference: b.bookingReference,
      bookingDate: b.createdAt,
    }));

  const pendingGenericReviews = genericBookings
    .filter(
      (b: any) => !reviewedBookingIds.includes(b._id.toString())
    )
    .map((b: any) => ({
      bookingId: b._id,
      companyId: b.serviceId,
      companyType: b.serviceType,
      bookingReference: b.bookingReference,
      bookingDate: b.bookingDate || b.createdAt,
    }));

  return {
    pendingReviews: [...pendingHotelReviews, ...pendingGenericReviews],
    submittedReviews,
  };
};

export const createReview = async (userId: any, body: any) => {
  await connectDB();
  const { bookingId, rating, comment, breakdown } = body;

  if (!bookingId) {
    throw new Error("Booking ID is required");
  }

  if (!rating || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  if (!comment?.trim()) {
    throw new Error("Comment is required");
  }

  const existingReview = await Review.findOne({ bookingId });
  if (existingReview) {
    throw new Error("Review already submitted");
  }

  const userObjId = new mongoose.Types.ObjectId(userId);

  // Check Hotel Booking
  const hotelBooking = await Booking.findOne({
    _id: bookingId,
    userId: userObjId,
    status: { $in: ["completed", "checked_out"] },
  });

  if (hotelBooking) {
    const hotel = await Hotel.findById(hotelBooking.hotelId);
    if (!hotel) {
      throw new Error("Hotel not found");
    }

    const review = await Review.create({
      userId: userObjId,
      bookingId,
      companyId: hotel._id,
      companyName: hotel.name,
      companyType: "hotel",
      vendorId: hotel.vendorId,
      rating,
      comment,
      ...(breakdown && { breakdown }),
    });

    await updateCompanyRating("hotel", hotel._id);

    return {
      message: "Review submitted successfully",
      review,
    };
  }

  // Check Generic Booking
  const booking: any = await GenericBooking.findOne({
    _id: bookingId,
    userId: userObjId,
    status: { $in: ["completed", "checked_out"] },
  });

  if (!booking) {
    throw new Error("Completed or checked-out booking not found");
  }

  let companyId: any;
  let vendorId: any;
  let companyName: any;

  switch (booking.serviceType) {
    case "adventure": {
      const service: any = await AdventureService.findById(booking.serviceId);
      if (!service) throw new Error("Adventure service not found");
      const adventure = await Adventure.findById(service.adventure);
      if (!adventure) throw new Error("Adventure company not found");
      companyId = adventure._id;
      companyName = adventure.name;
      vendorId = adventure.vendorId;
      break;
    }

    case "bike": {
      const service: any = await BikeService.findById(booking.serviceId);
      if (!service) throw new Error("Bike service not found");
      const bike = await BikeCompany.findById(service.bike);
      if (!bike) throw new Error("Bike company not found");
      companyId = bike._id;
      companyName = bike.name;
      vendorId = bike.vendorId;
      break;
    }

    case "cab": {
      const service: any = await CabService.findById(booking.serviceId);
      if (!service) throw new Error("Cab service not found");
      const cab = await CabCompany.findById(service.cab);
      if (!cab) throw new Error("Cab company not found");
      companyId = cab._id;
      companyName = cab.name;
      vendorId = cab.vendorId;
      break;
    }

    case "tour": {
      const service: any = await TourService.findById(booking.serviceId);
      if (!service) throw new Error("Tour service not found");
      const tour = await TourCompany.findById(service.tour);
      if (!tour) throw new Error("Tour company not found");
      companyId = tour._id;
      companyName = tour.name;
      vendorId = tour.vendorId;
      break;
    }

    default:
      throw new Error("Invalid service type");
  }

  const review = await Review.create({
    userId: userObjId,
    bookingId,
    companyId,
    companyName,
    companyType: booking.serviceType,
    vendorId,
    rating,
    comment,
    ...(breakdown && { breakdown }),
  });

  await updateCompanyRating(booking.serviceType, companyId);

  return {
    message: "Review submitted successfully",
    review,
  };
};

export const updateReview = async (userId: any, reviewId: any, body: any) => {
  await connectDB();
  const { rating, comment, breakdown } = body;
  const userObjId = new mongoose.Types.ObjectId(userId);

  const review = await Review.findOne({
    _id: reviewId,
    userId: userObjId,
  });

  if (!review) {
    throw new Error("Review not found");
  }

  if (review.vendorReply?.message) {
    throw new Error("Review cannot be updated after vendor reply");
  }

  if (rating !== undefined && (rating < 1 || rating > 5)) {
    throw new Error("Rating must be between 1 and 5");
  }

  if (comment !== undefined && (!comment || !comment.trim())) {
    throw new Error("Comment cannot be empty");
  }

  if (rating) {
    review.rating = rating;
  }

  if (comment !== undefined) {
    review.comment = comment;
  }

  if (breakdown) {
    review.breakdown = breakdown;
  }

  await review.save();
  await updateCompanyRating(review.companyType, review.companyId);

  return {
    message: "Review updated successfully",
    review,
  };
};
