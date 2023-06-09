import { StoreProvider, ThunkCreator } from "easy-peasy";
import React, { FunctionComponent, ReactNode, useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AnimationLayer from "../animationLayer";
import {
  firstCompliments,
  mainCongratulations,
  playAgainLabels,
  secondCompliments,
  undoKeys,
  zerothCompliments
} from "../common/constants";
import DragLayer from "../dragLayer";
import { OnMove, OnUndo, store, useStoreActions, useStoreState } from "../model/storeModel";
import "./Playmat.css";

interface Props {
  setup?: (cardStacks: CardStacks, moveCardThunk: ThunkCreator<MoveCardThunkPayload>) => void;
  isWin?: IsWin;
  onMove?: OnMove;
  onUndo?: OnUndo;
  compareMoveStacks?: StackMoveComparator;
  dragMultiple?: boolean;
  children?: ReactNode;
}

const PlaymatInner: FunctionComponent<Props> = ({
  setup,
  isWin,
  onMove,
  onUndo,
  compareMoveStacks,
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
  const storeOnMove = useStoreState((store) => store.onMove);
  const storeOnUndo = useStoreState((store) => store.onUndo);
  const history = useStoreState((store) => store.history);

  const moveCardThunk = useStoreActions((store) => store.moveCardThunk);
  const setSetupHasRun = useStoreActions((store) => store.setSetupHasRun);
  const setIsWin = useStoreActions((store) => store.setIsWin);
  const undoThunk = useStoreActions((store) => store.undoThunk);
  const setCompareMoveStacks = useStoreActions((store) => store.setCompareMoveStacks);
  const setOnMove = useStoreActions((store) => store.setOnMove);
  const setOnUndo = useStoreActions((store) => store.setOnUndo);
  const setDragMultiple = useStoreActions((store) => store.setDragMultiple);
  const recordInitialCardStacks = useStoreActions((store) => store.recordInitialCardStacks);
  const resetToInitialState = useStoreActions((store) => store.resetToInitialState);

  const [confirmationDisplayed, setConfirmationDisplayed] = useState(false);
  const [mainCongratulation, setMainCongratulation] = useState<string>();
  const [complimentZero, setComplimentZero] = useState<string>();
  const [complimentOne, setComplimentOne] = useState<string>();
  const [complimentTwo, setComplimentTwo] = useState<string>();
  const [playAgainLabel, setPlayAgainLabel] = useState<string>();

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (undoKeys.includes(event.key)) {
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
    if (compareMoveStacks) {
      setCompareMoveStacks(compareMoveStacks);
    }
  }, [compareMoveStacks]);

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

  if (!complimentOne) {
    setMainCongratulation(mainCongratulations[Math.floor(Math.random() * mainCongratulations.length)]);
    setComplimentZero(zerothCompliments[Math.floor(Math.random() * zerothCompliments.length)]);
    setComplimentOne(firstCompliments[Math.floor(Math.random() * firstCompliments.length)]);
    setComplimentTwo(secondCompliments[Math.floor(Math.random() * secondCompliments.length)]);
    setPlayAgainLabel(playAgainLabels[Math.floor(Math.random() * playAgainLabels.length)]);
  }

  const handleUndo = () => {
    if (!onUndo || storeOnUndo) {
      undoThunk();
    }
  };

  const handleNewGame = () => {
    setConfirmationDisplayed(false);
    setComplimentOne(undefined);

    if (setupHasRun) {
      setSetupHasRun(false);
      resetToInitialState();
      setup?.(cardStacks, moveCardThunk);
      setSetupHasRun(true);
    }
  };

  return (
    <div className="page">
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
            <input type="button" value="NEW GAME" className="button" onClick={() => setConfirmationDisplayed(true)} />
            {!win && (
              <input
                type="button"
                value="UNDO (Z/U)"
                className="button"
                onClick={handleUndo}
                disabled={!history.length}
              />
            )}
          </>
        )}
      </div>
      {win ? (
        <div className="congrats">
          <div className="congratsTitle">{mainCongratulation}</div>
          <div className="congratsMessage">{`${complimentZero} ${complimentOne} ${complimentTwo}.`}</div>
          <div className="buttonBar gameOverButtons">
            <input type="button" value={playAgainLabel} className="button" onClick={handleNewGame} />
          </div>
        </div>
      ) : (
        <>{children}</>
      )}
    </div>
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
        <AnimationLayer />
      </DndProvider>
    </StoreProvider>
  );
};

export default Playmat;
