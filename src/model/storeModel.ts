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
import { ON_MOVE_DELAY_MILLIS, SLIDE_DELAY_MILLIS, SLIDE_MILLIS } from "../common/constants";

export type MoveCardThunk = ThunkCreator<MoveCardThunkPayload>;
export type UndoThunk = ThunkCreator;
export type SetSlideAction = ActionCreator<SlidePayload>;
export type OnMove = (
  cards: CardMap,
  cardStacks: CardStacks,
  move: Move,
  moveCardThunk: MoveCardThunk,
  setSlide: SetSlideAction
) => void;
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
  slidingCard?: string;
  slidingToStack?: IStack;
  animating: boolean;
  onSlideStart?: VoidCallback;
  onSlideEnd?: VoidCallback;
  slidingCardObj: Computed<StoreModel, ICard | undefined>;
  addStack: Action<StoreModel, AddStackPayload>;
  addCardToStack: Action<StoreModel, AddCardToStackPayload>;
  moveCard: Action<StoreModel, MoveCardPayload>;
  moveCardThunk: Thunk<StoreModel, MoveCardThunkPayload>;
  setSetupHasRun: Action<StoreModel, boolean>;
  setIsWin: Action<StoreModel, IsWin>;
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
  slidingCardObj: computed((state) => (state.slidingCard ? state.cards[state.slidingCard] : undefined)),
  addStack: action((state, { stack, cards }) => {
    state.cardStacks[stack.name] = stack;
    // Add the cards to the model.
    cards?.forEach((card) => (state.cards[card.id] = card));
  }),
  addCardToStack: action((state, { card, stackName }) => {
    state.cardStacks[stackName].cards.push(card);
  }),
  moveCard: action((state, { card, move }) => {
    // Add the card to the new stack if we're not in an animation
    if (!state.animating) {
      state.cardStacks[move.toStack].cards.push(card);
    }

    // Remove the card from the old stack
    state.cardStacks[move.fromStack].cards.splice(move.fromIndex, 1);

    // Check the win condition
    if (state.isWin && state.isWin(state.cardStacks)) {
      state.win = true;
    }

    if (state.setupHasRun) {
      // Record the move
      state.history.push(move);
    }
  }),
  moveCardThunk: thunk((actions, payload, helpers) => {
    const state = helpers.getState();

    // Find the card in the old stack
    let [fromStack, fromIndex] = findStack(state.cardStacks, payload.card);

    if (!fromStack || fromIndex === undefined) {
      throw Error(`Couldn't find card ${payload.card}.`);
    }

    const move = {
      cards: [payload.card],
      fromStack: fromStack.name,
      toStack: payload.toStack,
      fromIndex,
      toIndex: state.cardStacks[payload.toStack].cards.length,
      fromTop: fromIndex === fromStack.cards.length - 1
    };

    // Update the state.
    actions.moveCard({ card: payload.card, move });

    if (state.setupHasRun) {
      // Add card to new stack, stop animation and trigger onMove callback.
      actions.setOnSlideEnd(() => {
        actions.addCardToStack({ card: payload.card, stackName: payload.toStack });
        setTimeout(() => {
          actions.setSlide({ animating: false, slidingCard: undefined, slidingToStack: undefined });
        }, SLIDE_DELAY_MILLIS);
        setTimeout(
          () =>
            state.onMove?.(
              helpers.getState().cards,
              helpers.getState().cardStacks,
              move,
              actions.moveCardThunk,
              actions.setSlide
            ),
          ON_MOVE_DELAY_MILLIS
        );
      });
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
        lastMove.cards.forEach((card) => {
          toStack.cards.splice(lastMove.toIndex, 1);
          fromStack.cards.splice(lastMove.fromIndex, 0, card);
        });
      } else {
        throw Error("Couldn't undo: couldn't find cards or fromStack or toStack");
      }
    }
  }),
  undoThunk: thunk((actions, _, helpers) => {
    let state = helpers.getState();
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

    // Animate the move.
    actions.setSlide({
      animating: true,
      slidingCard: card,
      slidingToStack: toStack,
      onSlideStart: () => actions.moveCardThunk({ card, toStack: toStack.name })
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

    // Set dragging on any cards on top TODO is this working?
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
  setSlide: action((state, { animating, slidingCard, slidingToStack, onSlideStart, onSlideEnd }) => {
    state.animating = animating;
    state.slidingCard = slidingCard;
    state.slidingToStack = slidingToStack;
    state.onSlideStart = onSlideStart;
    state.onSlideEnd = onSlideEnd;
  }),
  setOnSlideEnd: action((state, onSlideEnd) => {
    state.onSlideEnd = onSlideEnd;
  })
});

const typedHooks = createTypedHooks<StoreModel>();

export const useStoreActions = typedHooks.useStoreActions;
export const useStoreDispatch = typedHooks.useStoreDispatch;
export const useStoreState = typedHooks.useStoreState;
