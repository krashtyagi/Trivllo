"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  blogService,
  BlogPost,
  BlogCategory,
  BlogTag,
  BlogStatus,
} from "@/services/blog.service";
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  Globe,
  Image as ImageIcon,
  Smartphone,
  Monitor,
  Hotel,
  Heading1,
  Heading2,
  Bold,
  Italic,
  List,
  Quote,
  Loader2,
} from "lucide-react";

interface BlogEditorProps {
  initialPost?: BlogPost;
  isEdit?: boolean;
}

export function BlogEditor({ initialPost, isEdit = false }: BlogEditorProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);

  // Form states
  const [title, setTitle] = useState(initialPost?.title || "");
  const [slug, setSlug] = useState(initialPost?.slug || "");
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || "");
  const [content, setContent] = useState(initialPost?.content || "");
  const [featuredImage, setFeaturedImage] = useState(
    initialPost?.featuredImage ||
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&auto=format&fit=crop&q=80"
  );
  const [imageAlt, setImageAlt] = useState(initialPost?.imageAlt || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialPost?.categories && initialPost.categories.length > 0
      ? typeof initialPost.categories[0] === "object"
        ? (initialPost.categories[0] as any)._id
        : (initialPost.categories[0] as string)
      : ""
  );
  const [status, setStatus] = useState<BlogStatus>(
    initialPost?.status || "DRAFT"
  );
  const [isFeatured, setIsFeatured] = useState<boolean>(
    initialPost?.isFeatured || false
  );
  const [tagsInput, setTagsInput] = useState(
    initialPost?.tags
      ? initialPost.tags
          .map((t) => (typeof t === "object" ? (t as any).name : t))
          .join(", ")
      : "Hotels, Travel Guides"
  );

  // SEO fields
  const [metaTitle, setMetaTitle] = useState(
    initialPost?.seo?.metaTitle || ""
  );
  const [metaDescription, setMetaDescription] = useState(
    initialPost?.seo?.metaDescription || ""
  );
  const [focusKeyword, setFocusKeyword] = useState(
    initialPost?.seo?.focusKeyword || ""
  );
  const [canonicalUrl, setCanonicalUrl] = useState(
    initialPost?.seo?.canonicalUrl || ""
  );

  // Preview tab & SERP device toggle
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [serpDevice, setSerpDevice] = useState<"desktop" | "mobile">("mobile");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [cats, tgs] = await Promise.all([
          blogService.getCategories(),
          blogService.getTags(),
        ]);
        setCategories(cats);
        setTags(tgs);

        if (!selectedCategoryId && cats.length > 0) {
          setSelectedCategoryId(cats[0]._id);
        }
      } catch (err: any) {
        toast.error("Failed to load categories/tags from database");
      }
    }
    loadMeta();
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit || !slug) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generatedSlug);

      if (!metaTitle) {
        setMetaTitle(`${val} | Trivllo`);
      }
    }
  };

  const sampleImages = [
    {
      label: "Luxury Resort Pool",
      url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&auto=format&fit=crop&q=80",
      alt: "Luxury hotel swimming pool and suites",
    },
    {
      label: "Heritage Palace & Lake",
      url: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1000&auto=format&fit=crop&q=80",
      alt: "Historic royal palace on lake",
    },
    {
      label: "Mountain Retreat",
      url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1000&auto=format&fit=crop&q=80",
      alt: "Scenic mountain hotel stay",
    },
  ];

  const insertText = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById(
      "blog-content-area"
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end) || "text";
    const replacement = `${prefix}${selected}${suffix}`;
    const newContent =
      content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selected.length
      );
    }, 50);
  };

  const handleSave = async (targetStatus?: BlogStatus) => {
    if (!title.trim()) {
      toast.error("Please enter an article title");
      return;
    }
    if (!content.trim()) {
      toast.error("Please provide article content");
      return;
    }

    setIsSubmitting(true);
    const chosenStatus: BlogStatus = targetStatus || status;

    const postPayload: any = {
      title: title.trim(),
      slug: slug.trim().toLowerCase(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      featuredImage: featuredImage.trim(),
      imageAlt: imageAlt.trim() || title.trim(),
      categories: selectedCategoryId ? [selectedCategoryId] : [],
      status: chosenStatus,
      isFeatured,
      seo: {
        metaTitle: metaTitle.trim() || `${title} | Trivllo`,
        metaDescription:
          metaDescription.trim() || excerpt.trim() || title.trim(),
        focusKeyword: focusKeyword.trim(),
        canonicalUrl:
          canonicalUrl.trim() || `https://trivllo.com/blog/${slug}`,
        ogTitle: metaTitle.trim() || title.trim(),
        ogDescription: metaDescription.trim() || excerpt.trim(),
        ogImage: featuredImage.trim(),
      },
    };

    try {
      if (isEdit && initialPost?._id) {
        await blogService.updatePost(initialPost._id, postPayload);
        toast.success("Article updated in MongoDB database!");
      } else {
        await blogService.createPost(postPayload);
        toast.success(
          chosenStatus === "PUBLISHED"
            ? "Article published live on Trivllo!"
            : "Draft saved to MongoDB!"
        );
      }
      router.push("/blog");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save article");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Link
            href="/blog"
            className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {isEdit ? "Edit Article (Database Synced)" : "Write New Travel Article"}
            </h1>
            <p className="text-xs text-muted-foreground">
              Direct connection to MongoDB backend with revision tracking and SEO metadata.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave("DRAFT")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-border bg-card hover:bg-muted text-foreground transition-all shadow-2xs cursor-pointer disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave("IN_REVIEW")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer disabled:opacity-60"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit for Review</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave("PUBLISHED")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
            <span>{isEdit ? "Update Live" : "Publish to Trivllo"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Editor & Right SEO / Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Core Content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Article Header Card */}
          <div className="p-5 rounded-xl border border-border bg-card shadow-2xs flex flex-col gap-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Article Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 10 Best Hotels to Stay in Indore (2026 Edition)"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-base sm:text-lg font-bold rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                SEO URL Slug <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center rounded-lg border border-border bg-muted/40 overflow-hidden text-xs">
                <span className="px-3 py-2 text-muted-foreground bg-muted font-mono border-r border-border shrink-0 select-none">
                  trivllo.com/blog/
                </span>
                <input
                  type="text"
                  placeholder="best-hotels-in-indore"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent text-foreground font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Excerpt / Short Summary
              </label>
              <textarea
                rows={2}
                placeholder="Brief 1-2 sentence hook for search engines and category feed preview cards..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>
          </div>

          {/* Featured Image Card */}
          <div className="p-5 rounded-xl border border-border bg-card shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-primary" />
                Featured Cover Image
              </label>
              <span className="text-xs text-muted-foreground">16:9 ratio recommended</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 flex flex-col gap-3">
                <input
                  type="url"
                  placeholder="Paste image URL (https://...)"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />

                <input
                  type="text"
                  placeholder="Image Alt Text (e.g. Sayaji Hotel Indore luxury suite room)"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />

                {/* Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-muted-foreground">Quick Presets:</span>
                  {sampleImages.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFeaturedImage(s.url);
                        setImageAlt(s.alt);
                      }}
                      className="px-2 py-0.5 text-[11px] rounded-md bg-muted hover:bg-muted/80 text-foreground border border-border cursor-pointer transition-colors"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Box */}
              <div className="relative rounded-lg overflow-hidden border border-border bg-muted/30 aspect-video flex items-center justify-center">
                {featuredImage ? (
                  <img
                    src={featuredImage}
                    alt={imageAlt || "Preview"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">No image set</span>
                )}
              </div>
            </div>
          </div>

          {/* Content Editor Card */}
          <div className="p-5 rounded-xl border border-border bg-card shadow-2xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    activeTab === "write"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Markdown Editor
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                    activeTab === "preview"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Live Preview
                </button>
              </div>

              {/* Formatting Quick Tools */}
              {activeTab === "write" && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => insertText("## ")}
                    title="Heading 2"
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Heading1 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText("### ")}
                    title="Heading 3"
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Heading2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText("**", "**")}
                    title="Bold"
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText("*", "*")}
                    title="Italic"
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText("- ")}
                    title="Bullet List"
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText("> ")}
                    title="Blockquote"
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Quote className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      insertText(
                        "\n\n> 🏨 **Looking to book in this city?** [Compare best rated hotels on Trivllo →](https://trivllo.com/hotels)\n\n"
                      )
                    }
                    title="Insert Hotel Booking CTA"
                    className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-1 ml-1 cursor-pointer"
                  >
                    <Hotel className="w-3 h-3" />
                    <span>+ Hotel CTA</span>
                  </button>
                </div>
              )}
            </div>

            {activeTab === "write" ? (
              <textarea
                id="blog-content-area"
                rows={16}
                placeholder="Write your article in Markdown. Use H2, H3, lists, and hotel recommendations..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-4 text-sm font-mono rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary leading-relaxed resize-y"
              />
            ) : (
              <div className="p-6 rounded-lg border border-border bg-muted/20 min-h-[380px] prose dark:prose-invert max-w-none text-foreground text-sm leading-relaxed whitespace-pre-line">
                {content ? (
                  content
                ) : (
                  <span className="text-muted-foreground italic">
                    Start typing in the Markdown tab to preview formatted article content here.
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Settings & SEO Engine */}
        <div className="flex flex-col gap-6">
          {/* Publishing & Metadata Card */}
          <div className="p-5 rounded-xl border border-border bg-card shadow-2xs flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Publishing & Categorization
            </h3>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Post Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BlogStatus)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="DRAFT">Draft</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="PUBLISHED">Published (Live)</option>
                <option value="REJECTED">Rejected</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {/* Featured Checkbox */}
            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded-md border-border text-primary focus:ring-primary"
              />
              <span className="font-medium">Pin as Featured Article on Blog Homepage</span>
            </label>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Category (MongoDB)
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Live Google Search Preview (The SEO Superpower) */}
          <div className="p-5 rounded-xl border border-border bg-card shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Google SERP Simulation
                </h3>
              </div>

              {/* Mobile / Desktop Toggle */}
              <div className="flex items-center rounded-lg border border-border p-0.5 bg-muted/40">
                <button
                  type="button"
                  onClick={() => setSerpDevice("mobile")}
                  className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                    serpDevice === "mobile"
                      ? "bg-card shadow-2xs text-foreground"
                      : "text-muted-foreground"
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSerpDevice("desktop")}
                  className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                    serpDevice === "desktop"
                      ? "bg-card shadow-2xs text-foreground"
                      : "text-muted-foreground"
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Simulated Google Result Card */}
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-sans shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 text-[10px] font-bold">
                  T
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[12px] text-neutral-800 dark:text-neutral-200 font-medium">
                    Trivllo
                  </span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono truncate max-w-[200px]">
                    https://trivllo.com/blog/{slug || "best-hotels-in-indore"}
                  </span>
                </div>
              </div>

              <h4 className="text-[#1a0dab] dark:text-[#8ab4f8] text-[15px] sm:text-[16px] font-medium leading-snug hover:underline cursor-pointer line-clamp-2">
                {metaTitle || (title ? `${title} | Trivllo` : "10 Best Hotels in Indore (2026 Edition) | Trivllo")}
              </h4>

              <p className="mt-1 text-[12px] text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-3">
                {metaDescription ||
                  excerpt ||
                  "Discover the best hotels in Indore, compare facilities, locations, prices, and amenities, and find the perfect stay for your trip on Trivllo."}
              </p>
            </div>

            {/* SEO Inputs */}
            <div className="flex flex-col gap-3 pt-2 border-t border-border">
              {/* Meta Title */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-muted-foreground">Meta Title</span>
                  <span
                    className={`font-mono text-[11px] ${
                      metaTitle.length > 60
                        ? "text-red-500 font-bold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {metaTitle.length}/60 chars
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. 10 Best Hotels in Indore (2026) | Trivllo"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Meta Description */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-muted-foreground">Meta Description</span>
                  <span
                    className={`font-mono text-[11px] ${
                      metaDescription.length > 160
                        ? "text-red-500 font-bold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {metaDescription.length}/160 chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Compelling 140-160 character description designed to maximize Google click-through rate (CTR)..."
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              {/* Focus Keyword */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Target Search Query / Focus Keyword
                </label>
                <input
                  type="text"
                  placeholder="e.g. best hotels in indore"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Canonical URL */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Canonical URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder={`https://trivllo.com/blog/${slug || ""}`}
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
