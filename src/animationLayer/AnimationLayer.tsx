import React, { CSSProperties, FunctionComponent, TransitionEvent, useEffect, useMemo, useRef, useState } from "react";
import { DragPreview } from "../card";
import { SLIDE_DELAY_MILLIS, SLIDE_MILLIS, SPREAD_FACTOR } from "../common/constants";
import { useStoreState } from "../model";
import "./AnimationLayer.css";

const AnimationLayer: FunctionComponent = () => {
  const slidingCard = useStoreState((state) => state.slidingCardObj);
  const slidingToStack = useStoreState((state) => state.slidingToStack);
  const onSlideStart = useStoreState((state) => state.onSlideStart);
  const onSlideEnd = useStoreState((state) => state.onSlideEnd);
  const [style, setStyle] = useState<CSSProperties>({});
  const [trigger, setTrigger] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const toCards = slidingToStack?.cards;
  let x = 0,
    y = 0;

  useEffect(() => {
    setStyle(
      slidingCard
        ? {
            transition: `transform ${SLIDE_MILLIS}ms ease`,
            left: `${slidingCard.position?.x || 0}px`,
            top: `${slidingCard.position?.y || 0}px`,
            transform: "translate(0, 0)"
          }
        : {}
    );
    setTrigger(!trigger);
  }, [slidingCard?.id]);

  useEffect(() => {
    if (slidingCard) {
      if (slidingToStack && toCards) {
        x = slidingToStack.position.x - (slidingCard.position?.x || 0);
        y =
          slidingToStack.position.y +
          (slidingToStack.spread ? toCards.length * SPREAD_FACTOR : 0) -
          (slidingCard.position?.y || 0);
      }

      setStyle({
        transition: `transform ${SLIDE_MILLIS}ms ease`,
        left: `${slidingCard.position?.x || 0}px`,
        top: `${slidingCard.position?.y || 0}px`,
        transform: `translate(${x}px, ${y}px)`
      });
      onSlideStart?.();
    }
  }, [trigger]);

  const handleTransitionEnd = useMemo(
    () => (event: TransitionEvent<HTMLDivElement>) => {
      if (event.propertyName === "transform") {
        onSlideEnd?.();
        setTimeout(() => setStyle({}), SLIDE_DELAY_MILLIS);
      }
    },
    [onSlideEnd]
  );

  return (
    <div className="animationLayerStyles">
      {slidingCard && (
        <div style={style} className="animation" ref={ref} onTransitionEnd={handleTransitionEnd}>
          <DragPreview cards={[slidingCard]} />
        </div>
      )}
    </div>
  );
};

export default AnimationLayer;
