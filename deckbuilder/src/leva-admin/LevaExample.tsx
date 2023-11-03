import { LevaProvider, useObservableState } from ".";

// map of uuid to element pointer
// map of uuid to element state (javascript object updated through Leva)
// currently selected uuid (push + pull to/from the state of this uuid)

const TestComponent = () => {
  const { state, ref, setState } = useObservableState({
    height: "100px",
    color: "white",
    width: "100px",
  });


  return (
    // <observable.div/>
    <div
      ref={ref}
      style={{
        height: state.height,
        width: state.width,
        backgroundColor: state.color,
      }}
    ></div>
  );
};

const TestComponent2 = () => {
  const { state, ref, setState } = useObservableState({
    height: "100px",
    color: "white",
    width: "100px",
    // position: { options: ["absolute", "relative", "fixed"] },
    borderRadius: "10px",
  });

  return (
    <div
      ref={ref}
      style={{
        height: state.height,
        width: state.width,
        backgroundColor: state.color,
        // position: state.position,
        borderRadius: state.borderRadius,
      }}
    ></div>
  );
};

const ExampleApp = () => {
  return (
    <LevaProvider>
      <TestComponent></TestComponent>
      <TestComponent></TestComponent>
      <TestComponent2 />
    </LevaProvider>
  );
};

export default ExampleApp;