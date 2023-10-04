import { Sprite } from '@pixi/react';
import * as PIXI from 'pixi.js';
import sheetTexture from './assets/spritesheet.png';
import sheetData from './assets/spritesheet.json?url'; // special vite syntax to get the URL

console.log(sheetData)

// const sheet = new PIXI.Spritesheet(sheetTexture, sheetData);
// await sheet.parse((textures) => {
//   console.log(textures)
// })
const sheet = await PIXI.Assets.load(sheetData);


export default function SpriteSheet() {
  console.log(sheet.textures['bg-blue'])
  console.log(sheet)
  console.log(sheetData)

  return (
    <Sprite
      tint={"#fff"}
      texture={sheet.textures['bg-blue']}
      anchor={0.5}
      scale={3}
      eventMode="dynamic"
    />
  )
}