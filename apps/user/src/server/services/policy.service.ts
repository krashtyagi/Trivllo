import { connectDB, Policy } from "@repo/database";

export const getPolicyByHotel = async (hotelId: string) => {
  await connectDB();
  const policy = await Policy.findOne({ hotelId }).lean();
  return policy || {};
};

