import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MeetPointView } from "@/components/meetpoint/MeetPointView";

const meta: Meta<typeof MeetPointView> = {
  title: "MeetPoint/MeetPointView",
  component: MeetPointView,
  tags: ["autodocs", "vrt"],
  parameters: {
    layout: "fullscreen",
  },
  play: async () => {
    // VRT 実行時のみ、データ取得 + 検索完了を待ってからスクリーンショットを撮る
    if (!(globalThis as { __vitest_browser__?: boolean }).__vitest_browser__) return;
    await new Promise((r) => setTimeout(r, 1500));
  },
};
export default meta;
type Story = StoryObj<typeof MeetPointView>;

export const Default: Story = {
  args: {
    initialMembers: [
      { id: "m1", stationId: "新宿" },
      { id: "m2", stationId: "横浜" },
      { id: "m3", stationId: "吉祥寺" },
    ],
    initialCandidates: [],
  },
};

export const TwoMembers: Story = {
  args: {
    initialMembers: [
      { id: "m1", stationId: "渋谷" },
      { id: "m2", stationId: "池袋" },
    ],
    initialCandidates: [],
  },
};

export const WithManualCandidates: Story = {
  args: {
    initialMembers: [
      { id: "m1", stationId: "新宿" },
      { id: "m2", stationId: "横浜" },
    ],
    initialCandidates: [
      { id: "c1", stationId: "渋谷" },
      { id: "c2", stationId: "恵比寿" },
      { id: "c3", stationId: "日比谷" },
    ],
  },
};

export const ManyMembers: Story = {
  args: {
    initialMembers: [
      { id: "m1", stationId: "大宮" },
      { id: "m2", stationId: "千葉" },
      { id: "m3", stationId: "横浜" },
      { id: "m4", stationId: "立川" },
      { id: "m5", stationId: "柏" },
    ],
    initialCandidates: [],
  },
};

export const EmptyInputs: Story = {
  args: {
    initialMembers: [
      { id: "m1", stationId: null },
      { id: "m2", stationId: null },
    ],
    initialCandidates: [],
  },
};
