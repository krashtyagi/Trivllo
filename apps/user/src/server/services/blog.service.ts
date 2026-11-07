import {
  connectDB,
  Post as BlogPost,
  Category as BlogCategory,
  Tag as BlogTag,
  Redirect as BlogRedirect,
  Author as BlogAuthorProfile,
} from "@repo/database";

export const getPublicPosts = async (query: {
  page?: number | string;
  limit?: number | string;
  category?: string;
  tag?: string;
  search?: string;
  featured?: boolean | string;
} = {}) => {
  await connectDB();
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(50, Number(query.limit) || 10));
  const skip = (page - 1) * limit;

  const filter: any = {
    status: "PUBLISHED",
    deletedAt: null,
  };

  if (query.featured === true || query.featured === "true") {
    filter.isFeatured = true;
  }

  if (query.category) {
    const cat = await BlogCategory.findOne({ slug: query.category });
    if (cat) filter.categories = cat._id;
  }

  if (query.tag) {
    const t = await BlogTag.findOne({ slug: query.tag });
    if (t) filter.tags = t._id;
  }

  if (query.search) {
    filter.title = { $regex: query.search, $options: "i" };
  }

  const [posts, total] = await Promise.all([
    BlogPost.find(filter)
      .sort({ isFeatured: -1, publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("categories", "name slug")
      .populate("tags", "name slug")
      .populate("authorId", "firstName lastName avatar email")
      .lean(),
    BlogPost.countDocuments(filter),
  ]);

  return {
    posts,
    data: posts,
    total,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getPublicPostBySlug = async (slug: string) => {
  await connectDB();
  const redirect = await BlogRedirect.findOne({ oldPath: `/blog/${slug}` });
  if (redirect) {
    return { redirect: redirect.newPath, statusCode: redirect.statusCode };
  }

  const post: any = await BlogPost.findOne({
    slug,
    status: "PUBLISHED",
    deletedAt: null,
  })
    .populate("categories", "name slug description")
    .populate("tags", "name slug")
    .populate("authorId", "firstName lastName avatar email")
    .lean();

  if (!post) return null;

  const authorProfile = await BlogAuthorProfile.findOne({
    userId: post.authorId?._id || post.authorId,
  }).lean();

  const relatedPosts = await BlogPost.find({
    _id: { $ne: post._id },
    status: "PUBLISHED",
    deletedAt: null,
    categories: { $in: post.categories },
  })
    .limit(3)
    .select("title slug excerpt featuredImage readingTime publishedAt")
    .lean();

  return {
    ...post,
    post,
    authorProfile,
    relatedPosts,
  };
};

export const getPublicCategories = async () => {
  await connectDB();
  return await BlogCategory.find().sort({ postCount: -1, name: 1 }).lean();
};

