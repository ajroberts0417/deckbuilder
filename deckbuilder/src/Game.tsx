import { Stage } from "@pixi/react";
import { LevaProvider } from "./leva-pixi";
import SpriteSheet from "./SpriteSheet";

// interface
// const LevaAdminStage = ({children}) => {
//   return(
//     <Stage
//         width={window.innerWidth}
//         height={window.innerHeight}
//         options={{
//           background: 0x1099bb,
//           eventMode: "passive",
//         }}
//       >
//         {children}
//     </Stage>
//   )
// }


const Game = () => {

  return (
    <LevaProvider>
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
    </LevaProvider>
  );
};

export default Game;