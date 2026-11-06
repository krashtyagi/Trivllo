import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/seo.config";

export const metadata: Metadata = {
  title: `Page Not Found | ${SITE_NAME}`,
  description: `The page you're looking for doesn't exist. Return to ${SITE_NAME} to continue exploring hotels, tours, and adventures.`,
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        textAlign: "center",
        padding: "2rem",
        background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)",
      }}
    >
      <h1
        style={{
          fontSize: "8rem",
          fontWeight: 800,
          background: "linear-gradient(135deg, #015e09, #059669)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1,
          margin: 0,
        }}
      >
        404
      </h1>

      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: 600,
          color: "#1a1a2e",
          margin: "1rem 0 0.5rem",
        }}
      >
        Page Not Found
      </h2>

      <p
        style={{
          fontSize: "1.1rem",
          color: "#64748b",
          maxWidth: "480px",
          marginBottom: "2rem",
        }}
      >
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>

      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.75rem 2rem",
          backgroundColor: "#015e09",
          color: "#fff",
          borderRadius: "9999px",
          fontSize: "1rem",
          fontWeight: 600,
          textDecoration: "none",
          transition: "transform 0.2s, box-shadow 0.2s",
          boxShadow: "0 4px 14px rgba(1, 94, 9, 0.3)",
        }}
      >
        ← Back to {SITE_NAME}
      </Link>
    </div>
  );
}
