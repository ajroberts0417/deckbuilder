import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import cardDatabase, { Cards } from "./cards";
import { _shuffle, _randomCard, createCycle } from "../utils";

// card database = all the unique cards that exist in the game
// card collection = one player's collection of cards
// the card collection is a subset of the card database, but can have multiple copies of the same card
const cardCollection = {
  [Cards.ATTACK]: 3,
  [Cards.DEFEND]: 3,
  [Cards.HEAL]: 3,
  [Cards.BARRICADE]: 3,
  [Cards.INVEST]: 3,
  [Cards.SORCERY]: 3,
}

// an ordered list of card ids
// a deckList is an abstraction of a deck in the collection
const deckList = {
  [Cards.ATTACK]: 3,
  [Cards.DEFEND]: 1,
  [Cards.HEAL]: 1,
  [Cards.SORCERY]: 1,
}

// the gameIndex is a map from id -> signal reference for all game signals for a single game.
// current just used for tracking cardInstances
// usage: `[cardInstance, setCardInstance] = gameIndex[cardInstanceId]`
const gameIndex = {}

// create a card instance from a card in the cardDatabase
// add the card instance to the gameIndex and make it stateful
// then return the ids of the cards added as an array
function addCardsToGame(CardId, numCopies) {
  const cardsAdded = []
  for (let i = 0; i < numCopies; i++) {
    const id = `${CardId}-${i + 1}`;
    const [card, setCard] = createSignal({
      ...cardDatabase[CardId],
      id: id,
    });
    gameIndex[id] = [card, setCard];
    cardsAdded.push(id);
  }
  return cardsAdded;
}

// 1. for each card in the deckList
//  a. create a unique id + signal for the card's state
//  b. add that signal to the gameIndex
//  c. add the id to the deck
// 2. shuffle the deck
// 3. return the deck
function initializeDeck(deckList) {
  const deck = [];
  // initialize deck
  for (const [cardId, numCopies] of Object.entries(deckList)) {
    const cardsAdded = addCardsToGame(cardId, numCopies);
    deck.push(...cardsAdded);
  }
  return _shuffle(deck) // in-place modification
}

// TODO: i can just simplify it this way if it would save memory
// ['player 1', 'start']
//given this player and phase, what is the next player and phase?
const players = ['player1', 'player2'];
const [currentPlayer, incrementPlayer] = createCycle(players);

const phases = ['start', 'draw', 'play', 'end'];
const [currentPhase, incrementPhase] = createCycle(phases);

const [turnCount, setTurn] = createSignal(0);

const initialTurnState = {
  turnCount,
  currentPlayer,
  currentPhase,
}
// const [currentPhase, setCurrentPhase] = createSignal(0);

const initialGameState = {
  turn: initialTurnState,
  deck: initializeDeck(deckList),
  hand: [],
  discard: [],
  exile: [],
  selected: [],
  gameIndex: gameIndex,
}

// const endTurn =

// usage:
// import { gameState, setGameState } from "./state";
const [gameState, setGameState] = createStore(initialGameState);
export { gameState, setGameState };
