import {
  action,
  Action,
  ActionCreator,
  computed,
  Computed,
  createStore,
  createTypedHooks,
  thunk,
  Thunk,
  ThunkCreator
} from "easy-peasy";
import { ON_MOVE_DELAY_MILLIS } from "../common/constants";

export type MoveCardThunk = ThunkCreator<MoveCardThunkPayload>;
export type UndoThunk = ThunkCreator;
export type SetSlideAction = ActionCreator<SlidePayload>;
export type OnMove = (
  cards: CardMap,
  cardStacks: CardStacks,
  move: Move,
  moveCardThunk: MoveCardThunk,
  setSlide: SetSlideAction
) => boolean;
export type OnUndo = (cardStacks: CardStacks, history: Move[], undoThunk: UndoThunk) => void;

export interface StoreModel {
  cards: CardMap;
  cardStacks: CardStacks;
  initialCardStacks: CardStacks;
  setupHasRun: boolean;
  isWin?: IsWin;
  win: boolean;
  history: Move[];
  compareMoveStacks: StackMoveComparator;
  onMove?: OnMove;
  onUndo?: OnUndo;
  dragMultiple?: boolean;
  slidingCards: string[];
  slidingToStack?: IStack;
  slideType?: SlideType;
  animating: boolean;
  onSlideStart?: VoidCallback;
  onSlideEnd?: VoidCallback;
  slidingCardObjs: Computed<StoreModel, ICard[]>;
  addStack: Action<StoreModel, AddStackPayload>;
  addCardsToStack: Action<StoreModel, AddCardsToStackPayload>;
  moveCards: Action<StoreModel, Move>;
  moveCardThunk: Thunk<StoreModel, MoveCardThunkPayload>;
  setSetupHasRun: Action<StoreModel, boolean>;
  setIsWin: Action<StoreModel, IsWin>;
  setWin: Action<StoreModel, boolean>;
  undo: Action<StoreModel>;
  undoThunk: Thunk<StoreModel>;
  clickMove: Thunk<StoreModel, string>;
  setCompareMoveStacks: Action<StoreModel, StackMoveComparator>;
  setOnMove: Action<StoreModel, OnMove>;
  setOnUndo: Action<StoreModel, OnUndo>;
  setDragging: Action<StoreModel, SetDraggingPayload>;
  setDragMultiple: Action<StoreModel, boolean>;
  recordInitialCardStacks: Action<StoreModel>;
  resetToInitialState: Action<StoreModel>;
  recordPosition: Action<StoreModel, RecordPositionPayload>;
  setSlide: Action<StoreModel, SlidePayload>;
  setOnSlideEnd: Action<StoreModel, VoidCallback>;
  setAnimating: Action<StoreModel, boolean>;
}

export const findStack = (cardStacks: CardStacks, cardId: string): [IStack, number] => {
  let fromStack: IStack | undefined, fromIndex: number | undefined;
  Object.values(cardStacks).forEach((stack) => {
    if (fromStack) {
      // Short-circuit if we've already found the stack.
      return;
    }

    const indexOfCard = stack.cards.indexOf(cardId);

    if (indexOfCard > -1) {
      fromStack = stack;
      fromIndex = indexOfCard;
    }
  });

  if (!fromStack || fromIndex === undefined) {
    throw Error(`Couldn't find card ${cardId} in any stack.`);
  }

  return [fromStack, fromIndex];
};

export const store = createStore<StoreModel>({
  cards: {},
  cardStacks: {},
  initialCardStacks: {},
  setupHasRun: false,
  win: false,
  history: [],
  compareMoveStacks: () => 0,
  animating: false,
  slidingCards: [],
  slidingCardObjs: computed((state) => state.slidingCards.map((card) => state.cards[card])),
  addStack: action((state, { stack, cards }) => {
    state.cardStacks[stack.name] = stack;
    // Add the cards to the model.
    cards?.forEach((card) => (state.cards[card.id] = card));
  }),
  addCardsToStack: action((state, { cards, stackName }) => {
    cards.forEach((card) => state.cardStacks[stackName].cards.push(card));
  }),
  moveCards: action((state, move) => {
    const { cards, fromIndex, fromStack, toStack } = move;
    // Add the card to the new stack if we're doing initial setup
    if (!state.setupHasRun) {
      cards.forEach((card) => state.cardStacks[toStack].cards.push(card));
    }

    // Remove the cards from the old stack
    state.cardStacks[fromStack].cards.splice(fromIndex, cards.length);

    if (state.setupHasRun) {
      // Record the move
      state.history.push(move);
    }
  }),
  moveCardThunk: thunk((actions, { cards, toStack }, helpers) => {
    const state = helpers.getState();
    let [fromStack, fromIndex] = findStack(state.cardStacks, cards[0]);

    if (!fromStack || fromIndex === undefined) {
      throw Error(`Couldn't find card ${cards[0]}.`);
    }

    const move = {
      cards,
      fromStack: fromStack.name,
      toStack,
      fromIndex,
      toIndex: state.cardStacks[toStack].cards.length,
      fromTop: fromIndex === fromStack.cards.length - 1
    };

    // Update the state.
    actions.moveCards(move);

    if (state.setupHasRun) {
      const finishMoveCard = () => {
        actions.addCardsToStack({ cards, stackName: toStack });

        // Check the win condition
        if (state.isWin?.(helpers.getState().cardStacks)) {
          actions.setWin(true);
        }

        setTimeout(() => {
          actions.setSlide({ animating: true, slidingCards: [], slidingToStack: undefined });
        });

        setTimeout(() => {
          const anotherMove = state.onMove?.(
            helpers.getState().cards,
            helpers.getState().cardStacks,
            move,
            actions.moveCardThunk,
            actions.setSlide
          );

          if (!anotherMove) {
            actions.setAnimating(false);
          }
        }, ON_MOVE_DELAY_MILLIS);
      };

      // Add card to new stack, stop animation and trigger onMove callback.
      if (state.animating) {
        actions.setOnSlideEnd(finishMoveCard);
      } else {
        // If we're dragging (not animating) finish straight away.
        finishMoveCard();
      }
    }
  }),
  setSetupHasRun: action((state, setupHasRun) => {
    state.setupHasRun = setupHasRun;
  }),
  setIsWin: action((state, isWin) => {
    state.isWin = isWin;
  }),
  undo: action((state) => {
    const lastMove = state.history.pop();

    if (lastMove) {
      const fromStack = state.cardStacks[lastMove.fromStack];
      const toStack = state.cardStacks[lastMove.toStack];

      if (lastMove.cards && fromStack && toStack) {
        lastMove.cards.forEach((card, index) => {
          toStack.cards.splice(lastMove.toIndex, 1);
          fromStack.cards.splice(lastMove.fromIndex + index, 0, card);
        });
      } else {
        throw Error("Couldn't undo: couldn't find cards or fromStack or toStack");
      }
    }
  }),
  undoThunk: thunk((actions, _, helpers) => {
    let state = helpers.getState();

    if (state.animating) {
      return;
    }

    const lastMove = state.history[state.history.length - 1];

    if (lastMove) {
      actions.undo();
      state = helpers.getState();
      state.onUndo?.(state.cardStacks, state.history, actions.undoThunk);
    }
  }),
  clickMove: thunk((actions, card, helpers) => {
    const state = helpers.getState();
    const [currentStack, cardIndex] = findStack(state.cardStacks, card);

    if (!currentStack || cardIndex === undefined) {
      throw Error(`Couldn't find card ${card} in any stack.`);
    }

    const availableStacks = Object.values(state.cardStacks).filter((stack) => {
      return (
        stack.name !== currentStack.name &&
        (stack.canDrop ? stack.canDrop(state.cards, state.cardStacks, stack.name, state.cards[card]) : true)
      );
    });

    if (!availableStacks.length) {
      // No stacks we can move to, so stop.
      return;
    }

    availableStacks.sort(state.compareMoveStacks);
    const toStack = availableStacks[0];
    let cards = [card];

    if (cardIndex < currentStack.cards.length - 1) {
      // Moving a stack.
      cards = currentStack.cards.slice(cardIndex);
    }

    // Animate the move.
    actions.setSlide({
      animating: true,
      slidingCards: cards,
      slidingToStack: toStack,
      slideType: "slow",
      onSlideStart: () => actions.moveCardThunk({ cards, toStack: toStack.name })
    });
  }),
  setCompareMoveStacks: action((state, compareMoveStacks) => {
    state.compareMoveStacks = compareMoveStacks;
  }),
  setOnMove: action((state, onMove) => {
    state.onMove = onMove;
  }),
  setOnUndo: action((state, onUndo) => {
    state.onUndo = onUndo;
  }),
  setDragging: action((state, { cardId, dragging, stack }) => {
    const card = state.cards[cardId];

    if (!card) {
      throw Error(`Couldn't find card ${cardId}.`);
    }

    card.isDragging = dragging;

    // Set dragging on any cards on top
    if (state.dragMultiple) {
      const cards = state.cardStacks[stack].cards;
      cards
        .map((stackCardId) => state.cards[stackCardId])
        .forEach((stackCard, index) => {
          if (index > cards.indexOf(cardId)) {
            stackCard.isDragging = dragging;
          }
        });
    }
  }),
  setDragMultiple: action((state, dragMultiple) => {
    state.dragMultiple = dragMultiple;
  }),
  recordInitialCardStacks: action((state) => {
    const initialCardStacks: CardStacks = {};

    Object.values(state.cardStacks).forEach((stack) => {
      initialCardStacks[stack.name] = { ...stack, cards: [...stack.cards] };
    });

    state.initialCardStacks = initialCardStacks;
  }),
  resetToInitialState: action((state) => {
    const cardStacks: CardStacks = {};

    Object.values(state.initialCardStacks).forEach((stack) => {
      cardStacks[stack.name] = { ...stack, cards: [...stack.cards] };
    });

    state.cardStacks = cardStacks;
    state.history = [];
    state.setupHasRun = false;
    state.win = false;
  }),
  recordPosition: action((state, payload) => {
    const card = state.cards[payload.id];

    if (!card.position) {
      card.position = payload.position;
    } else {
      card.position.x = payload.position.x;
      card.position.y = payload.position.y;
    }
  }),
  setSlide: action((state, { animating, slidingCards, slidingToStack, slideType, onSlideStart, onSlideEnd }) => {
    state.animating = animating;
    state.slidingCards = slidingCards;
    state.slidingToStack = slidingToStack;
    state.slideType = slideType;
    state.onSlideStart = onSlideStart;
    state.onSlideEnd = onSlideEnd;
  }),
  setOnSlideEnd: action((state, onSlideEnd) => {
    state.onSlideEnd = onSlideEnd;
  }),
  setAnimating: action((state, animating) => {
    state.animating = animating;
  }),
  setWin: action((state, win) => {
    state.win = win;
  })
});

const typedHooks = createTypedHooks<StoreModel>();

export const useStoreActions = typedHooks.useStoreActions;
export const useStoreDispatch = typedHooks.useStoreDispatch;
export const useStoreState = typedHooks.useStoreState;
