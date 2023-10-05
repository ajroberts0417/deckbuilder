import * as PIXI from 'pixi.js';
import sheetData from './spritesheet.json?url'; // special vite syntax to get the URL

const spritesheet = await PIXI.Assets.load(sheetData);

export default spritesheet;