import { buildMetadata } from "@/lib/seo.config";
import JsonLd from "@/components/seo/JsonLd";
import { generateBreadcrumbJsonLd } from "@/lib/seo.config";

export const metadata = buildMetadata("hotelsFind");

export default function HotelsFindLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={generateBreadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Hotels", url: "/hotels" },
          { name: "Search Hotels", url: "/hotels/find" },
        ])}
      />
      {children}
    </>
  );
}
