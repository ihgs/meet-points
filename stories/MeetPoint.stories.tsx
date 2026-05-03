import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MeetPointView } from "@/components/meetpoint/MeetPointView";

const meta: Meta<typeof MeetPointView> = {
  title: "MeetPoint/MeetPointView",
  component: MeetPointView,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
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
      { id: "c3", stationId: "中目黒" },
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
