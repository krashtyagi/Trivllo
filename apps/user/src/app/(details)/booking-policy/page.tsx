import PolicyTemplate from "@/components/policy/PolicyTemplate";
import { buildMetadata } from "@/lib/seo.config";

export const metadata = buildMetadata("bookingPolicy");

export default function BookingPolicyPage() {
  return <PolicyTemplate currentSlug="booking-policy" />;
}
