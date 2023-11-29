import { createSignal } from "solid-js";
import { createDeck } from './Game.jsx';

test('createDeck function', () => {
  // 1. Create a gameIndex
  const gameIndex = {};

  // 2. Create a basic deckList
  const deckList = ["attack", "defend"];

  // 3. Use that deckList to call createDeck
  const [deckSignal, setDeckSignal] = createDeck(deckList);

  // 4. Get the first card in the deck
  const firstCard = deckSignal()[0];

  // 5. Using the cards id, get it from the cardIndex. Verify that these 2 things are strictly equal (same reference)
  const [cardInstance, setCardInstance] = gameIndex[firstCard().id];
  expect(cardInstance()).toBe(firstCard());

  // 6. Using setCardInstance, modify the card
  setCardInstance({
    ...cardInstance(),
    name: 'Modified Card'
  });

  // 7. Get the same card again using the deck, and then verify that they are strictly equal again.
  const modifiedCard = deckSignal()[0];
  expect(modifiedCard()).toBe(cardInstance());
});