import { gameState, setGameState } from "./data/state";
import { _handIsFull, _shuffle, _randomCard } from "./utils";

// Actions:
// recycle
// draw | drawX
// discard
// discardRandom | discardRandomX

// recycle (verb) = shuffling the discard into the deck
export function recycle() {
  const { deck, discard } = gameState;
  setGameState({
    ...gameState,
    deck: _shuffle([...deck, ...discard]),
    discard: [],
  });
}

// draw 1 card from the deck into the hand
// if there are not enough cards in the deck, shuffle the discard into the deck
// then draw the remaining cards from the deck
// maximum hand size is 10
// if the hand is full, discard the drawn cards
export function draw() {
  const { deck, hand, discard } = gameState;
  // if the deck is empty, shuffle the discard into the deck
  // if they're both empty, do nothing.
  if (deck.length === 0 && discard.length === 0) return;
  if (deck.length === 0) {
    recycle();
    return draw();
  }

  const topCard = deck[0];
  // if the hand is full, discard the drawn card before it reaches the hand
  const nextHand = _handIsFull() ? hand : [...hand, topCard];
  const nextDiscard = _handIsFull() ? [...discard, topCard] : discard;

  setGameState({
    ...gameState,
    deck: deck.slice(1),
    hand: nextHand,
    discard: nextDiscard,
  });
}

// draw function, which calls draw x times
export function drawX(x) {
  for (let i = 0; i < x; i++) {
    draw();
  }
}

// // discard a card of id <id> from the hand
// export function discard(index) {
//   const { hand, discard } = gameState;
//   const nextHand = hand.filter((card) => card !== id);
//   const nextDiscard = [...discard, id];
//   setGameState({
//     ...gameState,
//     hand: nextHand,
//     discard: nextDiscard,
//   });
// }

// discard a random card from the hand
export function discardRandom() {
  const { hand, discard } = gameState;
  if (hand.length === 0) return; // do nothing if the hand is empty
  const randomCard = _randomCard(hand);
  const nextHand = hand.filter((card) => card !== randomCard);
  const nextDiscard = [...discard, randomCard];
  setGameState({
    ...gameState,
    hand: nextHand,
    discard: nextDiscard,
  });
}

export function discardRandomX(x) {
  for (let i = 0; i < x; i++) {
    discardRandom();
  }
}

export function endTurn() {
  const { turn, hand, discard } = gameState;
  // discard the hand
  const nextDiscard = [...discard, ...hand];
  // draw 5 cards
  const nextHand = [];
  drawX(5);
  // increment the turn
  const nextTurn = {
    ...turn,
    turnCount: turn.turnCount + 1,
  }
  setGameState({
    ...gameState,
    turn: nextTurn,
    hand: nextHand,
    discard: nextDiscard,
  });
}

// you can use this to see which actions are available for your phase.
const actions = {
  'start': {},
  'draw': {},
  'play': {
    'draw': draw,
    'discard': discardRandom,
    'endTurn': endTurn,
  },
  'end': {},
}