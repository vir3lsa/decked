import { StoreProvider, ThunkCreator } from "easy-peasy";
import React, { FunctionComponent, ReactNode, useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DragLayer from "../dragLayer";
import { OnMove, OnUndo, store, useStoreActions, useStoreState } from "../model/storeModel";
import "./Playmat.css";

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
  const history = useStoreState((store) => store.history);

  const moveCardThunk = useStoreActions((store) => store.moveCardThunk);
  const setSetupHasRun = useStoreActions((store) => store.setSetupHasRun);
  const setIsWin = useStoreActions((store) => store.setIsWin);
  const undoThunk = useStoreActions((store) => store.undoThunk);
  const setPreferredMoveStacks = useStoreActions((store) => store.setPreferredMoveStacks);
  const setOnMove = useStoreActions((store) => store.setOnMove);
  const setOnUndo = useStoreActions((store) => store.setOnUndo);
  const setDragMultiple = useStoreActions((store) => store.setDragMultiple);
  const undo = useStoreActions((store) => store.undoThunk);
  const recordInitialCardStacks = useStoreActions((store) => store.recordInitialCardStacks);
  const resetToInitialState = useStoreActions((store) => store.resetToInitialState);

  const [confirmationDisplayed, setConfirmationDisplayed] = useState(false);

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
      recordInitialCardStacks();
      setup?.(cardStacks, moveCardThunk);
      setSetupHasRun(true);
    }
  }, [setup, cardStacks]);

  const handleUndo = () => {
    if (!onUndo || storeOnUndo) {
      undo();
    }
  };

  const handleNewGame = () => {
    setConfirmationDisplayed(false);

    if (setupHasRun) {
      setSetupHasRun(false);
      resetToInitialState();
      setup?.(cardStacks, moveCardThunk);
      setSetupHasRun(true);
    }
  };

  return (
    <>
      {win ? (
        <div>Congratulations!</div>
      ) : (
        <>
          <div className="buttonBar">
            {confirmationDisplayed && (
              <>
                <label className="label">Are you sure?</label>
                <input type="button" value="NO" className="button" onClick={() => setConfirmationDisplayed(false)} />
                <input type="button" value="YES" className="button" onClick={handleNewGame} />
              </>
            )}
            {!confirmationDisplayed && (
              <>
                <input
                  type="button"
                  value="NEW GAME"
                  className="button"
                  onClick={() => setConfirmationDisplayed(true)}
                />
                <input
                  type="button"
                  value="UNDO (Z/U)"
                  className="button"
                  onClick={handleUndo}
                  disabled={!history.length}
                />
              </>
            )}
          </div>
          {children}
        </>
      )}
    </>
  );
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
