export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: "Hotels" | "Tour Guides" | "Weekend Trips" | "Travel Tips";
  readTime: string;
  publishedAt: string;
  updatedAt: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  tags: string[];
  featured?: boolean;
  relatedService?: {
    type: "hotel" | "tour";
    query: string;
    label: string;
    ctaText: string;
  };
  content: {
    introduction: string;
    sections: {
      heading: string;
      subheading?: string;
      body: string[];
      highlightBox?: string;
      bulletPoints?: string[];
    }[];
    conclusion: string;
  };
};

export const BLOG_POSTS: BlogPost[] = [];

const getApiUrl = () => {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const trimmed = raw.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
};

function parseMarkdownToSections(raw: string) {
  if (!raw) {
    return {
      introduction: "",
      sections: [],
      conclusion: "Book verified hotels and tours directly on Trivllo with instant confirmation.",
    };
  }
  const parts = raw.split(/^## /m);
  const introduction = parts[0]?.trim() || "";
  const sections = parts.slice(1).map((part) => {
    const lines = part.split("\n");
    const heading = lines[0]?.trim() || "";
    const bodyLines = lines
      .slice(1)
      .join("\n")
      .split("\n\n")
      .map((p) => p.trim())
      .filter(Boolean);
    return {
      heading,
      body: bodyLines,
    };
  });
  return {
    introduction,
    sections,
    conclusion: "Book verified hotels and tours directly on Trivllo with instant confirmation.",
  };
}

function mapDbPostToBlogPost(dbPost: any): BlogPost {
  const author = typeof dbPost.authorId === "object" ? dbPost.authorId : null;
  const authorName = author
    ? `${author.firstName || ""} ${author.lastName || ""}`.trim() || author.email || "Trivllo Editorial"
    : "Trivllo Editorial";

  const firstCat =
    dbPost.categories && dbPost.categories.length > 0
      ? typeof dbPost.categories[0] === "object"
        ? dbPost.categories[0].name
        : "Hotels"
      : "Hotels";

  return {
    slug: dbPost.slug,
    title: dbPost.title,
    excerpt: dbPost.excerpt || "",
    coverImage:
      dbPost.featuredImage ||
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    category: firstCat as any,
    readTime: `${dbPost.readingTime || 4} min read`,
    publishedAt: dbPost.publishedAt
      ? new Date(dbPost.publishedAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    updatedAt: dbPost.updatedAt
      ? new Date(dbPost.updatedAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    featured: dbPost.isFeatured,
    author: {
      name: authorName,
      role: "Verified Author",
      avatar:
        author?.avatar ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    tags:
      dbPost.tags?.map((t: any) => (typeof t === "object" ? t.name : t)) || [
        "Hotels",
        "Travel",
      ],
    content: parseMarkdownToSections(dbPost.content || ""),
  };
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${getApiUrl()}/blogs?limit=50`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        return json.data.map(mapDbPostToBlogPost);
      }
    }
  } catch {
    // fallback gracefully
  }
  return [];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  try {
    const res = await fetch(`${getApiUrl()}/blogs/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        return mapDbPostToBlogPost(json.data);
      }
    }
  } catch {
    // fallback gracefully
  }
  return undefined;
}

export async function getRelatedPosts(currentSlug: string, category: string, limit = 3): Promise<BlogPost[]> {
  const allPosts = await getAllBlogPosts();
  return allPosts
    .filter((p) => p.slug !== currentSlug)
    .sort((a, b) => {
      if (a.category === category && b.category !== category) return -1;
      if (b.category === category && a.category !== category) return 1;
      return 0;
    })
    .slice(0, limit);
}

export async function getBlogCategories(): Promise<string[]> {
  try {
    const res = await fetch(`${getApiUrl()}/blogs/categories`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        return ["All", ...json.data.map((c: any) => c.name)];
      }
    }
  } catch {
    // fallback
  }
  return ["All", "Hotels", "Tour Guides", "Weekend Trips", "Travel Tips", "Destinations"];
}
