# deckbuilder



# Attributions

### Music
Massive thank you to Marllon Silva a.k.a xDeviruchi for the music for this game, which you can find [here](https://xdeviruchi.itch.io/8-bit-fantasy-adventure-music-pack):
I'm blessed to be living in a world where such talented people make their music free for new developers like me 😭

### Art
Again, huge thank you to CafeDraw for creating free fantasy card assets, which you can find [here](https://cafedraw.itch.io/fantasy-card-assets). Prototyping the game would have felt impossible without his spritesheets!


### Tools:
Speaking of spritesheets, using spritesheets created by talented folks would have been impossible without [Leshy Labs' Spritesheet Tool](https://www.leshylabs.com/apps/sstool/). I used it to repack and remap and generate spritesheet data for the spritesheets that came without data.



## Leva Examples:


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