import { SITE_NAME, SITE_URL, OG_IMAGE, LOCALE, DEFAULT_KEYWORDS } from "@/lib/seo.config";
import JsonLd from "@/components/seo/JsonLd";
import { generateBreadcrumbJsonLd } from "@/lib/seo.config";
import type { Metadata } from "next";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ hotel: string }>;
};

/**
 * Dynamic metadata for individual hotel pages.
 * Generates unique title/description per hotel slug for SEO indexing.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ hotel: string }>;
}): Promise<Metadata> {
  const { hotel } = await params;
  // Transform slug to a readable name: "taj-palace-delhi" → "Taj Palace Delhi"
  const hotelName = hotel
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `${hotelName} — Book Now | ${SITE_NAME}`,
    description: `Book ${hotelName} on ${SITE_NAME}. View photos, amenities, reviews, and get the best rates with instant confirmation. Secure your stay today.`,
    keywords: [
      ...DEFAULT_KEYWORDS,
      hotelName,
      `${hotelName} booking`,
      `${hotelName} price`,
      `${hotelName} reviews`,
    ],
    alternates: {
      canonical: `/hotels/${hotel}`,
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
      url: `${SITE_URL}/hotels/${hotel}`,
      siteName: SITE_NAME,
      title: `${hotelName} — Book Now | ${SITE_NAME}`,
      description: `Book ${hotelName} on ${SITE_NAME}. View photos, amenities, reviews, and get the best rates.`,
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${hotelName} on ${SITE_NAME}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${hotelName} — Book Now | ${SITE_NAME}`,
      description: `Book ${hotelName} on ${SITE_NAME}. Best rates with instant confirmation.`,
      images: [OG_IMAGE],
    },
  };
}

export default async function HotelDetailLayout({ children, params }: LayoutProps) {
  const { hotel } = await params;
  const hotelName = hotel
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <>
      <JsonLd
        data={generateBreadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Hotels", url: "/hotels" },
          { name: hotelName, url: `/hotels/${hotel}` },
        ])}
      />
      {children}
    </>
  );
}
