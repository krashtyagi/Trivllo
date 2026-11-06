import PolicyTemplate from "@/components/policy/PolicyTemplate";
import { buildMetadata } from "@/lib/seo.config";

export const metadata = buildMetadata("cancellationPolicy");

export default function CancellationPolicyPage() {
  return <PolicyTemplate currentSlug="cancellation-policy" />;
}
