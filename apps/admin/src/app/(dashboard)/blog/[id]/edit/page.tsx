"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { blogService, BlogPost } from "@/services/blog.service";
import { BlogEditor } from "../../_components/blog-editor";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EditBlogPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await blogService.getAdminPostById(id);
        setPost(data);
      } catch (err: any) {
        toast.error("Failed to load article from database");
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="text-sm">Fetching article from MongoDB...</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <h2 className="text-xl font-bold text-foreground">Article Not Found</h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          The requested article (ID: {id}) could not be located in your database.
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to All Articles</span>
        </Link>
      </div>
    );
  }

  return <BlogEditor initialPost={post} isEdit={true} />;
}
