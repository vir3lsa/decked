import { action, Action, createStore, createTypedHooks, thunk, Thunk, ThunkCreator } from "easy-peasy";

export type MoveCardThunk = ThunkCreator<MoveCardThunkPayload>;
export type UndoThunk = ThunkCreator;
export type OnMove = (cardStacks: CardStacks, move: Move, moveCardThunk: MoveCardThunk) => void;
export type OnUndo = (cardStacks: CardStacks, history: Move[], undoThunk: UndoThunk) => void;

export interface StoreModel {
  cardStacks: CardStacks;
  initialCardStacks: CardStacks;
  setupHasRun: boolean;
  isWin?: IsWin;
  win: boolean;
  history: Move[];
  preferredMoveStacks: string[];
  onMove?: OnMove;
  onUndo?: OnUndo;
  dragMultiple?: boolean;
  addStack: Action<StoreModel, IStack>;
  moveCard: Action<StoreModel, MoveCardPayload>;
  moveCardThunk: Thunk<StoreModel, MoveCardThunkPayload>;
  setSetupHasRun: Action<StoreModel, boolean>;
  setIsWin: Action<StoreModel, IsWin>;
  undo: Action<StoreModel>;
  undoThunk: Thunk<StoreModel>;
  clickMove: Thunk<StoreModel, ICard>;
  setPreferredMoveStacks: Action<StoreModel, string[]>;
  setOnMove: Action<StoreModel, OnMove>;
  setOnUndo: Action<StoreModel, OnUndo>;
  setDragging: Action<StoreModel, SetDraggingPayload>;
  setDragMultiple: Action<StoreModel, boolean>;
  recordInitialCardStacks: Action<StoreModel>;
  resetToInitialState: Action<StoreModel>;
}

const findCard = (cardId: string, cardStacks: CardStacks): ICard => {
  for (const stack of Object.values(cardStacks)) {
    const card = stack.cards.find((card) => card.id === cardId);

    if (card) {
      return card;
    }
  }

  throw Error(`Couldn't find card with ID: ${cardId}`);
};

export const findStack = (cardStacks: CardStacks, cardId: string): [IStack, number] => {
  let fromStack: IStack | undefined, fromIndex: number | undefined;
  Object.values(cardStacks).forEach((stack) => {
    if (fromStack) {
      // Short-circuit if we've already found the stack.
      return;
    }

    const indexOfCard = stack.cards.findIndex((card) => card.id === cardId);

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
  cardStacks: {},
  initialCardStacks: {},
  setupHasRun: false,
  win: false,
  history: [],
  preferredMoveStacks: [],
  addStack: action((state, stack) => {
    state.cardStacks[stack.name] = stack;
  }),
  moveCard: action((state, { card, move }) => {
    // Add the card to the new stack
    state.cardStacks[move.toStack].cards.push(card);

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
    let [fromStack, fromIndex] = findStack(state.cardStacks, payload.card.id);

    if (!fromStack || fromIndex === undefined) {
      throw Error(
        `Couldn't find card: { id: ${payload.card.id}, suit: ${payload.card.suit}, rank: ${payload.card.rank} }`
      );
    }

    const move = {
      cards: [payload.card.id],
      fromStack: fromStack.name,
      toStack: payload.toStack,
      fromIndex,
      toIndex: state.cardStacks[payload.toStack].cards.length,
      fromTop: fromIndex === fromStack.cards.length - 1
    };

    // Update the state.
    actions.moveCard({ card: payload.card, move });

    if (state.setupHasRun) {
      // Trigger onMove callback.
      state.onMove?.(helpers.getState().cardStacks, move, actions.moveCardThunk);
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
      const cards = lastMove.cards.map((id) => findCard(id, state.cardStacks));
      const fromStack = state.cardStacks[lastMove.fromStack];
      const toStack = state.cardStacks[lastMove.toStack];

      if (cards && fromStack && toStack) {
        cards.forEach((card) => {
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
    const [currentStack, cardIndex] = findStack(state.cardStacks, card.id);

    if (!currentStack || cardIndex === undefined) {
      throw Error(`Couldn't find card ${card.id} in any stack.`);
    }

    const availableStacks = Object.values(state.cardStacks).filter((stack) => {
      return (
        stack.name !== currentStack.name && (stack.canDrop ? stack.canDrop(state.cardStacks, stack.name, card) : true)
      );
    });

    if (!availableStacks.length) {
      // No stacks we can move to, so stop.
      return;
    }

    let bestStack, bestStackIndex: number;

    // Find the best available stack, according to preference.
    if (state.preferredMoveStacks.length) {
      availableStacks.forEach((stack) => {
        const orderOfPreference = state.preferredMoveStacks.indexOf(stack.name) + 1;
        if (orderOfPreference && (!bestStackIndex || orderOfPreference < bestStackIndex)) {
          bestStack = stack;
          bestStackIndex = orderOfPreference;
        }
      });
    }

    if (!bestStack) {
      bestStack = availableStacks[0];
    }

    actions.moveCardThunk({
      card,
      toStack: bestStack.name
    });
  }),
  setPreferredMoveStacks: action((state, stacks) => {
    state.preferredMoveStacks = stacks;
  }),
  setOnMove: action((state, onMove) => {
    state.onMove = onMove;
  }),
  setOnUndo: action((state, onUndo) => {
    state.onUndo = onUndo;
  }),
  setDragging: action((state, { cardId, stack, dragging }) => {
    const card = state.cardStacks[stack].cards.find((card) => card.id === cardId);

    if (!card) {
      throw Error(`Couldn't find card ${cardId} in stack ${stack}.`);
    }

    card.isDragging = dragging;
  }),
  setDragMultiple: action((state, dragMultiple) => {
    state.dragMultiple = dragMultiple;
  }),
  recordInitialCardStacks: action((state) => {
    const initialCardStacks: CardStacks = {};

    Object.values(state.cardStacks).forEach((stack) => {
      initialCardStacks[stack.name] = { ...stack, cards: stack.cards.map((card) => ({ ...card })) };
    });

    state.initialCardStacks = initialCardStacks;
  }),
  resetToInitialState: action((state) => {
    const cardStacks: CardStacks = {};

    Object.values(state.initialCardStacks).forEach((stack) => {
      cardStacks[stack.name] = { ...stack, cards: stack.cards.map((card) => ({ ...card })) };
    });

    state.cardStacks = cardStacks;
    state.history = [];
  })
});

const typedHooks = createTypedHooks<StoreModel>();

export const useStoreActions = typedHooks.useStoreActions;
export const useStoreDispatch = typedHooks.useStoreDispatch;
export const useStoreState = typedHooks.useStoreState;
