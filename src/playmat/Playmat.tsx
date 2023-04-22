import { ActionCreator, StoreProvider } from "easy-peasy";
import React, { FunctionComponent, ReactNode, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { store, useStoreActions, useStoreState } from "../model/storeModel";

interface Props {
  setup?: (cardStacks: CardStacks, moveCard: ActionCreator<MoveCardPayload>) => void;
  isWin?: (cardStacks: CardStacks) => boolean;
  children?: ReactNode;
}

const PlaymatInner: FunctionComponent<Props> = ({ setup, isWin, children }) => {
  const cardStacks = useStoreState(
    (store) => store.cardStacks,
    (previous, next) => Object.keys(previous).length === Object.keys(next).length
  );
  const setupHasRun = useStoreState((store) => store.setupHasRun);
  const storeIsWin = useStoreState((store) => store.isWin);
  const win = useStoreState((store) => store.win);
  const moveCard = useStoreActions((store) => store.moveCard);
  const setSetupHasRun = useStoreActions((store) => store.setSetupHasRun);
  const setIsWin = useStoreActions((store) => store.setIsWin);

  useEffect(() => {
    if (!storeIsWin && isWin) {
      setIsWin(isWin);
    }
  }, [isWin]);

  useEffect(() => {
    if (!setupHasRun && cardStacks && Object.keys(cardStacks).length) {
      setup?.(cardStacks, moveCard);
      setSetupHasRun(true);
    }
  }, [setup, cardStacks]);

  return <>{win ? <div>Congratulations!</div> : children}</>;
};

const Playmat: FunctionComponent<Props> = ({ setup, isWin, children }) => {
  return (
    <StoreProvider store={store}>
      <DndProvider backend={HTML5Backend}>
        <PlaymatInner setup={setup} isWin={isWin}>
          {children}
        </PlaymatInner>
      </DndProvider>
    </StoreProvider>
  );
};

export default Playmat;
