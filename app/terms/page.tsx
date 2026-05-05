import type { Metadata } from "next";
import { PolicyView } from "@/components/policy/PolicyView";
import { termsContent } from "@/lib/policies/terms";

export const metadata: Metadata = {
  title: "利用規約 — マンナカ",
  description: "マンナカの利用規約",
};

export default function TermsPage() {
  return <PolicyView {...termsContent} />;
}
