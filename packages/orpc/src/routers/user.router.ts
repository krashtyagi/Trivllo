import { UpdateUserProfileSchema } from "@repo/types";
import { User, Favorite, Support } from "@repo/database";
import { authProcedure, ORPCError } from "../server/procedures";
import { z } from "zod";

export const userRouter = {
  getMe: authProcedure.query(async ({ ctx }) => {
    const user = await User.findById(ctx.user.id).select("-password").lean();
    if (!user) throw new ORPCError("User not found", "NOT_FOUND");
    return user;
  }),

  updateProfile: authProcedure
    .input(UpdateUserProfileSchema)
    .mutation(async ({ input, ctx }) => {
      const user = await User.findByIdAndUpdate(ctx.user.id, input, { new: true }).select("-password");
      return { success: true, user };
    }),

  getFavorites: authProcedure.query(async ({ ctx }) => {
    const favorites = await Favorite.find({ user: ctx.user.id, itemType: "hotel" })
      .populate("itemId")
      .lean();
    return favorites;
  }),

  toggleFavorite: authProcedure
    .input(z.object({ hotelId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const existing = await Favorite.findOne({ user: ctx.user.id, itemId: input.hotelId, itemType: "hotel" });
      if (existing) {
        await Favorite.findByIdAndDelete(existing._id);
        return { isFavorite: false };
      }
      await Favorite.create({ user: ctx.user.id, itemId: input.hotelId, itemType: "hotel" });
      return { isFavorite: true };
    }),
};

