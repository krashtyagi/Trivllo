import {
  connectDB,
  GenericBooking,
  TourService,
  Tax,
  Payment,
} from "@repo/database";
import crypto from "crypto";

async function createRazorpayOrder(amountInPaise: number, receipt: string) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
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

export const createServiceBooking = async (data: any, userId: any = null) => {
  await connectDB();
  const {
    serviceType,
    serviceId,
    bookingDate,
    timeSlot,
    primaryCustomer,
    participants = [],
    meta = {},
  } = data;

  if (!serviceType || !serviceId || !bookingDate) {
    throw new Error("serviceType, serviceId and bookingDate are required");
  }

  let service: any;
  let vendorId: any;

  if (serviceType === "tour") {
    service = await TourService.findById(serviceId)
      .populate("tour", "vendorId")
      .lean();
    vendorId = (service?.tour as any)?.vendorId;
  }

  if (!service || !service.isActive) {
    throw new Error("Service not available");
  }

  const taxDoc = await Tax.findOne({ isActive: true }).lean();
  const taxPercentage = taxDoc?.taxPercentage || 0;

  const effectivePrice =
    service.discountPrice && service.discountPrice > 0
      ? service.discountPrice
      : service.basePrice || 0;

  const quantity = participants.length || 1;
  const baseAmount = effectivePrice * quantity;
  const taxAmount = Number(((baseAmount * taxPercentage) / 100).toFixed(2));
  const totalAmount = Number((baseAmount + taxAmount).toFixed(2));

  const bookingReference =
    "SBK-" + crypto.randomBytes(6).toString("hex").toUpperCase();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const razorpayOrder = await createRazorpayOrder(
    Math.round(totalAmount * 100),
    bookingReference
  );

  const booking = await GenericBooking.create({
    userId: userId || undefined,
    vendorId,
    serviceType,
    serviceId,
    bookingReference,
    bookingDate: new Date(bookingDate),
    timeSlot,
    primaryCustomer: primaryCustomer || {
      firstName: "Guest",
      lastName: "User",
      email: "guest@trivllo.com",
      phoneNumber: "9999999999",
    },
    participants,
    pricing: {
      baseAmount,
      taxAmount,
      taxPercentage,
      totalAmount,
      discountAmount: 0,
    },
    serviceSnapshot: {
      title: service.title,
      price: effectivePrice,
      vendorId,
    },
    meta,
    status: "pending",
    paymentStatus: "pending",
    expiresAt,
  });

  return {
    booking,
    razorpayOrder,
  };
};

export const verifyServicePayment = async (data: {
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

  // Update GenericBooking
  await GenericBooking.findOneAndUpdate(
    { bookingReference: { $exists: true } },
    {
      status: "confirmed",
      paymentStatus: "paid",
      paymentDetails: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        paidAt: new Date(),
      },
    }
  );

  return { success: true, message: "Payment verified successfully" };
};

