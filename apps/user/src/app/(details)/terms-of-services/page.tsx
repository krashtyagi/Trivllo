import PolicyTemplate from "@/components/policy/PolicyTemplate";
import { buildMetadata } from "@/lib/seo.config";

export const metadata = buildMetadata("termsOfServices");

export default function TermsOfServicesPage() {
  return <PolicyTemplate currentSlug="terms-of-services" />;
}
