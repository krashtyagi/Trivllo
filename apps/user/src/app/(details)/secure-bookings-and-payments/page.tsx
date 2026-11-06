import PolicyTemplate from "@/components/policy/PolicyTemplate";
import { buildMetadata } from "@/lib/seo.config";

export const metadata = buildMetadata("secureBookingsAndPayments");

export default function SecureBookingsAndPaymentsPage() {
  return <PolicyTemplate currentSlug="secure-bookings-and-payments" />;
}
