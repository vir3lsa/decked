import { ActionCreator, StoreProvider } from "easy-peasy";
import React, { FunctionComponent, ReactNode, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { OnMove, store, useStoreActions, useStoreState } from "../model/storeModel";

interface Props {
  setup?: (cardStacks: CardStacks, moveCard: ActionCreator<MoveCardPayload>) => void;
  isWin?: IsWin;
  onMove?: OnMove;
  preferredMoveStacks?: string[];
  children?: ReactNode;
}

const PlaymatInner: FunctionComponent<Props> = ({ setup, isWin, onMove, preferredMoveStacks, children }) => {
  const cardStacks = useStoreState(
    (store) => store.cardStacks,
    (previous, next) => Object.keys(previous).length === Object.keys(next).length
  );
  const setupHasRun = useStoreState((store) => store.setupHasRun);
  const storeIsWin = useStoreState((store) => store.isWin);
  const win = useStoreState((store) => store.win);
  const storePreferredMoveStacks = useStoreState((store) => store.preferredMoveStacks);
  const storeOnMove = useStoreState((store) => store.onMove);

  const moveCard = useStoreActions((store) => store.moveCard);
  const setSetupHasRun = useStoreActions((store) => store.setSetupHasRun);
  const setIsWin = useStoreActions((store) => store.setIsWin);
  const undo = useStoreActions((store) => store.undo);
  const setPreferredMoveStacks = useStoreActions((store) => store.setPreferredMoveStacks);
  const setOnMove = useStoreActions((store) => store.setOnMove);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === "z" || event.key === "u") {
        undo();
      }
    };

    document.addEventListener("keypress", listener);
    return () => document.removeEventListener("keypress", listener);
  }, []);

  useEffect(() => {
    if (!storeIsWin && isWin) {
      setIsWin(isWin);
    }
  }, [isWin]);

  useEffect(() => {
    if (!storePreferredMoveStacks.length && preferredMoveStacks) {
      setPreferredMoveStacks(preferredMoveStacks);
    }
  }, [preferredMoveStacks]);

  useEffect(() => {
    if (!storeOnMove && onMove) {
      setOnMove(onMove);
    }
  }, [onMove]);

  useEffect(() => {
    if (!setupHasRun && cardStacks && Object.keys(cardStacks).length) {
      setup?.(cardStacks, moveCard);
      setSetupHasRun(true);
    }
  }, [setup, cardStacks]);

  return <>{win ? <div>Congratulations!</div> : children}</>;
};

const Playmat: FunctionComponent<Props> = ({ children, ...innerArgs }) => {
  return (
    <StoreProvider store={store}>
      <DndProvider backend={HTML5Backend}>
        <PlaymatInner {...innerArgs}>{children}</PlaymatInner>
      </DndProvider>
    </StoreProvider>
  );
};

export default Playmat;
