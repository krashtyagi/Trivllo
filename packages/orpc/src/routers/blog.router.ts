import {
  CreateBlogPostSchema,
  UpdateBlogPostSchema,
  BlogQueryFilterSchema,
  BlogCategorySchema,
  BlogMediaUploadSchema,
} from "@repo/types";
import { Post, Category, Tag, Media, Revision } from "@repo/database";
import { blogEditorProcedure, publicProcedure, ORPCError } from "../server/procedures";
import { z } from "zod";

export const blogRouter = {
  // Public queries
  getPublishedPosts: publicProcedure
    .input(BlogQueryFilterSchema)
    .query(async ({ input }) => {
      const query: Record<string, any> = { status: "published" };
      if (input.categoryId) query.category = input.categoryId;
      if (input.search) query.title = { $regex: input.search, $options: "i" };

      const total = await Post.countDocuments(query);
      const posts = await Post.find(query)
        .populate("category", "name slug")
        .populate("author", "name avatar bio")
        .sort({ [input.sortBy]: input.sortOrder === "desc" ? -1 : 1 })
        .skip((input.page - 1) * input.limit)
        .limit(input.limit)
        .lean();

      return {
        posts,
        pagination: {
          total,
          page: input.page,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  getPostBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const post = await Post.findOne({ slug: input.slug, status: "published" })
        .populate("category", "name slug")
        .populate("author", "name avatar bio")
        .lean();

      if (!post) {
        throw new ORPCError("Blog post not found", "NOT_FOUND");
      }

      // Increment views asynchronously
      await Post.updateOne({ _id: post._id }, { $inc: { views: 1 } });

      return post;
    }),

  // Employee: Blog Editor Procedures
  getEditorPosts: blogEditorProcedure
    .input(BlogQueryFilterSchema)
    .query(async ({ input, ctx }) => {
      const query: Record<string, any> = {};
      if (input.status) query.status = input.status;
      if (input.categoryId) query.category = input.categoryId;
      if (input.search) query.title = { $regex: input.search, $options: "i" };

      // If user is author only, restrict to own posts
      if (ctx.employeeRole === "blog_author") {
        query.author = ctx.user.id;
      }

      const total = await Post.countDocuments(query);
      const posts = await Post.find(query)
        .populate("category", "name slug")
        .populate("author", "name email")
        .sort({ [input.sortBy]: input.sortOrder === "desc" ? -1 : 1 })
        .skip((input.page - 1) * input.limit)
        .limit(input.limit)
        .lean();

      return {
        posts,
        pagination: {
          total,
          page: input.page,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  createPost: blogEditorProcedure
    .input(CreateBlogPostSchema)
    .mutation(async ({ input, ctx }) => {
      const existing = await Post.findOne({ slug: input.slug });
      if (existing) {
        throw new ORPCError("A blog post with this slug already exists", "BAD_REQUEST");
      }

      const post = await Post.create({
        ...input,
        author: input.authorId || ctx.user.id,
        category: input.categoryId,
        publishedAt: input.status === "published" ? new Date() : undefined,
      });

      return { success: true, post };
    }),

  updatePost: blogEditorProcedure
    .input(UpdateBlogPostSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, revisionNote, ...data } = input;
      const post = await Post.findById(id);

      if (!post) {
        throw new ORPCError("Post not found", "NOT_FOUND");
      }

      // Authors can only edit their own draft/rejected posts
      if (ctx.employeeRole === "blog_author" && post.author?.toString() !== ctx.user.id) {
        throw new ORPCError("You can only edit your own posts", "FORBIDDEN");
      }

      // Create a revision snapshot before updating
      if (revisionNote) {
        await Revision.create({
          post: id,
          content: post.content,
          title: post.title,
          editor: ctx.user.id,
          note: revisionNote,
        });
      }

      const updated = await Post.findByIdAndUpdate(
        id,
        {
          ...data,
          updatedAt: new Date(),
          ...(data.status === "published" && !post.publishedAt ? { publishedAt: new Date() } : {}),
        },
        { new: true }
      ).lean();

      return { success: true, post: updated };
    }),

  deletePost: blogEditorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const post = await Post.findById(input.id);
      if (!post) throw new ORPCError("Post not found", "NOT_FOUND");

      if (ctx.employeeRole === "blog_author") {
        throw new ORPCError("Only blog editors and admins can delete posts", "FORBIDDEN");
      }

      await Post.findByIdAndDelete(input.id);
      return { success: true, message: "Post deleted" };
    }),

  // Categories management
  getCategories: publicProcedure.query(async () => {
    return await Category.find().lean();
  }),

  createCategory: blogEditorProcedure
    .input(BlogCategorySchema)
    .mutation(async ({ input }) => {
      const cat = await Category.create(input);
      return { success: true, category: cat };
    }),
};

