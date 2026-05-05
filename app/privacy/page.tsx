import type { Metadata } from "next";
import { PolicyView } from "@/components/policy/PolicyView";
import { privacyContent } from "@/lib/policies/privacy";

export const metadata: Metadata = {
  title: "プライバシーポリシー — マンナカ",
  description: "マンナカのプライバシーポリシー",
};

export default function PrivacyPage() {
  return <PolicyView {...privacyContent} />;
}
