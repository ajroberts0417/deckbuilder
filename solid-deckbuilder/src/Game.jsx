import logo from './logo.svg';
import styles from './App.module.css';
import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";

const [count, setCount] = createSignal(0);
setInterval(() => setCount(count() + 1), 1000);

const cardDatabase = {
  attack: {
    id: "attack",
    name: 'Card 1',
    description: 'This is card 1',
    type: 'action',
    cost: 1,
    effect: () => { },
  },
  defend: {
    id: "defend",
    name: 'Card 2',
    description: 'This is card 2',
    type: 'action',
    cost: 2,
    effect: () => { },
  },
  heal: {
    id: "heal",
    name: 'Card 3',
    description: 'This is card 3',
    type: 'action',
    cost: 3,
    effect: () => { },
  },
  barricade: {
    id: "barricade",
    name: 'Card 4',
    description: 'This is card 4',
    type: 'action',
    cost: 4,
    effect: () => { },
  },
  invest: {
    id: "invest",
    name: 'Card 5',
    description: 'This is card 5',
    type: 'action',
    cost: 5,
    effect: () => { },
  },
  sorcery: {
    id: "sorcery",
    name: 'Card 6',
    description: 'This is card 6',
    type: 'action',
    cost: 6,
    effect: () => { },
  }
}
const cardIds = Object.keys(cardDatabase);

// the card database represents all the unique cards that exist in the game
// the card collection represents one players collection of cards
// the card collection is a subset of the card database, but can have multiple copies of the same card
// it's just a simple dictionary of card id to number of copies
const cardCollection = {
  attack: 3,
  defend: 3,
  heal: 3,
  barricade: 3,
  invest: 3,
  sorcery: 3,
}

// an ordered list of card ids
// a deckList is an abstraction of a deck in the collection
const deckList = {
  attack: 3,
  defend: 1,
  heal: 1,
  sorcery: 1,
}

// the gameIndex is a map from id -> signal reference for all game signals for a single game.
// usage: `[cardInstance, setCardInstance] = gameIndex[cardId]`
// game index should rarely be written, but it'll often be used to look up a card.
// it's kind of like the database for stateful data, so it gets written to when a new card is created.
// it's not an RDBMS or anything, though maybe it should be.
// For now, it's just a simple dictionary of id -> signal reference for any identifiable state.
const gameIndex = {}

// create a card instance from a card in the cardDatabase
// add the card instance to the gameIndex and make it stateful
// then return the ids of the cards added as an array
function addCardsToGame(cardId, numCopies) {
  const cardsAdded = []
  const card = cardDatabase[cardId];
  for (let i = 0; i < numCopies; i++) {
    const id = `${cardId}-${i + 1}`;
    const [cardInstance, setCardInstance] = createSignal({
      ...card,
      id: id,
    });
    console.log(cardInstance, setCardInstance)
    gameIndex[id] = [cardInstance, setCardInstance];
    console.log(gameIndex[id])
    cardsAdded.push(id);
  }
  return cardsAdded;
}

// for each card in the deckList
// 1. create a unique id + signal for the card's state
// 2. add that signal to the gameIndex
// 3. add the id to the deck
// 4. shuffle the deck
// 5. return the deck
function initializeDeck(deckList) {
  const deck = [];

  // initialize deck
  for (const [cardId, numCopies] of Object.entries(deckList)) {
    const cardsAdded = addCardsToGame(cardId, numCopies);
    deck.push(...cardsAdded);
  }

  return _shuffle(deck) // in-place modification
}

const initialGameState = {
  deck: initializeDeck(deckList),
  hand: [],
  discard: [],
  exile: [],
  selected: [],
  gameIndex: gameIndex,
}

console.log(gameIndex)

const [gameState, setGameState] = createSignal(initialGameState);

console.log(gameState)

// console.log(gameState());


// what is a turn cycle?
// composed of phases
// 1. start of turn
// - effects that trigger at the start of the turn trigger
// 2. draw
// - current player draws 3 cards
// 
// 3. main phase (play phase)
// - current player can play cards from their hand
// (optional) action phase for instance, combat in mtg "resolution phase"
// (optional) second main phase
// 4. resource phase (collect resources from sources)
// 5. end of turn
// - 
// 6. play control passes to next player


function _handIsFull() {
  // maximum hand size is 10
  return gameState().hand.length >= 10;
}

function _shuffle(array) {
  /* Randomize array in-place using Durstenfeld shuffle algorithm */
  // https://stackoverflow.com/a/2450976
  for (let x = array.length - 1; x > 0; x--) {
    const y = Math.floor(Math.random() * (x + 1));
    // swap x and y
    [array[x], array[y]] = [array[y], array[x]];
  }
  return array;
}

function _randomCard(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// recycle (verb) = shuffling the discard into the deck
function recycle() {
  const { deck, discard } = gameState();
  setGameState({
    ...gameState(),
    deck: _shuffle([...deck, ...discard]),
    discard: [],
  });
}

// card Ponder -- recycle the deck, 


// draw function which draws just 1 card from the deck into the hand
// if there are not enough cards in the deck, shuffle the discard into the deck
// then draw the remaining cards from the deck
// if there are still not enough cards, draw as many as possible
// maximum hand size is 10
// if the hand is full, discard the drawn cards
function draw() {
  const { deck, hand, discard } = gameState();

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
    ...gameState(),
    deck: deck.slice(1),
    hand: nextHand,
    discard: nextDiscard,
  });
}

// draw function, which calls draw x times
function drawX(x) {
  for (let i = 0; i < x; i++) {
    draw();
  }
}

// discard a card of id <id> from the hand
function discard(index) {
  const { hand, discard } = gameState();
  const nextHand = hand.filter((card) => card !== id);
  const nextDiscard = [...discard, id];
  setGameState({
    ...gameState(),
    hand: nextHand,
    discard: nextDiscard,
  });
}

// discard a random card from the hand
function discardRandom() {
  const { hand, discard } = gameState();
  if (hand.length === 0) return; // do nothing if the hand is empty
  const randomCard = _randomCard(hand);
  const nextHand = hand.filter((card) => card !== randomCard);
  const nextDiscard = [...discard, randomCard];
  setGameState({
    ...gameState(),
    hand: nextHand,
    discard: nextDiscard,
  });
}

function discardRandomX(x) {
  for (let i = 0; i < x; i++) {
    discardRandom();
  }
}

function App() {
  return (
    <div class={styles.App}>
      <code>
        {JSON.stringify(gameState())}
      </code>
      <button onClick={() => draw()}>Draw</button>
      <button onClick={() => drawX(3)}>Draw 3</button>
      <button onClick={() => discardRandom()}>Discard Random</button>
    </div>
  );
}

export default App;
