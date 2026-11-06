import { buildMetadata } from "@/lib/seo.config";
import JsonLd from "@/components/seo/JsonLd";
import { generateBreadcrumbJsonLd } from "@/lib/seo.config";

export const metadata = buildMetadata("toursFind");

export default function ToursFindLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={generateBreadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Tours", url: "/tours" },
          { name: "Search Tours", url: "/tours/find" },
        ])}
      />
      {children}
    </>
  );
}
