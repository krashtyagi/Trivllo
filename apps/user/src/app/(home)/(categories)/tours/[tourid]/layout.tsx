import { SITE_NAME, SITE_URL, OG_IMAGE, LOCALE, DEFAULT_KEYWORDS } from "@/lib/seo.config";
import JsonLd from "@/components/seo/JsonLd";
import { generateBreadcrumbJsonLd } from "@/lib/seo.config";
import type { Metadata } from "next";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ tourid: string }>;
};

/**
 * Dynamic metadata for individual tour pages.
 * Generates unique title/description per tour slug for SEO indexing.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ tourid: string }>;
}): Promise<Metadata> {
  const { tourid } = await params;
  // Transform slug to a readable name: "golden-triangle-tour" → "Golden Triangle Tour"
  const tourName = tourid
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `${tourName} — Book Tour | ${SITE_NAME}`,
    description: `Book ${tourName} on ${SITE_NAME}. Expert guides, flexible dates, and curated itineraries. Secure your adventure today with instant confirmation.`,
    keywords: [
      ...DEFAULT_KEYWORDS,
      tourName,
      `${tourName} booking`,
      `${tourName} package`,
      `${tourName} itinerary`,
      `${tourName} price`,
    ],
    alternates: {
      canonical: `/tours/${tourid}`,
    },
    robots: {
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
      type: "website",
      locale: LOCALE,
      url: `${SITE_URL}/tours/${tourid}`,
      siteName: SITE_NAME,
      title: `${tourName} — Book Tour | ${SITE_NAME}`,
      description: `Book ${tourName} on ${SITE_NAME}. Expert guides, flexible dates, and curated itineraries.`,
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${tourName} on ${SITE_NAME}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tourName} — Book Tour | ${SITE_NAME}`,
      description: `Book ${tourName} on ${SITE_NAME}. Curated itineraries with expert guides.`,
      images: [OG_IMAGE],
    },
  };
}

export default async function TourDetailLayout({ children, params }: LayoutProps) {
  const { tourid } = await params;
  const tourName = tourid
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <>
      <JsonLd
        data={generateBreadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Tours", url: "/tours" },
          { name: tourName, url: `/tours/${tourid}` },
        ])}
      />
      {children}
    </>
  );
}
