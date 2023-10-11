import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useControls, useCreateStore, Leva, LevaPanel } from "leva";
import { Schema } from "leva/dist/declarations/src/types";
import FocusIndicator from "./FocusIndicator";
import { v4 } from "uuid";


interface LevaContextValue {
  controls: Schema;
  set: (value: Schema) => void;
  selectedElement: HTMLElement | null;
  setSelectedElement: (element: HTMLElement) => void;
  observeNewElement: (newControls: Schema, newElement: HTMLElement) => void;
}

const LevaContext = React.createContext<LevaContextValue>({
  set: () => undefined,
  controls: {},
  setSelectedElement: () => undefined,
  selectedElement: null,
  observeNewElement: () => undefined,
});

type ObserveThisFn = (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;

interface UseObservableState<S extends Schema> {
  state: S;
  observeThis: ObserveThisFn;
  setState: (value: S) => void;
}

interface UseObservableStateInputs<S extends Schema> {
  initialState: S;
  options?: {
    highlightStyles: boolean;
  };
}


function useObservableState<S extends Schema>({
  initialState,
}: UseObservableStateInputs<S>): UseObservableState<S> {
  const {
    set,
    controls,
    observeNewElement,
  } = React.useContext(LevaContext);

  const [state, setState] = useState(initialState);
  const [safeToPull, setSafeToPull] = useState(false)

  const pullFromLeva = useCallback(
    // this type error actually represents the problem
    // i should only pull from Leva if I know controls is the same Schema as state
    () => setState(controls),
    [controls, setState]
  );

  const pushToLeva = useCallback((state: S) => { set(state) }, [set]);

  const observing = controls.selectedElementId === myId

  useEffect(() => {
    if (observing && !safeToPull) {
      setSafeToPull(controls === state)
    }
  }, [observing, state, controls, safeToPull])

  // pull from leva everytime the leva controls change
  useEffect(() => {
    console.log(state)
    console.log(controls)
    console.log(safeToPull)
    if (observing && safeToPull) {
      pullFromLeva();
    }
  }, [observing, pullFromLeva, safeToPull]);

  const observeThis = useCallback<ObserveThisFn>(
    (e) => {
      setSafeToPull(false);
      observeNewElement(state, e.currentTarget);
    },
    [state, observeNewElement]
  );

  return {
    state,
    observeThis,
    setState: () => {
      setState(state); // this line is suspect
      // if this div is selected, sync updates to leva
      if (observing) {
        pushToLeva(state);
      }
    },
  };
}

// controls.selectedElementId === myId ? controls : state

const LevaProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [schema, setSchema] = useState<Schema>({});
  const [controls, set] = useControls(() => (schema), [schema]);


  const observeNewElement = (newControls: Schema, newElement: HTMLElement) => {
    setSchema(newControls);
    setSelectedElement(newElement);
  }

  return (
    <LevaContext.Provider
      value={{
        controls,
        set,
        observeNewElement,
      }}
    >
      {/* <LevaPanel store={store} /> */}
      <FocusIndicator selectedElement={selectedElement} />
      {children}
    </LevaContext.Provider>
  );
};

interface TestState {
  height: string;
  color: string;
  width: string;
}

// map of uuid to element pointer
// map of uuid to element state (javascript object updated through Leva)
// currently selected uuid (push + pull to/from the state of this uuid)

const TestComponent = () => {
  const { state, observeThis, setState } = useObservableState({
    initialState: {
      height: "100px",
      color: "white",
      width: "100px",
    },
  });

  return (
    // <observable.div/>
    <div
      onClick={observeThis}
      style={{
        height: state.height,
        width: state.width,
        backgroundColor: state.color,
      }}
    ></div>
  );
};

const TestComponent2 = () => {
  const { state, observeThis, setState } = useObservableState({
    initialState: {
      height: "100px",
      color: "white",
      width: "100px",
      // position: { options: ["absolute", "relative", "fixed"] },
      borderRadius: "10px",
    },
  });

  return (
    <div
      onClick={observeThis}
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
      <TestComponent></TestComponent>
      <TestComponent></TestComponent>
      <TestComponent2 />
    </LevaProvider>
  );
};

const AppV4 = () => {
  const store = useCreateStore();
  const zustandStore = store.useStore();
  const [schema, setSchema] = useState<Schema>({})
  const [controls, set] = useControls(() => (schema), { store }, [schema]);

  useEffect(() => {
    setTimeout(() => {
      const newSchema = { height: "250px", width: "200px", backgroundColor: "white" };
      setSchema(newSchema);
      // store.set(newSchema, false);
      // const [data, mappedPaths] = store.getDataFromSchema(newSchema);
      // // store.setOrderedPaths(["height", "width", "backgroundColor"]);
      // store.addData(data, true);
      // store.set({ height: "250px", width: "200px", backgroundColor: "white" }, false)
      // store.setValueAtPath("backgroundColor", "black", false);
      // store.setValueAtPath("width", "300px", false);
    }, 1000);
  }, [store]);

  console.log(store.getData());
  console.log(zustandStore);
  console.log(controls)


  /* 
  ref solves two needs
    - allows us to programatically add a new data-* attribute to the element on mount 
      - this, in turn, allows us to identify the selected element in controls
    - allows us to position the "selected" indicator 
  */

  return (
    <>
      <div
        style={{
          height: controls?.height || "100px",
          width: controls?.width || "100px",
          backgroundColor: controls?.backgroundColor || "#fff",
        }}
      />
      <LevaPanel store={store} />
    </>
  );
};

export default AppV3;

interface UseObservableElement {
  ref: React.MutableRefObject<HTMLElement | null>;
  state: Schema
}

function useObservableElement(state: Schema) {
  const id = useMemo(() => v4(), []);
  const [element, setElement] = useState<HTMLElement | null>(null)
  const ref = (element: HTMLElement | null) => {
    setElement(element)
  }
  const { } = useObservableState({})

  useEffect(() => {
    element?.onclick = () => {
      element?.onclick()

    }
  }, [element])
  return { ref }
}