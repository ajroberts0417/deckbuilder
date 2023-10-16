import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useControls, LevaPanel } from "leva";
import { Schema } from "leva/dist/declarations/src/types";
import FocusIndicator from "./FocusIndicator";
import { v4 } from "uuid";


interface LevaContextValue {
  controls: Schema;
  set: (value: Schema) => void;
  selectedElement: HTMLElement | null;
  observeNewElement: (newControls: Schema, newElement: HTMLElement) => void;
}

const LevaContext = React.createContext<LevaContextValue>({
  set: () => undefined,
  controls: {},
  selectedElement: null,
  observeNewElement: () => undefined,
});

interface UseObservableState<S extends Schema> {
  ref: (element: HTMLElement | null) => void
  state: S;
  setState: (value: S) => void;
}

function useObservableState<S extends Schema>(initialState: S): UseObservableState<S> {
  const { set, controls, observeNewElement, selectedElement } = React.useContext(LevaContext);
  const [state, setState] = useState<S>(initialState);
  const { current: id } = useRef(v4()) // a permanent id to refer to this element
  const [element, setElement] = useState<HTMLElement | null>(null)
  const ref = (element: HTMLElement | null) => { setElement(element) }

  const pushToLeva = useCallback((state: S) => { set(state) }, [set]);
  /*
    1. first the selected element changes. 
    2. then the controls change
    we need to make sure both have happened before pulling
  */
  const safeToPull = useMemo(() => element === selectedElement && controls.id === id, [element, selectedElement, controls.id, id])

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
  }, [state, element, id])


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

// controls.selectedElementId === myId ? controls : state

interface ProviderState {
  selectedElement: HTMLElement | null,
  schema: Schema
}

const LevaProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [{ schema, selectedElement }, setProviderState] = useState<ProviderState>({
    selectedElement: null,
    schema: {}
  })
  const [controls, set] = useControls(() => (schema), [schema]);

  // this feels like a hack, however:
  // when schema changes, and useControls is re-rendered, it does not overwrite values
  // since we want to overwrite values, we manually call set(schema) on the next render
  // ideally, there would be an easy way to do this provided by Leva that doesn't take 2 renders.
  useEffect(() => {
    set(schema)
  }, [schema, set])

  // we call this automatically on your ref when it is clicked.
  const observeNewElement = (newControls: Schema, newElement: HTMLElement) => {
    setProviderState({
      schema: newControls,
      selectedElement: newElement
    });
  }

  return (
    <LevaContext.Provider
      value={{
        controls,
        set,
        observeNewElement,
        selectedElement
      }}
    >
      <LevaPanel />
      <FocusIndicator selectedElement={selectedElement} />
      {children}
    </LevaContext.Provider>
  );
};

const TestComponent = () => {
  const { state, ref, setState } = useObservableState({
    height: "100px",
    color: "white",
    width: "100px",
    borderWidth: "2px",
    borderColor: "black",
  });


  return (
    // <observable.div/>
    <div
      ref={ref}
      style={{
        height: state.height,
        width: state.width,
        backgroundColor: state.color,
        borderWidth: state.borderWidth,
        borderColor: state.borderColor,
        borderStyle: 'solid',
      }}
    ></div>
  );
};

const TestComponent2 = () => {
  const { state, ref, setState } = useObservableState({
    height: "100px",
    color: "white",
    width: "100px",
    // position: { options: ["absolute", "relative", "fixed"] },
    borderRadius: "10px",
  });

  return (
    <div
      ref={ref}
      style={{
        height: state.height,
        width: state.width,
        backgroundColor: state.color,
        // position: state.position,
        borderRadius: state.borderRadius,
      }}
    ></div>
  );
};

const AppV3 = () => {
  return (
    <LevaProvider>
      <TestComponent />
      <TestComponent />
      <TestComponent2 />
    </LevaProvider>
  );
};

export default AppV3;