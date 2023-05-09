import React, { CSSProperties, FunctionComponent, useEffect, useMemo, useState } from "react";
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
  const [boxStyle, setBoxStyle] = useState<CSSProperties>({});
  const clickMove = useStoreActions((store) => store.clickMove);
  const setDragging = useStoreActions((store) => store.setDragging);
  const card = { id, suit, rank, colour };

  const ableToDrag = useMemo(() => () => canDrag ? canDrag(card) : true, [id, suit, rank, canDrag]);

  const [{ isDragging }, dragRef, previewRef] = useDrag(
    () => ({
      type: ItemTypes.CARD,
      item: () => card,
      canDrag: ableToDrag,
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
      opacity: isDragging || stackDragging ? 0 : 1
    });
  }, [suit, rank, isDragging, stackDragging]);

  useEffect(() => {
    setBoxStyle({ top });
  }, [top]);

  return (
    <div style={boxStyle} className={`nudgeBox ${ableToDrag() ? "draggable" : ""}`} ref={dragRef} onClick={handleClick}>
      <div className="cardHover">
        <div style={style} className="card" role="img" />
      </div>
    </div>
  );
};

export default Card;
