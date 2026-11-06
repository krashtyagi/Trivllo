/**
 * Centralized SEO configuration for Trivllo
 * All SEO-related constants, helpers, and JSON-LD generators live here.
 *
 * FOCUS: Hotels & Tours ONLY (no cabs, adventures, bikes)
 */

import trivlloData from "@/../trivllo.json";

// ─── Core Constants ────────────────────────────────────────────────────────────

export const SITE_URL = trivlloData.contact.website; // https://trivllo.com
export const SITE_NAME = trivlloData.company_name; // Trivllo
export const SITE_EMAIL = trivlloData.contact.email;
export const OG_IMAGE = `/og-main-preview.png`;
export const LOGO_URL = `/trivllo-logo.svg`;
export const LOCALE = "en_IN";

export const DEFAULT_KEYWORDS = [
  // ── Brand keywords (critical for brand search) ──
  "Trivllo",
  "trivllo",
  "trivllo.com",
  "Trivllo.com",
  "Trivllo Hotels",
  "Trivllo Tours",
  "Trivllo Booking",
  "Trivllo India",
  "Trivllo Hotel Booking",
  "Trivllo Tour Packages",
  "Trivllo Travel",
  `${SITE_NAME} App`,

  // ── Hotels & Stays ──
  "Hotel Booking",
  "Book Hotels Online",
  "Best Hotels India",
  "Online Hotel Booking",
  "Affordable Hotels India",
  "Premium Stays India",
  "Luxury Hotels India",
  "Budget Hotels India",
  "5 Star Hotels India",
  "Boutique Hotels India",
  "Resorts Booking India",
  "Heritage Hotels India",
  "Homestays India",
  "Villa Booking India",
  "Cottage Rentals India",
  "Vacation Rentals India",
  "Serviced Apartments India",
  "Farm Stays India",
  "Pet Friendly Hotels",
  "Free Cancellation Hotels",
  "Pay at Hotel",
  "Instant Hotel Booking",

  // ── Tours & Packages ──
  "Tour Packages India",
  "Guided Tours India",
  "Holiday Packages India",
  "Travel Packages India",
  "Cultural Tours India",
  "Wildlife Safari Tours",
  "Heritage Tours India",
  "Group Tours India",
  "Family Tour Packages",
  "Honeymoon Packages India",
  "Solo Travel Tours India",
  "Golden Triangle Tour",
  "Kerala Tour Packages",
  "Rajasthan Tour Packages",
  "Himachal Tour Packages",
  "Goa Holiday Packages",
  "Custom Tour Packages",
  "Weekend Getaway India",

  // ── Popular Destinations ──
  "Hotels in Goa",
  "Hotels in Mumbai",
  "Hotels in Delhi",
  "Hotels in Jaipur",
  "Hotels in Kerala",
  "Hotels in Manali",
  "Hotels in Udaipur",
  "Hotels in Rishikesh",
  "Hotels in Shimla",
  "Hotels in Ooty",
  "Hotels in Andaman",
  "Tours in Rajasthan",
  "Tours in Kerala",
  "Tours in Himachal",

  // ── Travel & Booking ──
  "Travel Platform India",
  "Online Travel Agency India",
  "Best Travel App India",
  "Domestic Travel Booking",
  "India Tourism",
  "Travel Deals India",
  "Hotel + Tour Packages",
  "24x7 Travel Support",
  "Eco Friendly Stays",
];

// ─── Per-page SEO Data ─────────────────────────────────────────────────────────

export type PageSEO = {
  title: string;
  description: string;
  keywords?: string[];
  canonical: string;
  ogType?: "website" | "article";
  noIndex?: boolean;
};

export const PAGE_SEO: Record<string, PageSEO> = {
  // ── Home ──
  home: {
    title: `${SITE_NAME} — Book Hotels & Tours in India | trivllo.com`,
    description: `${SITE_NAME} is India's trusted travel platform. Book premium hotels, resorts, homestays, and curated tour packages across India. Best prices, instant confirmation, 24/7 support.`,
    canonical: "/",
    keywords: [
      ...DEFAULT_KEYWORDS,
      "book hotels online India",
      "best travel platform India",
      "cheap hotels near me",
      "tour packages near me",
    ],
  },

  // ── Hotels ──
  hotels: {
    title: `Book Hotels & Stays Across India | ${SITE_NAME}`,
    description: `Find and book the best hotels, resorts, and homestays across India on ${SITE_NAME}. Compare prices, read reviews, and secure the lowest rates with instant confirmation.`,
    canonical: "/hotels",
    keywords: [
      ...DEFAULT_KEYWORDS,
      "book hotels",
      "luxury hotels India",
      "budget hotels",
      "resorts near me",
      "homestays India",
    ],
  },

  hotelsFind: {
    title: `Search & Filter Hotels | ${SITE_NAME}`,
    description: `Search from thousands of hotels with advanced filters. Compare prices, amenities, ratings & locations to find your perfect stay on ${SITE_NAME}.`,
    canonical: "/hotels/find",
    keywords: [
      ...DEFAULT_KEYWORDS,
      "search hotels",
      "filter hotels by price",
      "hotel comparison",
      "find hotels near me",
    ],
  },

  // ── Tours ──
  tours: {
    title: `Book Guided Tours & Holiday Packages | ${SITE_NAME}`,
    description: `Discover curated holiday packages and guided tours across India on ${SITE_NAME}. Expert guides, secure bookings, and customized itineraries for every traveler.`,
    canonical: "/tours",
    keywords: [
      ...DEFAULT_KEYWORDS,
      "guided tours India",
      "holiday packages",
      "curated travel packages",
      "group tours",
      "family vacation India",
    ],
  },

  toursFind: {
    title: `Search & Filter Tours | ${SITE_NAME}`,
    description: `Browse and filter from hundreds of curated tour packages. Find the perfect guided tour with flexible dates and group sizes on ${SITE_NAME}.`,
    canonical: "/tours/find",
    keywords: [
      ...DEFAULT_KEYWORDS,
      "search tours",
      "find tour packages",
      "compare tours India",
      "tour deals",
    ],
  },

  // ── Auth ──
  login: {
    title: `Login or Sign Up | ${SITE_NAME}`,
    description: `Sign in to your ${SITE_NAME} account to manage bookings, wishlists, and travel plans. New user? Create a free account in seconds.`,
    canonical: "/login",
    noIndex: true,
  },

  // ── Profile / Personal ──
  profile: {
    title: `My Profile | ${SITE_NAME}`,
    description: `Manage your ${SITE_NAME} profile, bookings, payment methods, and travel preferences all in one place.`,
    canonical: "/profile",
    noIndex: true,
  },

  book: {
    title: `Complete Your Booking | ${SITE_NAME}`,
    description: `Securely complete your hotel or tour booking on ${SITE_NAME}. Review your details, apply coupons, and pay with confidence.`,
    canonical: "/book",
    noIndex: true,
  },

  booknow: {
    title: `Confirm & Pay | ${SITE_NAME}`,
    description: `Finalize your reservation on ${SITE_NAME}. Secure payment gateway with instant booking confirmation.`,
    canonical: "/booknow",
    noIndex: true,
  },

  // ── Policy / Details Pages ──
  aboutUs: {
    title: `About Trivllo — India's Trusted Hotel & Tour Booking Platform`,
    description: `Learn about ${SITE_NAME}, India's innovative travel platform founded in ${trivlloData.founded}. We make premium hotel stays and curated tour experiences accessible to everyone.`,
    canonical: "/about-us",
    ogType: "article",
    keywords: [
      SITE_NAME,
      `about ${SITE_NAME}`,
      "travel startup India",
      "Gwalior startup",
      "travel technology company",
      "hotel booking platform",
    ],
  },

  privacyPolicy: {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: `Read ${SITE_NAME}'s privacy policy. Learn how we collect, use, and protect your personal data when you use our hotel and tour booking platform.`,
    canonical: "/privacy-policy",
    ogType: "article",
  },

  termsOfServices: {
    title: `Terms of Service | ${SITE_NAME}`,
    description: `Review ${SITE_NAME}'s terms and conditions for using our hotel and tour booking services. Know your rights and responsibilities.`,
    canonical: "/terms-of-services",
    ogType: "article",
  },

  partnerWithUs: {
    title: `Partner With Us | List Your Property or Tour on ${SITE_NAME}`,
    description: `Grow your business by partnering with ${SITE_NAME}. List your hotel, resort, homestay, or tour service and reach millions of travelers across India.`,
    canonical: "/partner-with-us",
    keywords: [
      SITE_NAME,
      "list hotel online",
      "partner with travel platform",
      "hotel listing India",
      "tour operator partnership",
    ],
  },

  cancellationPolicy: {
    title: `Cancellation & Refund Policy | ${SITE_NAME}`,
    description: `Understand ${SITE_NAME}'s cancellation and refund policies. Hassle-free cancellations with transparent refund timelines for all bookings.`,
    canonical: "/cancellation-policy",
    ogType: "article",
  },

  bookingPolicy: {
    title: `Booking Policy | ${SITE_NAME}`,
    description: `Read ${SITE_NAME}'s booking policy. Understand booking confirmation, modification rules, and payment terms for hotels and tours.`,
    canonical: "/booking-policy",
    ogType: "article",
  },

  codeOfConduct: {
    title: `Code of Conduct | ${SITE_NAME}`,
    description: `${SITE_NAME}'s community code of conduct. Guidelines for guests, hosts, and partners to ensure safe and respectful travel experiences.`,
    canonical: "/code-of-conduct",
    ogType: "article",
  },

  secureBookingsAndPayments: {
    title: `Secure Bookings & Payments | ${SITE_NAME}`,
    description: `Learn about ${SITE_NAME}'s secure payment infrastructure. PCI-compliant processing, encrypted transactions, and verified booking guarantees.`,
    canonical: "/secure-bookings-and-payments",
    ogType: "article",
  },

  trustedHostPolicy: {
    title: `Trusted Host Policy | ${SITE_NAME}`,
    description: `Discover how ${SITE_NAME} verifies and maintains quality standards for all listed properties. Our trusted host program ensures safe, reliable stays.`,
    canonical: "/trusted-host-policy",
    ogType: "article",
  },

  // ── Blog ──
  blog: {
    title: `Travel Blog, Destination Guides & Hotel Tips | ${SITE_NAME}`,
    description: `Explore insider travel guides, luxury & budget hotel recommendations, 7-day tour itineraries, and smart booking secrets across India on ${SITE_NAME}.`,
    canonical: "/blog",
    keywords: [
      ...DEFAULT_KEYWORDS,
      "travel blog India",
      "best hotel guides",
      "tour itineraries India",
      "Indore travel guide",
      "Rajasthan tour guide",
      "weekend getaways Delhi",
      "smart hotel booking tips",
    ],
  },
};

// ─── JSON-LD Structured Data Generators ────────────────────────────────────────

/** Organization schema — injected once in the root layout */
export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: [
      "Trivllo",
      "trivllo",
      "Trivllo.com",
      "trivllo.com",
      "Trivllo Hotels",
      "Trivllo Tours",
      "Trivllo India",
      "Trivllo Travel",
    ],
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}${LOGO_URL}`,
      width: 512,
      height: 512,
    },
    image: [`${SITE_URL}${OG_IMAGE}`, `${SITE_URL}${LOGO_URL}`],
    foundingDate: `${trivlloData.founded}`,
    description: `${SITE_NAME} is India's trusted travel platform for booking hotels, resorts, homestays, and curated tour packages. Based in ${trivlloData.headquarters.city}, ${trivlloData.headquarters.state}.`,
    email: SITE_EMAIL,
    address: {
      "@type": "PostalAddress",
      addressLocality: trivlloData.headquarters.city,
      addressRegion: trivlloData.headquarters.state,
      addressCountry: trivlloData.headquarters.country,
    },
    sameAs: [
      // Add your social profiles here when available:
      // "https://www.instagram.com/trivllo",
      // "https://x.com/trivllo",
      // "https://www.facebook.com/trivllo",
      // "https://www.linkedin.com/company/trivllo",
      // "https://www.youtube.com/@trivllo",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: SITE_EMAIL,
      contactType: "customer service",
      availableLanguage: ["English", "Hindi"],
    },
    knowsAbout: [
      "Hotel Booking",
      "Tour Packages",
      "Travel in India",
      "Homestays",
      "Resorts",
      "Holiday Packages",
    ],
  };
}

/** WebSite schema with SearchAction — enables Google Sitelinks Searchbox */
export function generateWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: [
      "Trivllo",
      "trivllo",
      "Trivllo.com",
      "trivllo.com",
      "Trivllo Hotels",
      "Trivllo Tours",
    ],
    url: SITE_URL,
    image: `${SITE_URL}${OG_IMAGE}`,
    description: `${SITE_NAME} — India's trusted platform for booking hotels and curated tour packages. Best prices, instant confirmation, 24/7 support.`,
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}${LOGO_URL}`,
      },
    },
    potentialAction: [
      {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/hotels/find?city={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    ],
    inLanguage: "en-IN",
  };
}

/** BreadcrumbList schema */
export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

/** TravelAgency schema — more specific than Organization for travel */
export function generateTravelAgencyJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${SITE_URL}/#travelagency`,
    name: SITE_NAME,
    alternateName: ["Trivllo", "trivllo.com", "Trivllo Hotels & Tours"],
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}${LOGO_URL}`,
    },
    image: `${SITE_URL}${OG_IMAGE}`,
    description: `${SITE_NAME} is India's premier travel booking platform offering hotels, resorts, homestays, and curated tour packages across India.`,
    address: {
      "@type": "PostalAddress",
      addressLocality: trivlloData.headquarters.city,
      addressRegion: trivlloData.headquarters.state,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "26.2659639",
      longitude: "78.2112098",
    },
    priceRange: "₹₹",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    makesOffer: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Hotel Booking",
          description:
            "Book premium hotels, resorts, homestays, and villas across India",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Tour Packages",
          description:
            "Curated guided tours and holiday packages across India with expert guides",
        },
      },
    ],
  };
}

/** FAQPage schema — for policy pages */
export function generateFAQJsonLd(
  faqs: { question: string; answer: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/** BlogPosting schema — enables Google rich snippets for articles */
export function generateBlogPostingJsonLd(post: {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
  updatedAt?: string;
  author: { name: string };
  tags?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${SITE_URL}/blog/${post.slug}#article`,
    headline: post.title,
    description: post.excerpt,
    image: [post.coverImage],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}${LOGO_URL}`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    keywords: (post.tags || []).join(", "),
    inLanguage: "en-IN",
  };
}

/** Blog collection schema (ItemList) */
export function generateBlogCollectionJsonLd(
  posts: { slug: string; title: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Travel Blog & Guides — ${SITE_NAME}`,
    url: `${SITE_URL}/blog`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((post, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${SITE_URL}/blog/${post.slug}`,
        name: post.title,
      })),
    },
  };
}

// ─── Metadata Helper ───────────────────────────────────────────────────────────

import type { Metadata } from "next";

/**
 * Generate a full Next.js Metadata object from a PageSEO key.
 * Usage: `export const metadata = buildMetadata("aboutUs");`
 */
export function buildMetadata(pageKey: keyof typeof PAGE_SEO): Metadata {
  const seo = PAGE_SEO[pageKey];
  if (!seo) throw new Error(`SEO config not found for page: ${pageKey}`);

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords ?? DEFAULT_KEYWORDS,

    alternates: {
      canonical: seo.canonical,
    },

    robots: seo.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large" as const,
            "max-video-preview": -1,
            "max-snippet": -1,
          },
        },

    openGraph: {
      type: (seo.ogType ?? "website") as "website" | "article",
      locale: LOCALE,
      url: `${SITE_URL}${seo.canonical}`,
      siteName: SITE_NAME,
      title: seo.title,
      description: seo.description,
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — ${seo.title}`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [OG_IMAGE],
    },
  };
}
