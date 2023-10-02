import React, { useRef, useEffect } from 'react';
import { Stage, Sprite, withPixiApp } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { useControls } from 'leva'
import { Schema } from 'leva/dist/declarations/src/types'

const texture = PIXI.Texture.from('https://pixijs.com/assets/bunny.png');
texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;


function useAdminControls<T extends Schema>(initialSchema: T): T {
  if (import.meta.env.VITE_ADMIN_MODE) {
    // @LIAM: what should I do instead here?
    return useControls(initialSchema) as unknown as T;
  }
  return initialSchema;
}

interface BunnyProps {
  x: number;
  y: number;
  scale: number;
  selected: PIXI.DisplayObject | null;
  setSelected: (selected: PIXI.DisplayObject | null) => void;
}

const Bunny = ({ x, y, scale = 3 }: BunnyProps) => {
  const bunny = useRef<PIXI.Sprite>(null);
  const [position, setPosition] = React.useState({ x, y });
  const { bunScale, tint } = useAdminControls({ bunScale: 3, tint: "#ffffff" })

  const onDown = (e: PIXI.FederatedPointerEvent) => {
    bunny.current!.alpha = 0.5;
    // to understand what's going on here:
    // https://pixijs.com/guides/components/interaction
    e.currentTarget.on('globalpointermove', onMove);
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

  return (
    <Sprite
      ref={bunny}
      tint={tint}
      texture={texture}
      anchor={0.5}
      scale={bunScale}
      eventMode="dynamic"
      position={position}
      pointerdown={onDown}
      pointerup={onDragEnd}
      pointerupoutside={onDragEnd}
    />
  );
};

interface AppControls extends Schema {
  num: number;
  scale: number;
}

const App = () => {
  const initialControls: AppControls = {
    num: 5,
    scale: 3,
  };
  const { num, scale } = useAdminControls(initialControls);
  const [selected, setSelected] = React.useState<PIXI.DisplayObject | null>(null);

  const bunnies = Array.from({ length: num }, (_, i) => {
    const x = Math.floor(Math.random() * window.innerWidth);
    const y = Math.floor(Math.random() * window.innerHeight);
    return <Bunny key={i} x={x} y={y} scale={scale} selected={selected} setSelected={setSelected} />;
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

export default App;
