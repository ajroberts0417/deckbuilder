import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Stage, Sprite, withPixiApp } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { useControls } from 'leva'
import { Schema } from 'leva/dist/declarations/src/types'
import { v4 } from 'uuid'

const texture = PIXI.Texture.from('https://pixijs.com/assets/bunny.png');
texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;


function useAdminControls<T extends Schema>(initialSchema: T): T {
  if (import.meta.env.VITE_ADMIN_MODE) {
    // @LIAM: what should I do instead here?
    return useControls(initialSchema, []) as unknown as T;
  }
  return initialSchema;
}

interface BunnyProps {
  key: number
  x: number;
  y: number;
  tint?: string;
  scale: number;
  selected: boolean
  setSelected: () => void;
}

const Bunny = ({ x, y, scale = 3, tint, key, setSelected, selected }: BunnyProps) => {
  const bunny = useRef<PIXI.Sprite>(null);
  const [position, setPosition] = React.useState({ x, y });
  
  const onDown = (e: PIXI.FederatedPointerEvent) => {
    bunny.current!.alpha = 0.5;
    // to understand what's going on here:
    // https://pixijs.com/guides/components/interaction
    e.currentTarget.on('globalpointermove', onMove);
    setSelected()
    setLevaControls(bunny.current)
  };

  const onDragEnd = (e: PIXI.FederatedPointerEvent) => {
    e.currentTarget.off('globalpointermove', onMove);
    bunny.current!.alpha = 1;
  };

  const onMove = React.useCallback((e: PIXI.FederatedPointerEvent) => {
    if (bunny.current) {
      setPosition(e.data.getLocalPosition(bunny.current.parent));
    }
  }, [setPosition]);

  const [myTint, setMyTint] = useState(tint)

  useEffect(() => {
    if(selected && myTint !== tint) { 
      setMyTint(tint);
    }
  }, [tint, selected, myTint])

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
      selected === null ? { num: 3, scale: 3 } : { num: 3, scale: 3, tint: "#fff" },
    [selected]
  );

  const { num, scale, tint } = useControls(controls, [controls]);

  const bunnies = Array.from({ length: num }, (_, i) => {
    const x = Math.floor(Math.random() * window.innerWidth);
    const y = Math.floor(Math.random() * window.innerHeight);
    const thisBunnySelected = i === selected
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
      }}>
      {bunnies}
    </Stage>
  );
};

interface PixiDisplayProps {
    alpha: number,
    buttonMode: boolean,
    cacheAsBitmap: boolean,
    cursor: string | null,
    filterArea: PIXI.Rectangle | null,
    filters: PIXI.Filter[] | null,
    hitArea: PIXI.IHitArea | null,
    interactive: boolean,
    mask: PIXI.Graphics | PIXI.Sprite | null,
    pivot: PIXI.Point | number,
    position: PIXI.Point | number,
    renderable: boolean,
    rotation: number,
    scale: PIXI.Point | number,
    skew: PIXI.Point | number,
    transform: PIXI.Transform | null,
    visible: boolean,
    x: number,
    y: number,
}

const AppV2 = () => {

  const [spriteProperties, setSpriteProperties] = useState<PIXI.Sprite | null>(null);

  const controls = useControls(spriteProperties ?? {}, [spriteProperties])

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      options={{
        background: 0x1099bb,
        eventMode: "passive",
      }}
    >
      <Sprite
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
      />
    </Stage>
  );
}

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



const LevaContext = React.createContext<{ 
  set: (value: any) => void
  controls: any
  setSelected: (uuid: string) => void
  selected: string
}>({
  set: () => undefined,
  controls: undefined,
  setSelected: () => undefined,
  selected: ''
})

function useObservableState<T>(initialState: T) {
  const uuid = useMemo(() => v4(), [])
  const { set, controls, selected, setSelected } = React.useContext(LevaContext)
  const observing = selected === uuid
  const [state, setState] = useState(initialState)

  const pullFromLeva = useCallback(() => setState(controls), [controls, setState])
  const pushToLeva = useCallback(() => set(state), [set, state])

  useEffect(() => {
    // if this component is selected, sync leva updates to this
    if(observing) {
      pullFromLeva()
    }
  }, [observing, pullFromLeva])

  const observeThis = useCallback(() => {
    setSelected(uuid)
    pushToLeva()
  }, [pushToLeva, setSelected, uuid])

  return {
    state,
    observeThis,
    setState: () => {
      setState(state)
      // if this component is selected, sync updates to leva
      if(observing) {
        pushToLeva()
      }
    }
  };
}

const LevaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {


  // get(['color', 'height', 'width'])
  const [selected, setSelected] = useState('')
  const [controls, set] = useControls(() => ({color: "white", width: "100px"}), []);

  return (
    <LevaContext.Provider value={{ controls, set, setSelected, selected }}>
      {children}
    </LevaContext.Provider>
  )
}

const TestComponent = () => {

  const { state, observeThis, setState } = useObservableState({ color: "red", width: "100px" });

  return (
    <div onClick={observeThis} style={{ height: '100px', width: state.width, backgroundColor: state.color }}></div>
  )
}

const AppV3 = () => {
  return (
    <LevaProvider>
      <TestComponent></TestComponent>
      <TestComponent></TestComponent>
    </LevaProvider>
  )
};


export default AppV3