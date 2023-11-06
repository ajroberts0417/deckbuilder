import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Schema } from "leva/dist/declarations/src/types";
import { v4 } from "uuid";
import { LevaContext } from "./LevaProvider";
import { DisplayObject } from "pixi.js";

export interface UseObservableState<S extends Schema> {
  setRef: (element: DisplayObject | null) => void
  state: S;
  setState: (value: S) => void;
}

export function useObservableState<S extends Schema>(initialState: S): UseObservableState<S> {

  const [state, setState] = useState<S>(initialState);
  const { set, controls, observeNewElement, selectedElement } = React.useContext(LevaContext);
  const { current: id } = useRef(v4())
  const [element, setElement] = useState<DisplayObject | null>(null)
  const setRef = (element: DisplayObject | null) => {
    setElement(element)
  }

  console.log("debug observeNewElement in useObservableState", observeNewElement);

  const pushToLeva = useCallback((state: S) => { set(state) }, [set]);
  /*
    first the selected element changes. 
    then the store gets updated through a push
    then the controls change

    we need to make sure all three things have happened before  pulling
  */
  const safeToPull = useMemo(() => id && controls.id === id && element === selectedElement, [element, selectedElement, controls.id, id])

  // pull whenever controls change
  useEffect(() => {
    if (safeToPull) {
      setState(controls as S)
    }
  }, [controls, safeToPull]);

  console.log("observeNewElement in LevaProvider PIXI", observeNewElement);

  // redesign this for a pixi DisplayObject
  useEffect(() => {
    const clickHandler = () => {
      if (element) {
        console.log('observe new element:', element);
        observeNewElement({ id, ...state }, element);
      }
    };
    if (element) {
      console.log(element)
      element.on('click', clickHandler);
    }
    return () => {
      if (element) {
        element.off('click', clickHandler);
      }
    };
  }, [state, element, id, observeNewElement])


  return {
    setRef,
    state,
    setState: () => {
      setState(state); // this line is suspect
      // if this div is selected, sync updates to leva
      if (safeToPull) {
        pushToLeva(state);
      }
    },
  }
}