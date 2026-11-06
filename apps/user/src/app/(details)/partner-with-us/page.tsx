import PolicyTemplate from "@/components/policy/PolicyTemplate";
import { buildMetadata } from "@/lib/seo.config";

export const metadata = buildMetadata("partnerWithUs");

export default function PartnerWithUsPage() {
  return <PolicyTemplate currentSlug="partner-with-us" />;
}
