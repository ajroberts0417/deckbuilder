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


interface LevaContextValue {
  controls: Schema;
  set: (value: Schema) => void;
  selectedElement: HTMLElement | null;
  setSelectedElement: (element: HTMLElement) => void;
  addControls: (newControls: Schema) => void;
  overwriteControls: (newControls: Schema) => void;
  observeNewElement: (newControls: Schema, newElement: HTMLElement) => void;
}

const LevaContext = React.createContext<LevaContextValue>({
  set: () => undefined,
  controls: {},
  setSelectedElement: () => undefined,
  selectedElement: null,
  addControls: () => undefined,
  overwriteControls: () => undefined,
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

function useConnectionToLeva<S extends Schema>({ state }) {

  // we use a ref because we just need a simple flag that works imperatively
  // we don't need anything to react to this flag.
  const safeToPull = useRef(false)

  const [lastObservedElement, setLastObservedElement] = useState<HTMLElement | null>(null);

  const {
    selectedElement,
    observeNewElement,
  } = React.useContext(LevaContext);

  const observing = useMemo(
    () =>
      lastObservedElement &&
      selectedElement &&
      lastObservedElement === selectedElement,
    [lastObservedElement, selectedElement]
  );

  const observeThis = useCallback<ObserveThisFn>(
    (e) => {
      console.log("observe new element");
      safeToPull.current = false;
      // overwriteControls({ ...state });
      observeNewElement(state, e.currentTarget);
      // pushToLeva(state);
      console.log("set last observed element")
      setLastObservedElement(e.currentTarget);
    },
    [state, observeNewElement, pushToLeva]
  );

  return {
    connected,

  }

  /*
  steps:
  onObserveThis:
  0. setSafeToPull(false)
  1. push my local state to the leva state
  2. setObserving(true)
  if(observing)
    2. check whether local state matches leva state
    3. after local state === leva state *once*, setSafeToPull(true)
  if(observing && safeToPull) pullFromLeva()
  */
}

function useObservableState<S extends Schema>({
  initialState,
}: UseObservableStateInputs<S>): UseObservableState<S> {
  const {
    set,
    controls,
    selectedElement,
    observeNewElement,
  } = React.useContext(LevaContext);

  const [state, setState] = useState(initialState);
  const [safeToPull, setSafeToPull] = useState(false)


  // useSyncWithLeva(state)

  // we can't pull before we force push this component's state to leva
  // so we use this flag to track when it's safe to pull (e.g. leva is up to date)

  const pullFromLeva = useCallback(
    // this type error actually represents the problem
    // i should only pull from Leva if I know controls is the same Schema as state
    () => setState(controls),
    [controls, setState]
  );

  const pushToLeva = useCallback((state: S) => { set(state) }, [set]);

  // const pushToLeva = useCallback(() => set(state), [set, state]);

  const [lastObservedElement, setLastObservedElement] = useState<HTMLElement | null>(null);

  const observing = useMemo(
    () =>
      lastObservedElement &&
      selectedElement &&
      lastObservedElement === selectedElement,
    [lastObservedElement, selectedElement]
  );

  useEffect(() => {
    if (observing && !safeToPull) {
      setSafeToPull(controls === state)
    }
  }, [observing, state, controls, safeToPull])

  // pull from leva everytime the leva controls change
  useEffect(() => {
    if (observing && safeToPull) {
      console.log("pulling from leva");
      // console.log(controls, state, selectedElement, setSelectedElement);
      pullFromLeva();
    }
  }, [observing, pullFromLeva, controls, safeToPull]);

  const observeThis = useCallback<ObserveThisFn>(
    (e) => {
      setSafeToPull(false);
      console.log("observe new element");
      // overwriteControls({ ...state });
      observeNewElement(state, e.currentTarget);
      console.log("set last observed element")
      setLastObservedElement(e.currentTarget);
    },
    [state, observeNewElement, pushToLeva]
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

const LevaProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
    null
  );
  const store = useCreateStore();
  const [schema, setSchema] = useState<Schema>({});
  const [controls, set] = useControls(() => (schema), [schema]);

  const addControls = (newControls: Schema) => {
    const [data, mappedPaths] = store.getDataFromSchema(newControls);
    store.addData(data, false);
    store.set(newControls, false);
  };

  const overwriteControls = (newControls: Schema) => {
    console.log(controls);
    const [data, mappedPaths] = store.getDataFromSchema(newControls);
    store.addData(data, true);
    store.set(newControls, false)
  };

  const observeNewElement = (newControls: Schema, newElement: HTMLElement) => {
    console.log("BEGIN NEW ELEMENT\nnew controls:", newControls);
    console.log("old controls", controls);
    console.log("store:", store.getData())
    setSchema(newControls);
    // const [data, mappedPaths] = store.getDataFromSchema(newControls);
    // store.addData(data, true);
    // set(newControls);
    setSelectedElement(newElement);
    console.log("END NEW ELEMENT\nnew controls:", newControls);
    console.log("old controls", controls);
    console.log("store:", store.getData());
  }

  return (
    <LevaContext.Provider
      value={{
        controls,
        set,
        setSelectedElement,
        selectedElement,
        addControls,
        overwriteControls,
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
