import type { Meta, StoryObj } from "@storybook/react";

import Card from "./Card";

// More on how to set up stories at: https://storybook.js.org/docs/7.0/react/writing-stories/introduction
const meta = {
  title: "Decked/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    suit: {
      options: ["hearts", "spades", "diamonds", "clubs"],
      control: "select"
    },
    rank: {
      control: { type: "number", min: 1, max: 13 }
    }
  }
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/react/writing-stories/args
export const Empty: Story = {
  args: {
    suit: "spades",
    rank: "ace"
  }
};
