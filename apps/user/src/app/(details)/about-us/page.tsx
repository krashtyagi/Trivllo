import PolicyTemplate from "@/components/policy/PolicyTemplate";
import { buildMetadata } from "@/lib/seo.config";

export const metadata = buildMetadata("aboutUs");

export default function AboutUsPage() {
  return <PolicyTemplate currentSlug="about-us" />;
}
