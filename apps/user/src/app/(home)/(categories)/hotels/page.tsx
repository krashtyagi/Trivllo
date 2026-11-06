import { Metadata } from "next";
import HotelsClientPage from "./hotels-client";
import trivlloData from "@/../trivllo.json";
import { buildMetadata } from "@/lib/seo.config";
import JsonLd from "@/components/seo/JsonLd";
import { generateBreadcrumbJsonLd, SITE_NAME } from "@/lib/seo.config";

export { type HotelFramePageProps, type HotelData, type hoteldata } from "./hotels-client";

export const metadata = buildMetadata("hotels");

const Page = () => {
  return (
    <>
      <JsonLd
        data={generateBreadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Hotels", url: "/hotels" },
        ])}
      />
      <HotelsClientPage type="hotels" />
    </>
  );
};

export default Page;
