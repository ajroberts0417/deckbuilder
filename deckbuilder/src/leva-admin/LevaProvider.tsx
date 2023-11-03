import React, {
  useEffect,
  useState,
} from "react";
import { useCreateStore, useControls, LevaPanel } from "leva";
import { Schema, StoreType } from "leva/dist/declarations/src/types";
import FocusIndicator from "./FocusIndicator";


interface LevaContextValue {
  controls: Schema;
  set: (value: Schema) => void;
  selectedElement: HTMLElement | null;
  observeNewElement: (newControls: Schema, newElement: HTMLElement) => void;
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
    selectedElement: HTMLElement | null,
    schema: Schema
  }>({
    selectedElement: null,
    schema: {}
  })
  const [controls, set] = useControls(() => (schema), { store }, [schema]);

  useEffect(() => {
    set(schema)
  }, [schema, set])

  const observeNewElement = (newControls: Schema, newElement: HTMLElement) => {
    setProviderState({
      schema: newControls,
      selectedElement: newElement
    });
  }

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
      <FocusIndicator selectedElement={selectedElement} />
      {children}
    </LevaContext.Provider>
  );
};