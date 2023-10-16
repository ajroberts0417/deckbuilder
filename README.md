
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