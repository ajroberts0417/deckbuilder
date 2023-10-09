import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { Stage, Sprite, withPixiApp } from "@pixi/react";
import * as PIXI from "pixi.js";
import { levaStore, useControls, useCreateStore, Leva, LevaPanel } from "leva";
import { Schema } from "leva/dist/declarations/src/types";
import { v4 } from "uuid";
import SpriteSheet from "./SpriteSheet";

const texture = PIXI.Texture.from("https://pixijs.com/assets/bunny.png");
texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

function useAdminControls<T extends Schema>(initialSchema: T): T {
  if (import.meta.env.VITE_ADMIN_MODE) {
    // @LIAM: what should I do instead here?
    return useControls(initialSchema, []) as unknown as T;
  }
  return initialSchema;
}

interface BunnyProps {
  key: number;
  x: number;
  y: number;
  tint?: string;
  scale: number;
  selected: boolean;
  setSelected: () => void;
}

const Bunny = ({
  x,
  y,
  scale = 3,
  tint,
  key,
  setSelected,
  selected,
}: BunnyProps) => {
  const bunny = useRef<PIXI.Sprite>(null);
  const [position, setPosition] = React.useState({ x, y });

  const onDown = (e: PIXI.FederatedPointerEvent) => {
    bunny.current!.alpha = 0.5;
    // to understand what's going on here:
    // https://pixijs.com/guides/components/interaction
    e.currentTarget.on("globalpointermove", onMove);
    setSelected();
    setLevaControls(bunny.current);
  };

  const onDragEnd = (e: PIXI.FederatedPointerEvent) => {
    e.currentTarget.off("globalpointermove", onMove);
    bunny.current!.alpha = 1;
  };

  const onMove = React.useCallback(
    (e: PIXI.FederatedPointerEvent) => {
      if (bunny.current) {
        setPosition(e.data.getLocalPosition(bunny.current.parent));
      }
    },
    [setPosition]
  );

  const [myTint, setMyTint] = useState(tint);

  useEffect(() => {
    if (selected && myTint !== tint) {
      setMyTint(tint);
    }
  }, [tint, selected, myTint]);

  return (
    <Sprite
      ref={bunny}
      tint={myTint ?? "#fff"}
      texture={texture}
      anchor={0.5}
      scale={3}
      eventMode="dynamic"
      position={position}
      pointerdown={onDown}
      pointerup={onDragEnd}
      pointerupoutside={onDragEnd}
    />
  );
};

interface Controls {
  num: number;
  scale: number;
  tint?: string;
}

interface AppControls extends Schema {
  num: number;
  scale: number;
  tint?: string;
}

const AppV1 = () => {
  const [selected, setSelected] = React.useState<number | null>(null);

  const controls = useMemo<Controls>(
    () =>
      selected === null
        ? { num: 3, scale: 3 }
        : { num: 3, scale: 3, tint: "#fff" },
    [selected]
  );

  const { num, scale, tint } = useControls(controls, [controls]);

  const bunnies = Array.from({ length: num }, (_, i) => {
    const x = Math.floor(Math.random() * window.innerWidth);
    const y = Math.floor(Math.random() * window.innerHeight);
    const thisBunnySelected = i === selected;
    return (
      <Bunny
        tint={thisBunnySelected ? tint : undefined}
        key={i}
        x={x}
        y={y}
        scale={scale}
        selected={thisBunnySelected}
        setSelected={() => setSelected(i)}
      />
    );
  });

  // const onPointerDown = (event: PIXI.FederatedPointerEvent) => {
  //   const selectedItem = event.target;
  //   console.log(event)
  // };

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      options={{
        background: 0x1099bb,
        eventMode: "passive",
      }}
    >
      {bunnies}
    </Stage>
  );
};

interface PixiDisplayProps {
  alpha: number;
  buttonMode: boolean;
  cacheAsBitmap: boolean;
  cursor: string | null;
  filterArea: PIXI.Rectangle | null;
  filters: PIXI.Filter[] | null;
  hitArea: PIXI.IHitArea | null;
  interactive: boolean;
  mask: PIXI.Graphics | PIXI.Sprite | null;
  pivot: PIXI.Point | number;
  position: PIXI.Point | number;
  renderable: boolean;
  rotation: number;
  scale: PIXI.Point | number;
  skew: PIXI.Point | number;
  transform: PIXI.Transform | null;
  visible: boolean;
  x: number;
  y: number;
}

const AppV2 = () => {
  const [spriteProperties, setSpriteProperties] = useState<PIXI.Sprite | null>(
    null
  );
  const controls = useControls(spriteProperties ?? {}, [spriteProperties]);

  // const controls = useControls(spriteProperties ?? {}, [spriteProperties])

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      options={{
        background: 0x1099bb,
        eventMode: "passive",
      }}
    >
      {/* <Sprite
        ref={(node) => {
          setSpriteProperties(node);
        }}
        tint={"#fff"}
        texture={texture}
        anchor={0.5}
        scale={3}
        x={100}
        y={100}
        {...controls}
        eventMode="dynamic"
      /> */}
      <SpriteSheet />
    </Stage>
  );
};

/*

provider config (leva interactive UI)

- shape of data for form (initial values + type)

- how to know the component is selected

- register function that gives the provider an awareness that this has been selected

- initial values

- BONUS: how can we automatically see what’s mounted and see what their props are

- useDevControls(props)
  - when selected:
      - whenever props changes, set() leva's value to the new props
      - return values from leva
  - when not selected:
      - return props
     

*/

interface LevaContextValue {
  controls: Schema;
  set: (value: any) => void;
  selectedElement: HTMLElement | null;
  setSelectedElement: (element: HTMLElement) => void;
  addControls: (newControls: Schema) => void;
  overwriteControls: (newControls: Schema) => void;
}

const LevaContext = React.createContext<LevaContextValue>({
  set: () => undefined,
  controls: {},
  setSelectedElement: () => undefined,
  selectedElement: null,
  addControls: () => undefined,
  overwriteControls: () => undefined,
});

type ObserveThisFn = (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;

interface UseObservableState {
  state: any;
  observeThis: ObserveThisFn;
  setState: (value: any) => void;
}

interface UseObservableStateInputs {
  initialState: Schema;
  options?: {
    highlightStyles: boolean;
  };
}

function useObservableState({
  initialState,
  options = { highlightStyles: true },
}: UseObservableStateInputs): UseObservableState {
  const {
    set,
    controls,
    selectedElement,
    setSelectedElement,
    addControls,
    overwriteControls,
  } = React.useContext(LevaContext);

  const [state, setState] = useState<Schema>(initialState);

  const pullFromLeva = useCallback(
    () => setState(controls),
    [controls, setState]
  );

  const pushToLeva = useCallback(
    (state: Schema) => {
      set(state);
    },
    [set]
  );

  // const pushToLeva = useCallback(() => set(state), [set, state]);

  const [lastObservedElement, setLastObservedElement] =
    useState<HTMLElement | null>(null);

  const observing = useMemo(
    () =>
      lastObservedElement &&
      selectedElement &&
      lastObservedElement === selectedElement,
    [lastObservedElement, selectedElement]
  );

  // pull from leva everytime the leva controls change
  useEffect(() => {
    if (observing) {
      console.log("pulling from leva");
      // console.log(controls, state, selectedElement, setSelectedElement);
      pullFromLeva();
    }
  }, [observing, pullFromLeva]);

  const observeThis = useCallback<ObserveThisFn>(
    (e) => {
      console.log("overwriting controls");
      overwriteControls({ ...state });
      console.log("pushing to leva");
      // pushToLeva(state);
      setSelectedElement(e.currentTarget);
      setLastObservedElement(e.currentTarget);
    },
    [state, setSelectedElement, overwriteControls]
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

const FocusIndicator: React.FC<{ selectedElement: HTMLElement | null }> = (
  props
) => {
  const [overlayPosition, setOverlayPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  const updatePositionFromElement = useCallback((element: HTMLElement) => {
    setOverlayPosition({
      top: element.offsetTop,
      left: element.offsetLeft,
      width: element.offsetWidth,
      height: element.offsetHeight,
    });
  }, []);

  const listenForElementResize = useCallback(
    (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        const element = entry.target as HTMLElement;
        if (element) {
          updatePositionFromElement(element);
        }
      }
    },
    [updatePositionFromElement]
  );

  // when the selected element changes, register a resize observer for the highlight overlay
  useEffect(() => {
    if (props.selectedElement) {
      updatePositionFromElement(props.selectedElement);
      const observer = new ResizeObserver(listenForElementResize);
      observer.observe(props.selectedElement);
      return () => observer.disconnect();
    }
  }, [
    props.selectedElement,
    listenForElementResize,
    updatePositionFromElement,
  ]);

  return (
    <div
      id="_LevaAdminOverlayId"
      style={{
        position: "absolute",
        boxShadow: "inset 0 0 0 2px #89CFF0",
        backgroundColor: "transparent",
        pointerEvents: "none",
        top: overlayPosition.top,
        left: overlayPosition.left,
        width: overlayPosition.width,
        height: overlayPosition.height,
      }}
    />
  );
};

const LevaProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
    null
  );
  const store = useCreateStore();
  const [controls, set] = useControls(() => ({ foo: "bar" }), { store });

  const addControls = (newControls: Schema) => {
    const [data, mappedPaths] = store.getDataFromSchema(newControls);
    store.addData(data, false);
  };

  const overwriteControls = (newControls: Schema) => {
    console.log(controls);
    const [data, mappedPaths] = store.getDataFromSchema(newControls);
    store.addData(data, true);
  };

  return (
    <LevaContext.Provider
      value={{
        controls,
        set,
        setSelectedElement,
        selectedElement,
        addControls,
        overwriteControls,
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
        position: state.position,
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
  const controls = useControls({ height: "100px" }, { store });

  useEffect(() => {
    setTimeout(() => {
      const [data, mappedPaths] = store.getDataFromSchema({
        height: "200px",
        width: "200px",
      });
      store.setOrderedPaths(["height", "width"]);
      store.addData(data, true);
      store.setValueAtPath("height", "300px", false);
      store.setValueAtPath("width", "300px", false);
    }, 1000);
  }, [store]);

  console.log(store.getData());

  return (
    <>
      <div
        style={{
          height: controls.height,
          width: controls.width || "100px",
          backgroundColor: "#fff",
        }}
      />
      <LevaPanel store={store} />
    </>
  );
};

export default AppV4;
