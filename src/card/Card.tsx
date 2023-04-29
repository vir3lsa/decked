import React, { CSSProperties, FunctionComponent, useEffect, useState } from "react";
import { useDrag } from "react-dnd";
import deckImage from "../../assets/Macrovector/deck.jpg";
import ItemTypes from "../dnd";
import { useStoreActions } from "../model";
import "./Card.css";

const positionMap = {
  hearts: {
    ace: { x: -676, y: -399 },
    1: { x: -676, y: -399 },
    2: { x: -1156, y: -1266 },
    3: { x: -1156, y: -1049 },
    4: { x: -1156, y: -832 },
    5: { x: -1156, y: -615 },
    6: { x: -1156, y: -398 },
    7: { x: -1156, y: -181 },
    8: { x: -357, y: -1268 },
    9: { x: -357, y: -1051 },
    10: { x: -357, y: -834 },
    11: { x: -357, y: -618 },
    12: { x: -357, y: -399 },
    13: { x: -357, y: -183 },
    jack: { x: -357, y: -618 },
    queen: { x: -357, y: -399 },
    king: { x: -357, y: -183 },
    back: { x: -855, y: -236 }
  },
  spades: {
    ace: { x: -676, y: -616 },
    1: { x: -676, y: -616 },
    2: { x: -995, y: -1267 },
    3: { x: -995, y: -1050 },
    4: { x: -995, y: -833 },
    5: { x: -995, y: -616 },
    6: { x: -995, y: -400 },
    7: { x: -995, y: -183 },
    8: { x: -196, y: -1269 },
    9: { x: -196, y: -1052 },
    10: { x: -196, y: -835 },
    11: { x: -196, y: -619 },
    12: { x: -196, y: -400 },
    13: { x: -195, y: -183 },
    jack: { x: -196, y: -619 },
    queen: { x: -196, y: -400 },
    king: { x: -195, y: -183 },
    back: { x: -855, y: -236 }
  },
  diamonds: {
    ace: { x: -676, y: -833 },
    1: { x: -676, y: -833 },
    2: { x: -832, y: -1267 },
    3: { x: -832, y: -1050 },
    4: { x: -832, y: -833 },
    5: { x: -832, y: -616 },
    6: { x: -832, y: -399 },
    7: { x: -832, y: -182 },
    8: { x: -34, y: -1269 },
    9: { x: -34, y: -1052 },
    10: { x: -34, y: -835 },
    11: { x: -34, y: -619 },
    12: { x: -34, y: -400 },
    13: { x: -34, y: -183 },
    jack: { x: -34, y: -619 },
    queen: { x: -34, y: -400 },
    king: { x: -34, y: -183 },
    back: { x: -855, y: -236 }
  },
  clubs: {
    ace: { x: -676, y: -182 },
    1: { x: -676, y: -182 },
    2: { x: -1318, y: -1266 },
    3: { x: -1318, y: -1049 },
    4: { x: -1318, y: -832 },
    5: { x: -1318, y: -615 },
    6: { x: -1318, y: -398 },
    7: { x: -1318, y: -181 },
    8: { x: -519, y: -1268 },
    9: { x: -519, y: -1051 },
    10: { x: -519, y: -834 },
    11: { x: -519, y: -618 },
    12: { x: -519, y: -399 },
    13: { x: -518, y: -183 },
    jack: { x: -519, y: -619 },
    queen: { x: -519, y: -399 },
    king: { x: -518, y: -183 },
    back: { x: -855, y: -236 }
  }
};

const cardStyle: CSSProperties = {
  backgroundImage: "",
  backgroundPosition: ""
};

interface Props {
  id: string;
  suit: "hearts" | "diamonds" | "spades" | "clubs";
  rank: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
  colour: Colour;
  top?: string;
  canDrag?: (card: ICard) => boolean;
}

const Card: FunctionComponent<Props> = ({ id, suit, rank, colour, top, canDrag }) => {
  const [style, setStyle] = useState(cardStyle);
  const clickMove = useStoreActions((store) => store.clickMove);
  const card = { id, suit, rank, colour };

  const [, dragRef] = useDrag(
    () => ({
      type: ItemTypes.CARD,
      item: () => card,
      canDrag: () => (canDrag ? canDrag(card) : true)
    }),
    [id, suit, rank, canDrag]
  );

  const handleClick = () => {
    const canMove = canDrag ? canDrag(card) : true;

    if (canMove) {
      clickMove(card);
    }
  };

  useEffect(() => {
    setStyle({
      ...cardStyle,
      backgroundImage: `url(${deckImage})`,
      backgroundPosition: `${positionMap[suit][rank].x}px ${positionMap[suit][rank].y}px`,
      top
    });
  }, [suit, rank, top]);

  return <div style={style} className="card" role="img" ref={dragRef} onClick={handleClick} />;
};

export default Card;
