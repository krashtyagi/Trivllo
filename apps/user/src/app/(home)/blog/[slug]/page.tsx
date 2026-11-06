import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  Calendar,
  ArrowLeft,
  Share2,
  Bookmark,
  MapPin,
  Building2,
  Compass,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import {
  SITE_NAME,
  SITE_URL,
  LOCALE,
  DEFAULT_KEYWORDS,
  generateBlogPostingJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/seo.config";
import JsonLd from "@/components/seo/JsonLd";
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  getRelatedPosts,
} from "@/lib/blog-data";
import { optimizeCloudinaryUrl } from "@/lib/image-optimizer";
import ShareButtons from "./share-buttons";

type PageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * SSG Pre-rendering: Pre-computes all blog post pages at build time
 * so Googlebot and human visitors get instantaneous server-rendered HTML.
 */
export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

/**
 * Dynamic Metadata for SEO:
 * Generates custom canonical URL, OpenGraph preview, and high-CTR title/description.
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: `Article Not Found | ${SITE_NAME}`,
      description: "The requested travel article could not be found.",
    };
  }

  const pageTitle = `${post.title} | ${SITE_NAME} Blog`;
  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;

  return {
    title: pageTitle,
    description: post.excerpt,
    keywords: [
      ...DEFAULT_KEYWORDS,
      ...post.tags,
      post.category,
      `${post.title} travel guide`,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-video-preview": -1,
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "article",
      locale: LOCALE,
      url: canonicalUrl,
      siteName: SITE_NAME,
      title: pageTitle,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: [post.author.name],
      tags: post.tags,
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.slug, post.category, 3);

  return (
    <>
      {/* ── JSON-LD Structured Data for Search Engines ── */}
      <JsonLd
        data={generateBreadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: post.title, url: `/blog/${post.slug}` },
        ])}
      />
      <JsonLd data={generateBlogPostingJsonLd(post)} />

      <article className="min-h-screen pb-16 sm:pb-24">
        {/* ── Article Header ── */}
        <header className="relative pt-6 pb-8 sm:pt-10 sm:pb-12 border-b border-border/60 bg-muted/20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Back link & breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-6">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Blog
              </Link>
              <span>/</span>
              <span className="text-foreground/80">{post.category}</span>
            </div>

            {/* Category badge & Reading stats */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                {post.category}
              </span>

              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readTime}
              </span>

              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Main H1 Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-[1.2]">
              {post.title}
            </h1>

            {/* Excerpt subtitle */}
            <p className="mt-4 text-base sm:text-xl text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>

            {/* Author bar & share */}
            <div className="mt-8 pt-6 border-t border-border/60 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-primary/30"
                />
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {post.author.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {post.author.role} • Verified Author
                  </p>
                </div>
              </div>

              {/* Client Social Sharing Component */}
              <ShareButtons title={post.title} url={`${SITE_URL}/blog/${post.slug}`} />
            </div>
          </div>
        </header>

        {/* ── Featured Cover Image ── */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-8 sm:mt-10">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl bg-muted">
            <img
              src={optimizeCloudinaryUrl(post.coverImage, {
                width: 1400,
                height: 800,
                crop: "fill",
              })}
              alt={post.title}
              loading="eager"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* ── Main Content Body ── */}
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14 space-y-10">
          {/* Introduction Paragraph */}
          <div className="text-base sm:text-lg text-foreground/90 leading-relaxed font-normal">
            <p>{post.content.introduction}</p>
          </div>

          {/* Sections */}
          {post.content.sections.map((section, idx) => (
            <section key={idx} className="space-y-4 pt-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">
                {section.heading}
              </h2>

              {section.subheading && (
                <h3 className="text-lg sm:text-xl font-semibold text-primary">
                  {section.subheading}
                </h3>
              )}

              {section.body.map((paragraph, pIdx) => (
                <p
                  key={pIdx}
                  className="text-base sm:text-lg text-foreground/85 leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}

              {/* Callout Highlight Box */}
              {section.highlightBox && (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 my-4">
                  <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm sm:text-base font-medium text-amber-950 dark:text-amber-200 leading-relaxed">
                    {section.highlightBox}
                  </p>
                </div>
              )}

              {/* Key Highlights Bullet points */}
              {section.bulletPoints && section.bulletPoints.length > 0 && (
                <ul className="space-y-2.5 my-3 pl-1">
                  {section.bulletPoints.map((point, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2.5 text-sm sm:text-base text-foreground/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {/* Conclusion */}
          <div className="p-6 rounded-2xl bg-card border border-border/80 space-y-2 mt-8">
            <h3 className="text-lg font-bold text-foreground">Final Word</h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              {post.content.conclusion}
            </p>
          </div>

          {/* ── Internal Booking Card (High Conversion Widget) ── */}
          {post.relatedService && (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-zinc-900 to-black text-white p-6 sm:p-8 border border-emerald-500/30 shadow-2xl my-8">
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Featured Destination</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    {post.relatedService.label}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 max-w-md">
                    Compare verified properties, get member discounts, and secure your room with zero booking fees on Trivllo.
                  </p>
                </div>

                <Link
                  href={
                    post.relatedService.type === "hotel"
                      ? `/hotels/find?city=${encodeURIComponent(post.relatedService.query)}`
                      : `/tours/find?city=${encodeURIComponent(post.relatedService.query)}`
                  }
                  className="px-6 py-3 rounded-full bg-emerald-400 text-emerald-950 font-bold text-xs sm:text-sm shadow-lg hover:bg-emerald-300 hover:scale-105 active:scale-95 transition-all shrink-0 inline-flex items-center gap-2"
                >
                  <span>{post.relatedService.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="pt-6 border-t border-border flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-muted-foreground">Tags:</span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs bg-muted text-muted-foreground font-medium border border-border/50"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* ── Related Articles Section ── */}
        {relatedPosts.length > 0 && (
          <aside className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-16 pt-12 border-t border-border/80">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                More Travel Stories & Guides
              </h2>
              <Link
                href="/blog"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rPost) => (
                <Link
                  key={rPost.slug}
                  href={`/blog/${rPost.slug}`}
                  className="group flex flex-col rounded-2xl bg-card border border-border/70 overflow-hidden shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    <img
                      src={optimizeCloudinaryUrl(rPost.coverImage, {
                        width: 500,
                        height: 320,
                        crop: "fill",
                      })}
                      alt={rPost.title}
                      loading="lazy"
                      className="w-full h-full object-cover transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                        {rPost.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-1">
                        {rPost.readTime}
                      </p>
                      <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {rPost.title}
                      </h3>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary">
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        )}
      </article>
    </>
  );
}
