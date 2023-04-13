import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { StoreProvider } from "easy-peasy";

import Pile from "./Pile";
import { store } from "../model/storeModel";

// More on how to set up stories at: https://storybook.js.org/docs/7.0/react/writing-stories/introduction
const meta = {
  title: "Decked/Pile",
  component: Pile,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <StoreProvider store={store}>
        <Story />
      </StoreProvider>
    )
  ]
} satisfies Meta<typeof Pile>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/react/writing-stories/args
export const FullDeck: Story = {
  args: {
    name: "deck",
    spread: true,
    initialContents: "fullDeck"
  }
};
