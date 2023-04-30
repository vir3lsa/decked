import React, { CSSProperties, FunctionComponent, useEffect, useState } from "react";
import { DragSourceMonitor, useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import deckImage from "../../assets/Macrovector/deck.jpg";
import ItemTypes from "../dnd";
import { useStoreActions } from "../model";
import "./Card.css";
import { positionMap } from "./common";

const cardStyle: CSSProperties = {
  backgroundImage: "",
  backgroundPosition: ""
};

interface Props {
  id: string;
  suit: Suit;
  rank: Rank;
  colour: Colour;
  top?: string;
  stack?: string;
  stackDragging?: boolean;
  canDrag?: (card: ICard) => boolean;
}

const Card: FunctionComponent<Props> = ({ id, suit, rank, colour, top, stack, stackDragging, canDrag }) => {
  const [style, setStyle] = useState(cardStyle);
  const clickMove = useStoreActions((store) => store.clickMove);
  const setDragging = useStoreActions((store) => store.setDragging);
  const card = { id, suit, rank, colour };

  const [{ isDragging }, dragRef, previewRef] = useDrag(
    () => ({
      type: ItemTypes.CARD,
      item: () => card,
      canDrag: () => (canDrag ? canDrag(card) : true),
      collect: (monitor: DragSourceMonitor) => ({
        isDragging: monitor.isDragging()
      })
    }),
    [id, suit, rank, canDrag]
  );

  useEffect(() => {
    previewRef(getEmptyImage(), { captureDraggingState: true });
  }, []);

  useEffect(() => {
    if (stack) {
      setDragging({ cardId: id, dragging: isDragging, stack });
    }
  }, [isDragging, stack]);

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
      top,
      opacity: isDragging || stackDragging ? 0 : 1
    });
  }, [suit, rank, top, isDragging, stackDragging]);

  return <div style={style} className="card" role="img" ref={dragRef} onClick={handleClick} />;
};

export default Card;
