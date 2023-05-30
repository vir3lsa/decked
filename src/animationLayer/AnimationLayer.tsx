import React, { CSSProperties, FunctionComponent, TransitionEvent, useEffect, useMemo, useRef, useState } from "react";
import { DragPreview } from "../card";
import { SLIDE_FAST_MILLIS, SLIDE_MILLIS, SPREAD_FACTOR } from "../common/constants";
import { useStoreState } from "../model";
import "./AnimationLayer.css";

const AnimationLayer: FunctionComponent = () => {
  const slidingCards = useStoreState((state) => state.slidingCardObjs);
  const slidingToStack = useStoreState((state) => state.slidingToStack);
  const slideType = useStoreState((state) => state.slideType);
  const onSlideStart = useStoreState((state) => state.onSlideStart);
  const onSlideEnd = useStoreState((state) => state.onSlideEnd);
  const [style, setStyle] = useState<CSSProperties>({});
  const [trigger, setTrigger] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const toCards = slidingToStack?.cards;
  const slideTime = slideType === "fast" ? SLIDE_FAST_MILLIS : SLIDE_MILLIS;

  let x = 0;
  let y = 0;

  useEffect(() => {
    setStyle(
      slidingCards.length
        ? {
            transition: `transform ${slideTime}ms ease`,
            left: `${slidingCards[0].position?.x || 0}px`,
            top: `${slidingCards[0].position?.y || 0}px`,
            transform: "translate(0, 0)"
          }
        : {}
    );

    setTrigger(!trigger);
  }, [slidingCards.reduce((acc, card) => acc + card.id, "")]);

  useEffect(() => {
    if (slidingCards.length) {
      if (slidingToStack && toCards) {
        x = slidingToStack.position.x - (slidingCards[0].position?.x || 0);
        y =
          slidingToStack.position.y +
          (slidingToStack.spread ? toCards.length * SPREAD_FACTOR : 0) -
          (slidingCards[0].position?.y || 0);
      }

      setStyle({
        transition: `transform ${slideTime}ms ease`,
        left: `${slidingCards[0].position?.x || 0}px`,
        top: `${slidingCards[0].position?.y || 0}px`,
        transform: `translate(${x}px, ${y}px)`
      });

      onSlideStart?.();
    }
  }, [trigger]);

  const handleTransitionEnd = useMemo(
    () => (event: TransitionEvent<HTMLDivElement>) => {
      if (event.propertyName === "transform") {
        onSlideEnd?.();
      }
    },
    [onSlideEnd]
  );

  return (
    <div className="animationLayerStyles">
      {slidingCards.length ? (
        <div style={style} className="animation" ref={ref} onTransitionEnd={handleTransitionEnd}>
          <DragPreview cards={slidingCards} />
        </div>
      ) : undefined}
    </div>
  );
};

export default AnimationLayer;
