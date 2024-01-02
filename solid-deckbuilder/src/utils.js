import { gameState } from './data/state';
import { createSignal } from "solid-js";

export function _handIsFull() {
  // maximum hand size is 10
  return gameState.hand.length >= 10;
}

export function _shuffle(array) {
  /* Randomize array in-place using Durstenfeld shuffle algorithm */
  // https://stackoverflow.com/a/2450976
  for (let x = array.length - 1; x > 0; x--) {
    const y = Math.floor(Math.random() * (x + 1));
    // swap x and y
    [array[x], array[y]] = [array[y], array[x]];
  }
  return array;
}

export function _randomCard(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// helper function to create a signal that cycles through an array
export const createCycle = (array) => {
  const [current, setCurrent] = createSignal(0);
  const increment = () => {
    setCurrent((current + 1) % array.length);
    return array[current];
  }
  return [current, increment];
}