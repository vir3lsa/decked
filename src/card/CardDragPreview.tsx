import React, { CSSProperties, FunctionComponent, memo, useEffect, useState } from "react";
import deckImage from "../../assets/Macrovector/deck.jpg";
import "./Card.css";
import { positionMap } from "./common";

interface Props {
  suit: Suit;
  rank: Rank;
  top: string;
}

const cardStyle: CSSProperties = {
  backgroundImage: "",
  backgroundPosition: ""
};

const CardDragPreview: FunctionComponent<Props> = memo(({ suit, rank, top }) => {
  const [style, setStyle] = useState(cardStyle);

  useEffect(() => {
    setStyle({
      ...cardStyle,
      backgroundImage: `url(${deckImage})`,
      backgroundPosition: `${positionMap[suit][rank].x}px ${positionMap[suit][rank].y}px`,
      backgroundSize: `${positionMap[suit][rank].size || 1480}px auto`,
      top
    });
  }, [suit, rank]);

  return <div style={style} className="nudgeBox card" role="img" />;
});

export default CardDragPreview;
