
## Leva Examples:


### Dynamically Sync Selected ("Observed") Component State to Leva Controls:

```ts
// useObservableState automatically syncs TestComponent state with Leva, when selected.
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
      }}
    ></div>
  );
};
```

```ts
// LevaProvider shares the globally selected element and Leva context 
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
```

```ts
interface ProviderState {
  selectedElement: HTMLElement | null,
  schema: Schema
}

// The Provider is very simple -- all it does is sync selectedElement's state to Leva panel's control schema
// and keep track of the selectedElement
// the selectedElement.id is kept track of in the control panel itself.
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
```

Most of the work happens in useObservableState. Mainly it is responsible for 3 things:
1. setup an id and an onClick handler so LevaProvider can observe the selectedElement
2. keep track of local component state (this works just like useState)
3. manage 2-way sync from/to the leva panel as long as the component is selected
  a. push local component state to leva when component is selected
  b. only after local state is pushed, continuously pull when the leva controls are updated
  c. if local state ever changes any other way, push again
```ts
function useObservableState<S extends Schema>(initialState: S): UseObservableState<S> {
  const { set, controls, observeNewElement, selectedElement } = React.useContext(LevaContext);
  const [state, setState] = useState<S>(initialState);
  const { current: id } = useRef(v4()) // a permanent id to refer to this element
  const [element, setElement] = useState<HTMLElement | null>(null)
  const ref = (element: HTMLElement | null) => { setElement(element) }

  const pushToLeva = useCallback((state: S) => { set(state) }, [set]);
  /*
    first the selected element changes. 
    then the store gets updated through a push
    then the controls change

    we need to make sure all three things have happened before  pulling
  */
  const safeToPull = useMemo(() => controls.id === id && element === selectedElement, [element, selectedElement, controls.id, id])

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
```


### Dynamic Controls depending on React State using Leva
If you want your Leva controls to re-render when a React state changes
you can pass a dependency array to the useControls hook, just like useEffect.
The Leva controls will re-render anytime the dependency array changes.

```ts
interface ControlState {
  x: number
  y: number
  z?: number // note that z is optional
}

const initialControls = {x: 5, y: 3}
const newControls = {z: 5}

const [controls, setControls] = useState<ControlState>(intialControls)

useEffect(() => {
  // wait 2 seconds, then add the new z controls
  setTimeout(() => setControls(controls => ({ ...controls, ...bunnyDefaults })), 2000)
}, []) 

// 
const { x, y, z } = useControls(controls, [controls]);
```

## Questions:

1. Sometimes my Leva number field becomes a float, and then my scrubber is useless because it only moves tiny decimal places at a time.
  - How do I keep it as an integer, or specify the number of decimal places?
2. when useControls is re-rendered/re-called with a new schema, it does not overwrite values. There is no option for this.
Instead, I have to manually call set(schema) on the next render, so syncing my panel (without changing library code) takes two renders.
  - Is it possible to add an option to overwrite schema values when useControls schema changes, instead of default merge behavior?