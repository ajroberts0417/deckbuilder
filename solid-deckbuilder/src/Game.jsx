import { draw, drawX, discardRandom } from './actions';
import { gameState } from './data/state';


function App() {

  return (
    <div style={{ "padding-left": "100px" }}>
      <pre>
        {JSON.stringify(gameState, (_, value) =>
          typeof value === 'function' ? value.name : value, 2)}
      </pre>
      <button onClick={() => draw()}>Draw</button>
      <button onClick={() => drawX(3)}>Draw 3</button>
      <button onClick={() => discardRandom()}>Discard Random</button>
    </div>
  );
}

export default App;
