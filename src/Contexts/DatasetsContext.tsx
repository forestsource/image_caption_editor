import React, { createContext, useReducer } from "react";
import { Dataset } from "../types";

type DatasetsState = {
  datasets: Dataset[];
};

type DatasetsAction =
  | { type: "SET_DATASETS"; payload: Dataset[] }
  | { type: "ADD_DATASET"; payload: Dataset }
  | { type: "REMOVE_DATASET"; payload: string };

const DatasetsContext = createContext<{
  state: DatasetsState;
  dispatch: React.Dispatch<DatasetsAction>;
}>({
  state: { datasets: [] },
  dispatch: () => undefined,
});

const datasetsReducer = (
  state: DatasetsState,
  action: DatasetsAction
): DatasetsState => {
  switch (action.type) {
    case "SET_DATASETS":
      return { ...state, datasets: action.payload };
    case "ADD_DATASET":
      return { ...state, datasets: [...state.datasets, action.payload] };
    case "REMOVE_DATASET":
      return {
        ...state,
        datasets: state.datasets.filter(
          (dataset) => dataset.name !== action.payload
        ),
      };
    default:
      return state;
  }
};

const DatasetsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(datasetsReducer, { datasets: [] });

  return (
    <DatasetsContext.Provider value={{ state, dispatch }}>
      {children}
    </DatasetsContext.Provider>
  );
};

export { DatasetsContext, DatasetsProvider };
