import {
  connectDB,
  Booking,
  Hotel,
  RoomType,
  Payment,
  Tax,
  User,
  Availability,
} from "@repo/database";
import crypto from "crypto";

async function createRazorpayOrder(amountInPaise: number, receipt: string) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    // Return dummy order if keys are not set in dev
    return {
      id: "order_" + crypto.randomBytes(8).toString("hex"),
      amount: amountInPaise,
      currency: "INR",
      receipt,
    };
  }

  const authHeader =
    "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: "INR",
      receipt,
    }),
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(
      `Razorpay Order Failed: ${errData.error?.description || response.statusText}`
    );
  }

  return await response.json();
}

export const createBooking = async (data: any, userId: any = null) => {
  await connectDB();
  const {
    hotelId,
    roomTypeId,
    checkIn,
    checkOut,
    guests,
    roomsBooked = 1,
    primaryGuest,
    additionalGuests = [],
  } = data;

  if (!checkIn || !checkOut) {
    throw new Error("Check-in and Check-out dates are required");
  }

  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  if (startDate >= endDate) {
    throw new Error("Invalid check-in/check-out dates");
  }

  const nights = Math.max(
    1,
    Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  const hotel = await Hotel.findById(hotelId);
  if (!hotel || !hotel.isActive) throw new Error("Hotel not available");

  const roomType = await RoomType.findById(roomTypeId);
  if (!roomType || !roomType.isActive) throw new Error("Room type not available");

  const taxDoc = await Tax.findOne({ isActive: true }).lean();
  const taxPercentage = taxDoc?.taxPercentage || 0;

  const pricePerNight =
    roomType.discountPrice && roomType.discountPrice > 0
      ? roomType.discountPrice
      : roomType.basePrice;

  const totalBasePrice = pricePerNight * roomsBooked * nights;
  const totalTax = Number(((totalBasePrice * taxPercentage) / 100).toFixed(2));
  const finalTotalAmount = Number((totalBasePrice + totalTax).toFixed(2));

  const bookingReference =
    "BK-" + crypto.randomBytes(6).toString("hex").toUpperCase();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  const razorpayOrder = await createRazorpayOrder(
    Math.round(finalTotalAmount * 100),
    bookingReference
  );

  const booking = await Booking.create({
    userId: userId || undefined,
    hotelId,
    roomTypeId,
    bookingReference,
    checkIn: startDate,
    checkOut: endDate,
    nights,
    guests: guests || { adults: 1, children: 0 },
    roomsBooked,
    primaryGuest: primaryGuest || {
      firstName: "Guest",
      lastName: "User",
      email: "guest@trivllo.com",
      phoneNumber: "9999999999",
    },
    additionalGuests,
    pricePerNight,
    taxAmount: totalTax,
    totalAmount: finalTotalAmount,
    status: "pending",
    paymentStatus: "pending",
    expiresAt,
  });

  const payment = await Payment.create({
    bookingId: booking._id,
    userId: userId || undefined,
    razorpayOrderId: razorpayOrder.id,
    amountPaid: finalTotalAmount,
    status: "created",
    expiresAt,
  });

  booking.paymentId = payment._id;
  await booking.save();

  return {
    booking,
    razorpayOrder,
  };
};

export const verifyPayment = async (data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => {
  await connectDB();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (keySecret) {
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new Error("Invalid payment signature");
    }
  }

  const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
  if (payment) {
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "captured";
    await payment.save();

    await Booking.findByIdAndUpdate(payment.bookingId, {
      status: "confirmed",
      paymentStatus: "paid",
    });
  }

  return { success: true, message: "Payment verified successfully" };
};

export const getUserBookings = async (userId: any) => {
  await connectDB();
  return await Booking.find({ userId })
    .populate("hotelId", "name address city images")
    .populate("roomTypeId", "name images")
    .sort({ createdAt: -1 })
    .lean();
};

export const getBookingById = async (id: string, userId: any = null) => {
  await connectDB();
  const filter: any = { _id: id };
  if (userId) filter.userId = userId;

  return await Booking.findOne(filter)
    .populate("hotelId", "name address city images rating")
    .populate("roomTypeId", "name basePrice discountPrice images")
    .lean();
};

export const cancelBooking = async (id: string, userId: any = null) => {
  await connectDB();
  const filter: any = { _id: id };
  if (userId) filter.userId = userId;

  return await Booking.findOneAndUpdate(
    filter,
    { status: "cancelled" },
    { new: true }
  ).lean();
};

