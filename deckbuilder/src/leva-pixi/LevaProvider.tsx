import React, {
  useEffect,
  useState,
} from "react";
import { useCreateStore, useControls, LevaPanel } from "leva";
import { Schema, StoreType } from "leva/dist/declarations/src/types";
import FocusIndicator from "./FocusIndicator";
import { DisplayObject } from "pixi.js";


interface LevaContextValue {
  controls: Schema;
  set: (value: Schema) => void;
  selectedElement: DisplayObject | null;
  observeNewElement: (newControls: Schema, newElement: DisplayObject) => void;
  store: StoreType | null;
}

export const LevaContext = React.createContext<LevaContextValue>({
  set: () => undefined,
  controls: {},
  selectedElement: null,
  observeNewElement: () => undefined,
  store: null
});

export const LevaProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const store = useCreateStore()
  const [{ schema, selectedElement }, setProviderState] = useState<{
    selectedElement: DisplayObject | null,
    schema: Schema
  }>({
    selectedElement: null,
    schema: {}
  })
  const [controls, set] = useControls(() => (schema), { store }, [schema]);

  useEffect(() => {
    set(schema)
  }, [schema, set])

  const observeNewElement = (newControls: Schema, newElement: DisplayObject) => {
    console.log("ENTER observeNewElement", newControls, newElement);
    setProviderState({
      schema: newControls,
      selectedElement: newElement
    });
  }

  console.log("observeNewElement: ", observeNewElement)

  return (
    <LevaContext.Provider
      value={{
        controls,
        set,
        observeNewElement,
        store,
        selectedElement
      }}
    >
      <LevaPanel store={store} />
      {/* redesign the focusindicator to add a highlight around the display object using pixi */}
      {/* <FocusIndicator selectedElement={selectedElement} /> */}
      {children}
    </LevaContext.Provider>
  );
};