import { Sprite } from '@pixi/react';
import spritesheet from './assets/spritesheet';


export default function SpriteSheet() {

  return (
    <Sprite
      tint={"#fff"}
      texture={spritesheet.textures['bg-blue']}
      anchor={0.5}
      scale={3}
      eventMode="dynamic"
    />
  )
}