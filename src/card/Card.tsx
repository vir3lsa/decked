import React, { CSSProperties, FunctionComponent, memo, useEffect, useMemo, useRef, useState } from "react";
import { DragSourceMonitor, useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import deckImage from "../../assets/Macrovector/deck.jpg";
import ItemTypes from "../dnd";
import { useStoreActions, useStoreState } from "../model";
import "./Card.css";
import { positionMap } from "./common";

const cardStyle: CSSProperties = {
  backgroundImage: "",
  backgroundPosition: ""
};

interface Props {
  id: string;
  top?: string;
  stack?: string;
  stackDragging?: boolean;
  canDrag?: (card: ICard) => boolean;
}

// TODO prevent canDrag being different every time so memo() will work.
const Card: FunctionComponent<Props> = ({ id, top, stack, canDrag }) => {
  const [style, setStyle] = useState(cardStyle);
  const [boxStyle, setBoxStyle] = useState<CSSProperties>({});
  const card = useStoreState((state) => state.cards[id]);
  const animating = useStoreState((state) => state.animating);
  const clickMove = useStoreActions((store) => store.clickMove);
  const setDragging = useStoreActions((store) => store.setDragging);
  const recordPosition = useStoreActions((store) => store.recordPosition);
  const animationRef = useRef<HTMLDivElement>(null);
  const { suit, rank, isDragging: stackDragging } = card;

  const ableToDrag = useMemo(
    () => () => canDrag ? canDrag(card) && !animating : !animating,
    [id, suit, rank, canDrag, animating]
  );

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

    if (canMove && !animating) {
      if (animationRef.current) {
        const rect = animationRef.current.getBoundingClientRect();
        recordPosition({ id, position: { x: rect.left + window.scrollX, y: rect.top + window.scrollY } });
      }

      clickMove(card.id);
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

  useEffect(() => {
    if (animationRef.current) {
      const rect = animationRef.current.getBoundingClientRect();
      recordPosition({ id, position: { x: rect.left + window.scrollX, y: rect.top + window.scrollY } });
    }
  });

  // console.log(`${rank} of ${suit} rendering`);

  return (
    <div style={boxStyle} className={`nudgeBox ${ableToDrag() ? "draggable" : ""}`} ref={dragRef} onClick={handleClick}>
      <div style={style} className="card" role="img" ref={animationRef} />
    </div>
  );
};

export default Card;
