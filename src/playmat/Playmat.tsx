import { StoreProvider, ThunkCreator } from "easy-peasy";
import React, { FunctionComponent, ReactNode, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DragLayer from "../dragLayer";
import { OnMove, OnUndo, store, useStoreActions, useStoreState } from "../model/storeModel";

interface Props {
  setup?: (cardStacks: CardStacks, moveCardThunk: ThunkCreator<MoveCardThunkPayload>) => void;
  isWin?: IsWin;
  onMove?: OnMove;
  onUndo?: OnUndo;
  preferredMoveStacks?: string[];
  dragMultiple?: boolean;
  children?: ReactNode;
}

const PlaymatInner: FunctionComponent<Props> = ({
  setup,
  isWin,
  onMove,
  onUndo,
  preferredMoveStacks,
  dragMultiple,
  children
}) => {
  const cardStacks = useStoreState(
    (store) => store.cardStacks,
    (previous, next) => Object.keys(previous).length === Object.keys(next).length
  );
  const setupHasRun = useStoreState((store) => store.setupHasRun);
  const storeIsWin = useStoreState((store) => store.isWin);
  const win = useStoreState((store) => store.win);
  const storePreferredMoveStacks = useStoreState((store) => store.preferredMoveStacks);
  const storeOnMove = useStoreState((store) => store.onMove);
  const storeOnUndo = useStoreState((store) => store.onUndo);

  const moveCardThunk = useStoreActions((store) => store.moveCardThunk);
  const setSetupHasRun = useStoreActions((store) => store.setSetupHasRun);
  const setIsWin = useStoreActions((store) => store.setIsWin);
  const undoThunk = useStoreActions((store) => store.undoThunk);
  const setPreferredMoveStacks = useStoreActions((store) => store.setPreferredMoveStacks);
  const setOnMove = useStoreActions((store) => store.setOnMove);
  const setOnUndo = useStoreActions((store) => store.setOnUndo);
  const setDragMultiple = useStoreActions((store) => store.setDragMultiple);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === "z" || event.key === "u") {
        undoThunk();
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
    setDragMultiple(dragMultiple === undefined ? true : dragMultiple);
  }, [dragMultiple]);

  useEffect(() => {
    if (!storeOnMove && onMove) {
      setOnMove(onMove);
    }
  }, [onMove]);

  useEffect(() => {
    if (!storeOnUndo && onUndo) {
      setOnUndo(onUndo);
    }
  }, [onUndo]);

  useEffect(() => {
    if (!setupHasRun && cardStacks && Object.keys(cardStacks).length) {
      setup?.(cardStacks, moveCardThunk);
      setSetupHasRun(true);
    }
  }, [setup, cardStacks]);

  return <>{win ? <div>Congratulations!</div> : children}</>;
};

const Playmat: FunctionComponent<Props> = ({ dragMultiple, children, ...innerArgs }) => {
  return (
    <StoreProvider store={store}>
      <DndProvider backend={HTML5Backend}>
        <PlaymatInner dragMultiple={dragMultiple} {...innerArgs}>
          {children}
        </PlaymatInner>
        <DragLayer dragMultiple={dragMultiple} />
      </DndProvider>
    </StoreProvider>
  );
};

export default Playmat;
