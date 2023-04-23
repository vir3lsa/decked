import { action, Action, createStore, createTypedHooks, thunk, Thunk } from "easy-peasy";

export interface StoreModel {
  cardStacks: CardStacks;
  setupHasRun: boolean;
  isWin?: IsWin;
  win: boolean;
  history: Move[];
  preferredMoveStacks: string[];
  addStack: Action<StoreModel, IStack>;
  moveCard: Action<StoreModel, MoveCardPayload>;
  setSetupHasRun: Action<StoreModel, boolean>;
  setIsWin: Action<StoreModel, IsWin>;
  undo: Action<StoreModel>;
  clickMove: Thunk<StoreModel, ICard>;
  setPreferredMoveStacks: Action<StoreModel, string[]>;
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

const findStack = (cardStacks: CardStacks, cardId: string): [IStack | undefined, number | undefined] => {
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

  return [fromStack, fromIndex];
};

export const store = createStore<StoreModel>({
  cardStacks: {},
  setupHasRun: false,
  win: false,
  history: [],
  preferredMoveStacks: [],
  addStack: action((state, stack) => {
    state.cardStacks[stack.name] = stack;
  }),
  moveCard: action((state, payload) => {
    // Find the card in the old stack
    let [fromStack, fromIndex] = findStack(state.cardStacks, payload.card.id);

    // Remove the card from the old stack
    if (fromStack && fromIndex !== undefined) {
      fromStack.cards.splice(fromIndex, 1);
    } else {
      throw Error(
        `Couldn't find card: { id: ${payload.card.id}, suit: ${payload.card.suit}, rank: ${payload.card.rank} }`
      );
    }

    // Add the card to the new stack
    state.cardStacks[payload.toStack].cards.push(payload.card);

    // Check the win condition
    if (state.isWin && state.isWin(state.cardStacks)) {
      state.win = true;
    }

    if (state.setupHasRun) {
      // Record the move
      state.history.push({
        cards: [payload.card.id],
        fromStack: fromStack.name,
        toStack: payload.toStack,
        fromIndex,
        toIndex: state.cardStacks[payload.toStack].cards.length - 1
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
      const cards = lastMove.cards.map((id) => findCard(id, state.cardStacks));
      const fromStack = Object.values(state.cardStacks).find((stack) => stack.name === lastMove.fromStack);
      const toStack = Object.values(state.cardStacks).find((stack) => stack.name === lastMove.toStack);

      if (cards && fromStack && toStack) {
        cards.forEach((card) => {
          toStack.cards.splice(lastMove.toIndex, 1);
          fromStack.cards.push(card);
        });
      } else {
        throw Error("Couldn't undo: couldn't find cards or fromStack or toStack");
      }
    }
  }),
  clickMove: thunk((actions, card, helpers) => {
    const state = helpers.getState();
    const [currentStack] = findStack(state.cardStacks, card.id);
    const availableStacks = Object.values(state.cardStacks).filter((stack) => {
      return (
        stack.name !== currentStack?.name && (stack.canDrop ? stack.canDrop(state.cardStacks, stack.name, card) : true)
      );
    });

    if (!availableStacks.length) {
      // No stacks we can move to, so stop.
      return;
    }

    const chosenStack =
      availableStacks.find(
        (stack) =>
          !state.preferredMoveStacks.length ||
          state.preferredMoveStacks.find((preferredStack) => preferredStack === stack.name)
      ) || availableStacks[0];

    actions.moveCard({
      card,
      toStack: chosenStack.name
    });
  }),
  setPreferredMoveStacks: action((state, stacks) => {
    state.preferredMoveStacks = stacks;
  })
});

const typedHooks = createTypedHooks<StoreModel>();

export const useStoreActions = typedHooks.useStoreActions;
export const useStoreDispatch = typedHooks.useStoreDispatch;
export const useStoreState = typedHooks.useStoreState;
