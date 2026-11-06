import PolicyTemplate from "@/components/policy/PolicyTemplate";
import { buildMetadata } from "@/lib/seo.config";

export const metadata = buildMetadata("privacyPolicy");

export default function PrivacyPolicyPage() {
  return <PolicyTemplate currentSlug="privacy-policy" />;
}
