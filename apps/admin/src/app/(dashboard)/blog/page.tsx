"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  blogService,
  BlogPost,
  BlogCategory,
  BlogStatus,
} from "@/services/blog.service";
import {
  BookOpen,
  Plus,
  Search,
  Eye,
  Edit3,
  Trash2,
  ExternalLink,
  Sparkles,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle2,
  Copy,
  Layers,
  Users,
  Check,
  XCircle,
  Archive,
  Send,
  Loader2,
} from "lucide-react";

export default function BlogDashboardPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    inReview: 0,
    rejected: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const loadData = async () => {
    try {
      setLoading(true);
      const [res, cats] = await Promise.all([
        blogService.getAdminPosts({
          search: searchQuery || undefined,
          status: selectedStatus !== "all" ? selectedStatus : undefined,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
        }),
        blogService.getCategories(),
      ]);
      setPosts(res.posts);
      setMetrics(res.metrics);
      setCategories(cats);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load posts from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStatus, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await blogService.deletePost(id);
        toast.success("Article deleted from database");
        loadData();
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Delete failed");
      }
    }
  };

  // Workflow transitions
  const handleSubmitReview = async (id: string) => {
    try {
      await blogService.submitForReview(id);
      toast.success("Submitted for editorial review!");
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Submission failed");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await blogService.approvePost(id);
      toast.success("Approved and published live on Trivllo!");
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Approval failed");
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Enter feedback / rejection reason for the author:");
    if (reason !== null) {
      try {
        await blogService.rejectPost(id, reason);
        toast.success("Article rejected with feedback.");
        loadData();
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Rejection failed");
      }
    }
  };

  const handleArchive = async (id: string) => {
    if (confirm("Archive this published article? It will no longer appear publicly.")) {
      try {
        await blogService.archivePost(id);
        toast.success("Article archived.");
        loadData();
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Archive failed");
      }
    }
  };

  const handleCopyLink = (slug: string) => {
    const fullUrl = `https://trivllo.com/blog/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Blog public URL copied to clipboard!");
  };

  const getStatusBadge = (status: BlogStatus) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "IN_REVIEW":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "REJECTED":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      case "ARCHIVED":
        return "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20";
      default:
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <BookOpen className="w-7 h-7 text-primary" />
              Travel Blog CMS & Editorial Engine
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-3 h-3" />
              Live DB Synced
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage travel guides, review author submissions, and optimize organic Google rankings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/blog-categories"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border border-border bg-background hover:bg-muted/80 transition-colors shadow-2xs"
          >
            <Layers className="w-4 h-4 text-muted-foreground" />
            <span>Categories</span>
          </Link>
          <Link
            href="/writers"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border border-border bg-background hover:bg-muted/80 transition-colors shadow-2xs"
          >
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>Writers (RBAC)</span>
          </Link>
          <Link
            href="/blog/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Write Article</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row from MongoDB */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Articles</span>
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-foreground">{metrics.total}</span>
            <p className="text-xs text-muted-foreground mt-0.5">In MongoDB database</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-medium uppercase tracking-wider">Published (Live)</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.published}
            </span>
            <p className="text-xs text-muted-foreground mt-0.5">Live on Trivllo</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span className="text-xs font-medium uppercase tracking-wider">In Review</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {metrics.inReview}
            </span>
            <p className="text-xs text-muted-foreground mt-0.5">Awaiting editorial check</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-medium uppercase tracking-wider">Organic Views</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-foreground">
              {metrics.totalViews.toLocaleString()}
            </span>
            <p className="text-xs text-muted-foreground mt-0.5">Google search readers</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, keyword, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Statuses</option>
            <option value="DRAFT">Drafts</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="PUBLISHED">Published</option>
            <option value="REJECTED">Rejected</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-muted hover:bg-muted/80 text-foreground border border-border"
          >
            Filter
          </button>
        </div>
      </form>

      {/* Articles Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Workflow Status</th>
                <th className="py-3 px-4">Views</th>
                <th className="py-3 px-4">Updated</th>
                <th className="py-3 px-4 text-right">Workflow & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                    <span>Loading articles from MongoDB...</span>
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="font-medium text-foreground">No articles found in database</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Start writing your first travel guide.
                    </p>
                    <Link
                      href="/blog/create"
                      className="inline-flex items-center gap-1.5 mt-4 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Write Article
                    </Link>
                  </td>
                </tr>
              ) : (
                posts.map((post) => {
                  const author = typeof post.authorId === "object" ? post.authorId : null;
                  const authorName = author
                    ? `${author.firstName || ""} ${author.lastName || ""}`.trim() || author.email || "Author"
                    : post.authorName || "Author";

                  const firstCat =
                    post.categories && post.categories.length > 0
                      ? typeof post.categories[0] === "object"
                        ? (post.categories[0] as BlogCategory).name
                        : "Category"
                      : "General";

                  return (
                    <tr key={post._id} className="hover:bg-muted/30 transition-colors group">
                      {/* Title + Thumbnail + Slug */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3 max-w-md">
                          <img
                            src={post.featuredImage || "/placeholder.png"}
                            alt={post.imageAlt || post.title}
                            className="w-14 h-14 rounded-lg object-cover shrink-0 border border-border/80"
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/blog/${post._id}/edit`}
                              className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1 group-hover:underline"
                            >
                              {post.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                                /blog/{post.slug}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyLink(post.slug)}
                                title="Copy Public Link"
                                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            {post.rejectionReason && (
                              <p className="text-[11px] text-red-500 line-clamp-1 mt-0.5">
                                Reason: {post.rejectionReason}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border">
                          {firstCat}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                            {authorName.charAt(0)}
                          </div>
                          <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
                            {authorName}
                          </span>
                        </div>
                      </td>

                      {/* Workflow Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                            post.status
                          )}`}
                        >
                          <span className="capitalize">{post.status.replace("_", " ")}</span>
                        </span>
                      </td>

                      {/* Views */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{(post.viewsCount || 0).toLocaleString()}</span>
                        </div>
                      </td>

                      {/* Last Updated */}
                      <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(post.updatedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>

                      {/* Actions & Workflow Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Workflow button depending on current state */}
                          {(post.status === "DRAFT" || post.status === "REJECTED") && (
                            <button
                              type="button"
                              onClick={() => handleSubmitReview(post._id)}
                              className="px-2 py-1 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center gap-1"
                              title="Submit for Review"
                            >
                              <Send className="w-3 h-3" />
                              <span>Submit</span>
                            </button>
                          )}

                          {post.status === "IN_REVIEW" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(post._id)}
                                className="px-2 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1"
                                title="Approve & Publish"
                              >
                                <Check className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(post._id)}
                                className="px-2 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-1"
                                title="Reject"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {post.status === "PUBLISHED" && (
                            <button
                              type="button"
                              onClick={() => handleArchive(post._id)}
                              className="px-2 py-1 rounded-md bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-600 dark:text-zinc-400 text-xs font-semibold flex items-center gap-1"
                              title="Archive Article"
                            >
                              <Archive className="w-3 h-3" />
                              <span>Archive</span>
                            </button>
                          )}

                          {/* Edit */}
                          <Link
                            href={`/blog/${post._id}/edit`}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit Post"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(post._id, post.title)}
                            className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete Post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
