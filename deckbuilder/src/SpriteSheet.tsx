import { Sprite } from '@pixi/react';
import spritesheet from './assets/spritesheet';
import * as PIXI from 'pixi.js';
import { useCallback, useRef, useState, ComponentProps } from 'react';


type DraggableSpriteProps = ComponentProps<typeof Sprite> & {
  x?: number;
  y?: number;
  anchor?: number;
}

export function DraggableSprite({ anchor = 0.5, x = 100, y = 100, ...props }: DraggableSpriteProps) {
  const sprite = useRef<PIXI.Sprite>(null);
  const [position, setPosition] = useState({ x, y });

  const onDown = (e: PIXI.FederatedPointerEvent) => {
    sprite.current!.alpha = 0.5;
    // to understand what's going on here:
    // https://pixijs.com/guides/components/interaction
    e.currentTarget.on("globalpointermove", onMove);
  };

  const onDragEnd = (e: PIXI.FederatedPointerEvent) => {
    e.currentTarget.off("globalpointermove", onMove);
    sprite.current!.alpha = 1;
  };

  const onMove = useCallback(
    (e: PIXI.FederatedPointerEvent) => {
      if (sprite.current) {
        setPosition(e.data.getLocalPosition(sprite.current.parent));
      }
    },
    [setPosition]
  );

  return (
    <Sprite
      ref={sprite}
      anchor={anchor}
      {...props}
      eventMode="dynamic"
      position={position}
      pointerdown={onDown}
      pointerup={onDragEnd}
      pointerupoutside={onDragEnd}
    />
  )
}

export default function SpriteSheet() {

  return (
    <DraggableSprite
      tint={"#fff"}
      texture={spritesheet.textures['bg-blue']}
      scale={3}
    />
  )
}