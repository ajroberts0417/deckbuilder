import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useCreateStore, Leva, useControls, LevaPanel } from "leva";
import { Schema, StoreType } from "leva/dist/declarations/src/types";
import FocusIndicator from "./FocusIndicator";
import { v4 } from "uuid";


interface LevaContextValue {
  controls: Schema;
  set: (value: Schema) => void;
  selectedElement: HTMLElement | null;
  setSelectedElement: (element: HTMLElement) => void;
  observeNewElement: (newControls: Schema, newElement: HTMLElement) => void;
  store: StoreType | null;
}

const LevaContext = React.createContext<LevaContextValue>({
  set: () => undefined,
  controls: {},
  setSelectedElement: () => undefined,
  selectedElement: null,
  observeNewElement: () => undefined,
  store: null
});

interface UseObservableState<S extends Schema> {
  ref: (element: HTMLElement | null) => void
  state: S;
  setState: (value: S) => void;
}


function useObservableState<S extends Schema>(initialState: S): UseObservableState<S> {

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
    // console.log(controls)
    if (safeToPull) {
      console.log('d:', { controls, state })
      // console.log(controls)
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

const LevaProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const store = useCreateStore()
  const [{ schema, selectedElement }, setProviderState] = useState<{
    selectedElement: HTMLElement | null,
    schema: Schema
  }>({
    selectedElement: null,
    schema: {}
  })
  const [controls, set] = useControls(() => (schema), { store }, [schema]);


  console.log({ controls })
  console.log(store.getData())
  console.log({ schema })

  useEffect(() => {
    // console.log({ schema })
    set(schema)
  }, [schema, set])

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
        store,
        selectedElement
      }}
    >
      <LevaPanel store={store} />
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
  const { state, ref, setState } = useObservableState({
    height: "100px",
    color: "white",
    width: "100px",
  });


  return (
    // <observable.div/>
    <div
      ref={ref}
      style={{
        height: state.height,
        width: state.width,
        backgroundColor: state.color,
        borderRadius: state.borderRadius ?? ''
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