"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Clock,
  Calendar,
  ArrowRight,
  Sparkles,
  Compass,
  Building2,
  Tag,
  ChevronRight,
} from "lucide-react";
import { BlogPost } from "@/lib/blog-data";
import { optimizeCloudinaryUrl } from "@/lib/image-optimizer";
import { cn } from "@/lib/utils";

interface BlogClientProps {
  initialPosts: BlogPost[];
  categories: string[];
}

export default function BlogClient({
  initialPosts,
  categories,
}: BlogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      return matchesCategory && matchesSearch;
    });
  }, [initialPosts, selectedCategory, searchQuery]);

  const featuredPost = useMemo(() => {
    return initialPosts.find((p) => p.featured) || initialPosts[0];
  }, [initialPosts]);

  return (
    <div className="w-full">
      {/* ─── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 border-b border-border/50">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-background to-background" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Trivllo Travel Journal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.15]">
            Stories, Insider Guides & <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">Handpicked Stays</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Expertly crafted destination itineraries, luxury and budget hotel recommendations, and practical secrets for stress-free travel across India.
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by city, hotel, or guide..."
                className="w-full pl-12 pr-4 py-3.5 rounded-full bg-card border border-border shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/70 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-6 flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                    isActive
                      ? "bg-foreground text-background shadow-md scale-105"
                      : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40",
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
        {/* ─── Featured Post (Only on "All" and when not searching) ──────── */}
        {selectedCategory === "All" && !searchQuery && featuredPost && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Featured Editorial
              </span>
              <div className="h-px flex-1 bg-border/60" />
            </div>

            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group block relative overflow-hidden rounded-3xl bg-card border border-border/80 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
                {/* Image side */}
                <div className="lg:col-span-7 relative overflow-hidden h-64 sm:h-80 lg:h-auto">
                  <img
                    src={optimizeCloudinaryUrl(featuredPost.coverImage, {
                      width: 1000,
                      height: 600,
                      crop: "fill",
                    })}
                    alt={featuredPost.title}
                    loading="eager"
                    className="w-full h-full object-cover transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
                </div>

                {/* Content side */}
                <div className="lg:col-span-5 p-6 sm:p-8 md:p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 mb-3.5">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                        {featuredPost.category}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {featuredPost.readTime}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-snug group-hover:text-primary transition-colors">
                      {featuredPost.title}
                    </h2>

                    <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={featuredPost.author.avatar}
                        alt={featuredPost.author.name}
                        className="w-9 h-9 rounded-full object-cover border border-border"
                      />
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          {featuredPost.author.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(featuredPost.publishedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                      Read Story <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* ─── Articles Grid ────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {searchQuery
                ? `Search Results (${filteredPosts.length})`
                : selectedCategory === "All"
                  ? "Latest Travel Articles"
                  : `${selectedCategory} Articles`}
            </h2>

            <span className="text-xs font-semibold text-muted-foreground">
              {filteredPosts.length} article{filteredPosts.length !== 1 ? "s" : ""}
            </span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-border rounded-2xl p-8">
              <Compass className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
              <h3 className="text-lg font-bold text-foreground">
                No matching stories found
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try searching with a different term or clearing your category filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="mt-4 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:brightness-105 transition-all"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-2xl bg-card border border-border/70 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300"
                >
                  {/* Card Thumbnail */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    <img
                      src={optimizeCloudinaryUrl(post.coverImage, {
                        width: 700,
                        height: 440,
                        crop: "fill",
                      })}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md shadow-sm">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>

                      <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="text-xs font-semibold text-foreground">
                          {post.author.name}
                        </span>
                      </div>

                      <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Read <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ─── Direct Booking Callout ────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-card to-background border border-amber-500/20 p-8 sm:p-12 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-500 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>Ready for your next journey?</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              Book Verified Hotels & Curated Tour Packages
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground">
              Experience transparent pricing, zero hidden charges, and instant confirmation across premier destinations in India.
            </p>

            <div className="pt-2 flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
              <Link
                href="/hotels"
                className="px-6 py-3 rounded-full bg-foreground text-background font-bold text-xs sm:text-sm shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                Find Hotels
              </Link>
              <Link
                href="/tours"
                className="px-6 py-3 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs sm:text-sm hover:bg-primary/20 transition-all"
              >
                Explore Tours
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
