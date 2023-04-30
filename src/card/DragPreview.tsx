import React, { FunctionComponent } from "react";
import { SPREAD_FACTOR } from "../common/constants";
import CardDragPreview from "./CardDragPreview";
import "./Card.css";

interface Props {
  cards: ICard[];
}

const DragPreview: FunctionComponent<Props> = ({ cards }) => {
  return (
    <div className="stackPreview">
      {cards.map((card, index) => (
        <CardDragPreview
          key={`${card.id}-preview`}
          rank={card.rank}
          suit={card.suit}
          top={`${SPREAD_FACTOR * index}px`}
        />
      ))}
    </div>
  );
};

export default DragPreview;
