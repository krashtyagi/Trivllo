import { axiosApi } from "@/lib/axios";

export type BlogStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "PUBLISHED"
  | "REJECTED"
  | "ARCHIVED";

export interface BlogCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  postCount: number;
}

export interface BlogTag {
  _id: string;
  name: string;
  slug: string;
}

export interface BlogAuthor {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  bio?: string;
  designation?: string;
  postsCount: number;
}

export interface BlogSEO {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  schemaType?: string;
  focusKeyword?: string;
}

export interface BlogPost {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  imageAlt?: string;
  authorId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
  } | string;
  authorName?: string;
  status: BlogStatus;
  rejectionReason?: string;
  readingTime: number;
  isFeatured: boolean;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  categories: (BlogCategory | string)[];
  tags: (BlogTag | string)[];
  seo: BlogSEO;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogListResponse {
  posts: BlogPost[];
  metrics: {
    total: number;
    published: number;
    drafts: number;
    inReview: number;
    rejected: number;
    totalViews: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const blogService = {
  // ── Admin Posts APIs ──
  getAdminPosts: async (query?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
  }): Promise<BlogListResponse> => {
    const res = await axiosApi.get("admin/blogs/posts", { params: query });
    return {
      posts: res.data?.data || [],
      metrics: res.data?.metrics || {
        total: 0,
        published: 0,
        drafts: 0,
        inReview: 0,
        rejected: 0,
        totalViews: 0,
      },
      pagination: res.data?.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
      },
    };
  },

  getAdminPostById: async (id: string): Promise<BlogPost> => {
    const res = await axiosApi.get(`admin/blogs/posts/${id}`);
    return res.data?.data;
  },

  createPost: async (payload: Partial<BlogPost>): Promise<BlogPost> => {
    const res = await axiosApi.post("admin/blogs/posts", payload);
    return res.data?.data;
  },

  updatePost: async (id: string, payload: Partial<BlogPost>): Promise<BlogPost> => {
    const res = await axiosApi.patch(`admin/blogs/posts/${id}`, payload);
    return res.data?.data;
  },

  deletePost: async (id: string): Promise<boolean> => {
    await axiosApi.delete(`admin/blogs/posts/${id}`);
    return true;
  },

  // ── Publishing Workflow Transitions ──
  submitForReview: async (id: string): Promise<BlogPost> => {
    const res = await axiosApi.post(`admin/blogs/posts/${id}/submit`);
    return res.data?.data;
  },

  approvePost: async (id: string): Promise<BlogPost> => {
    const res = await axiosApi.post(`admin/blogs/posts/${id}/approve`);
    return res.data?.data;
  },

  rejectPost: async (id: string, reason: string): Promise<BlogPost> => {
    const res = await axiosApi.post(`admin/blogs/posts/${id}/reject`, { reason });
    return res.data?.data;
  },

  publishPost: async (id: string, scheduledAt?: string): Promise<BlogPost> => {
    const res = await axiosApi.post(`admin/blogs/posts/${id}/publish`, {
      scheduledAt,
    });
    return res.data?.data;
  },

  archivePost: async (id: string): Promise<BlogPost> => {
    const res = await axiosApi.post(`admin/blogs/posts/${id}/archive`);
    return res.data?.data;
  },

  getRevisions: async (postId: string): Promise<any[]> => {
    const res = await axiosApi.get(`admin/blogs/posts/${postId}/revisions`);
    return res.data?.data || [];
  },

  // ── Categories ──
  getCategories: async (): Promise<BlogCategory[]> => {
    const res = await axiosApi.get("admin/blogs/categories");
    return res.data?.data || [];
  },

  createCategory: async (payload: {
    name: string;
    slug?: string;
    description?: string;
    parentId?: string;
  }): Promise<BlogCategory> => {
    const res = await axiosApi.post("admin/blogs/categories", payload);
    return res.data?.data;
  },

  updateCategory: async (
    id: string,
    payload: { name?: string; slug?: string; description?: string }
  ): Promise<BlogCategory> => {
    const res = await axiosApi.patch(`admin/blogs/categories/${id}`, payload);
    return res.data?.data;
  },

  deleteCategory: async (id: string): Promise<boolean> => {
    await axiosApi.delete(`admin/blogs/categories/${id}`);
    return true;
  },

  // ── Tags ──
  getTags: async (): Promise<BlogTag[]> => {
    const res = await axiosApi.get("admin/blogs/tags");
    return res.data?.data || [];
  },

  createTag: async (name: string): Promise<BlogTag> => {
    const res = await axiosApi.post("admin/blogs/tags", { name });
    return res.data?.data;
  },

  deleteTag: async (id: string): Promise<boolean> => {
    await axiosApi.delete(`admin/blogs/tags/${id}`);
    return true;
  },

  // ── Writers & Invitations (RBAC) ──
  listAuthors: async (): Promise<{ profiles: any[]; teamUsers: any[] }> => {
    const res = await axiosApi.get("admin/blogs/authors");
    return res.data?.data || { profiles: [], teamUsers: [] };
  },

  createInvitation: async (email: string, role: string): Promise<any> => {
    const res = await axiosApi.post("admin/blogs/invitations", { email, role });
    return res.data;
  },

  listInvitations: async (): Promise<any[]> => {
    const res = await axiosApi.get("admin/blogs/invitations");
    return res.data?.data || [];
  },

  verifyInvitationToken: async (token: string): Promise<any> => {
    const res = await axiosApi.get(`blogs/invitations/verify?token=${token}`);
    return res.data?.data;
  },

  acceptInvitationToken: async (payload: {
    token: string;
    name?: string;
    password?: string;
  }): Promise<any> => {
    const res = await axiosApi.post("blogs/invitations/accept", payload);
    return res.data?.data;
  },
};
