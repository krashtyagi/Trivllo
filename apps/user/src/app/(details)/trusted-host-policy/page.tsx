import PolicyTemplate from "@/components/policy/PolicyTemplate";
import { buildMetadata } from "@/lib/seo.config";

export const metadata = buildMetadata("trustedHostPolicy");

export default function TrustedHostPolicyPage() {
  return <PolicyTemplate currentSlug="trusted-host-policy" />;
}
