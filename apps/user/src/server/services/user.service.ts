import { connectDB, User } from "@repo/database";

export const getUserProfile = async (userId: any) => {
  await connectDB();
  return await User.findById(userId).select("-otp -otpExpires -password").lean();
};

export const updateUserProfile = async (userId: any, updateData: any) => {
  await connectDB();
  if (updateData.email) {
    delete updateData.email;
  }
  return await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  )
    .select("-otp -otpExpires -password")
    .lean();
};

export const deleteAccountRequest = async (userId: any, body: any) => {
  await connectDB();
  const { reason } = body || {};

  const user = await User.findOne({
    _id: userId,
  });

  if (!user) {
    throw new Error("User not found");
  }

  if ((user as any).deleteRequest?.status === "pending") {
    throw new Error("Account deletion request already submitted");
  }

  (user as any).deleteRequest = {
    status: "pending",
    requestedAt: new Date(),
    reason: reason || "",
  };

  await user.save();

  return {
    message: "Account deletion request submitted successfully",
  };
};
