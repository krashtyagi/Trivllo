import { Metadata } from "next";
import ToursClientPage from "./tours-client";
import trivlloData from "@/../trivllo.json";
import { buildMetadata } from "@/lib/seo.config";
import JsonLd from "@/components/seo/JsonLd";
import { generateBreadcrumbJsonLd, SITE_NAME } from "@/lib/seo.config";

export const metadata = buildMetadata("tours");

const Page = () => {
  return (
    <>
      <JsonLd
        data={generateBreadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Tours", url: "/tours" },
        ])}
      />
      <ToursClientPage />
    </>
  );
};

export default Page;
