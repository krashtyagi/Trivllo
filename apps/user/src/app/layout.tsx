import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit, Dancing_Script } from "next/font/google";
import Script from "next/script";

import "./globals.css";

import MainProvider from "@/providers/main-provider/main-provider";
import { Toaster } from "@/components/ui/sonner";
import TopLoader from "./toploader";

import trivlloData from "@/../trivllo.json";

import JsonLd from "@/components/seo/JsonLd";
import {
  generateOrganizationJsonLd,
  generateWebSiteJsonLd,
  generateTravelAgencyJsonLd,
  DEFAULT_KEYWORDS,
} from "@/lib/seo.config";
import { GoogleAnalytics } from "@next/third-parties/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const dancingScript = Dancing_Script({
  variable: "--font-cursive",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(trivlloData.contact.website),

  title: {
    default: `${trivlloData.company_name} — Book Hotels & Tours in India | trivllo.com`,
    template: `%s | ${trivlloData.company_name}`,
  },

  description: `${trivlloData.company_name} (trivllo.com) is India's trusted travel platform. Book premium hotels, resorts, homestays, and curated tour packages across India. Best prices, instant confirmation, and 24/7 support.`,

  keywords: [
    "Trivllo",
    "trivllo",
    "trivllo.com",
    "Trivllo Hotels",
    "Trivllo Tours",
    "Trivllo Booking",
    "Trivllo India",
    "Trivllo Hotel Booking",
    "Trivllo Tour Packages",
    "Hotel Booking India",
    "Tour Packages India",
    "Book Hotels Online",
    "Best Hotels India",
    "Travel Platform India",
    ...DEFAULT_KEYWORDS,
  ],

  authors: [
    {
      name: `${trivlloData.company_name} Team`,
    },
  ],

  creator: trivlloData.company_name,
  publisher: trivlloData.company_name,

  alternates: {
    canonical: "/",
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
  // google-site-verification=
  verification: {
    google: "185_4dmYsPnC_HqaFGhTqHj2m_YhyptqlcA7JbzhvHA",
    other: {
      "facebook-domain-verification": "kthtqxpp6w141r75p1d6q8y6jgsymo",
    },
  },

  icons: {
    icon: "/trivllo-logo.svg",
    shortcut: "/trivllo-logo.svg",
    apple: "/trivllo-logo.svg",
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: trivlloData.contact.website,
    siteName: trivlloData.company_name,

    title: `${trivlloData.company_name} — Book Hotels & Tours in India | trivllo.com`,

    description: `${trivlloData.company_name} is India's trusted platform for booking hotels, resorts, homestays, and curated tour packages. Best prices guaranteed.`,

    images: [
      {
        url: `/og-main-preview.png`,
        width: 1200,
        height: 630,
        alt: `${trivlloData.company_name} — Book Hotels & Tours in India`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: `${trivlloData.company_name} — Book Hotels & Tours in India`,

    description: `India's trusted platform for booking hotels and curated tour packages. Best prices, instant confirmation.`,

    images: [`/og-main-preview.png`],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#015e09",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${dancingScript.variable} antialiased `}
      >
        {/* ── JSON-LD Structured Data for SEO ── */}
        <JsonLd data={generateOrganizationJsonLd()} />
        <JsonLd data={generateWebSiteJsonLd()} />
        <JsonLd data={generateTravelAgencyJsonLd()} />

        <MainProvider>
          <TopLoader />

          {children}

          <Toaster position="bottom-left" expand />
        </MainProvider>
        <GoogleAnalytics gaId="G-WVD3DDLSLV" />

        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
