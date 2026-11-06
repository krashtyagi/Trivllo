import PolicyTemplate from "@/components/policy/PolicyTemplate";
import { buildMetadata } from "@/lib/seo.config";

export const metadata = buildMetadata("codeOfConduct");

export default function CodeOfConductPage() {
  return <PolicyTemplate currentSlug="code-of-conduct" />;
}
