import React, { FunctionComponent } from "react";
import { useDragLayer, XYCoord } from "react-dnd";
import { DragPreview } from "../card";
import ItemTypes from "../dnd";
import { findStack, useStoreState } from "../model";
import "./DragLayer.css";

interface Props {
  dragMultiple?: boolean;
}

function getItemStyles(initialOffset: XYCoord | null, currentOffset: XYCoord | null) {
  if (!initialOffset || !currentOffset) {
    return {
      display: "none"
    };
  }

  const { x, y } = currentOffset;
  const transform = `translate(${x}px, ${y}px)`;

  return {
    transform,
    WebkitTransform: transform
  };
}

function renderItems(cards: ICard[], itemType: any) {
  switch (itemType) {
    case ItemTypes.CARD:
      return <DragPreview cards={cards} />;
    default:
      return null;
  }
}

const DragLayer: FunctionComponent<Props> = ({ dragMultiple = true }) => {
  const { itemType, isDragging, item, initialOffset, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging()
  }));

  const cardStacks = useStoreState((store) => store.cardStacks);
  let cards = [item];

  if (item && dragMultiple) {
    const [stack, index] = findStack(cardStacks, item.id);
    cards = stack.cards.slice(index); // Cards from index to the end (may just be one).
  }

  if (!isDragging) {
    return null;
  }

  return (
    <div className="layerStyles">
      <div style={getItemStyles(initialOffset, currentOffset)}>{renderItems(cards, itemType)}</div>
    </div>
  );
};

export default DragLayer;
