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

export interface UseObservableState<S extends Schema> {
  ref: (element: HTMLElement | null) => void
  state: S;
  setState: (value: S) => void;
}

export function useObservableState<S extends Schema>(initialState: S): UseObservableState<S> {

  const [state, setState] = useState<S>(initialState);
  const { set, controls, observeNewElement, store, selectedElement } = React.useContext(LevaContext);
  const { current: id } = useRef(v4())
  const [element, setElement] = useState<HTMLElement | null>(null)
  const ref = (element: HTMLElement | null) => {
    setElement(element)
  }

  const storeId = store ? store?.get('id') : null
  console.log(storeId)

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



  useEffect(() => {
    const clickHandler = () => element ? observeNewElement({ id, ...state }, element) : undefined
    if (element) {
      element.addEventListener('click', clickHandler);
    }
    return () => {
      if (element && clickHandler) {
        element.removeEventListener('click', clickHandler);
      }
    };
  }, [state, element, id, observeNewElement])


  return {
    ref,
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