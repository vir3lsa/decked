import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { StoreProvider } from "easy-peasy";
import { store } from "../model/storeModel";

import Card from "./Card";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

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
  },
  decorators: [
    (Story) => (
      <StoreProvider store={store}>
        <DndProvider backend={HTML5Backend}>
          <Story />
        </DndProvider>
      </StoreProvider>
    )
  ]
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/react/writing-stories/args
export const AceOfSpades: Story = {
  args: {
    id: "1",
    suit: "spades",
    colour: "black",
    rank: 1
  }
};
