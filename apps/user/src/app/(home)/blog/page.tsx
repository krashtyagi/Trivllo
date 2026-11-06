import React from "react";
import type { Metadata } from "next";
import { buildMetadata, generateBlogCollectionJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo.config";
import JsonLd from "@/components/seo/JsonLd";
import { getAllBlogPosts, getBlogCategories } from "@/lib/blog-data";
import BlogClient from "./blog-client";

export const metadata: Metadata = buildMetadata("blog");

export default async function BlogHubPage() {
  const posts = await getAllBlogPosts();
  const categories = await getBlogCategories();

  return (
    <>
      {/* ── Structured Data: Collection & Breadcrumbs ── */}
      <JsonLd
        data={generateBreadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
        ])}
      />
      <JsonLd data={generateBlogCollectionJsonLd(posts)} />

      {/* ── Interactive Blog Client with Instant Filtering ── */}
      <BlogClient initialPosts={posts} categories={categories} />
    </>
  );
}
