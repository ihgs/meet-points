import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PolicyView } from "@/components/policy/PolicyView";
import { termsContent } from "@/lib/policies/terms";
import { privacyContent } from "@/lib/policies/privacy";

const meta: Meta<typeof PolicyView> = {
  title: "Policy/PolicyView",
  component: PolicyView,
  tags: ["autodocs", "vrt"],
  parameters: {
    layout: "fullscreen",
  },
};
export default meta;
type Story = StoryObj<typeof PolicyView>;

export const Terms: Story = {
  name: "利用規約",
  args: termsContent,
};

export const Privacy: Story = {
  name: "プライバシーポリシー",
  args: privacyContent,
};

export const Minimal: Story = {
  name: "最小構成（構造確認用）",
  args: {
    title: "サンプルポリシー",
    lastUpdated: "2026-05-05",
    intro: "本ポリシーはレイアウト確認用のサンプルです。",
    sections: [
      {
        heading: "段落のみ",
        paragraphs: [
          "段落のスタイルを確認するためのテキスト。",
          "改行を伴う複数段落の余白を確認する。",
        ],
      },
      {
        heading: "リスト付き",
        paragraphs: ["以下のリストの見え方を確認する。"],
        list: ["項目 A", "項目 B", "項目 C"],
      },
    ],
  },
};
