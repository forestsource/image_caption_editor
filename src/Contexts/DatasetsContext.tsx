import React, { createContext, useReducer } from "react";
import { Dataset } from "../types";

type DatasetsState = {
  datasets: Dataset[];
};

type DatasetsAction =
  | { type: "CREATE_DATASETS"; payload: FileSystemDirectoryHandle }
  | { type: "SET_DATASETS"; payload: Dataset[] }
  | { type: "ADD_DATASET"; payload: Dataset }
  | { type: "UPDATE_DATASET"; payload: Dataset }
  | { type: "REMOVE_DATASET"; payload: string }
  | { type: "REMOVE_CAPTION_TAG"; payload: string }
  | { type: "SAVE_CAPTION"; payload: Dataset }
  | { type: "REMOVE_ALL"; payload: "" };

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
    case "UPDATE_DATASET": {
      const newDatasets = state.datasets.map((dataset) => {
        if (dataset.name === action.payload.name) {
          return action.payload;
        }
        return dataset;
      });
      return { ...state, datasets: newDatasets };
    }
    case "REMOVE_DATASET":
      return {
        ...state,
        datasets: state.datasets.filter(
          (dataset) => dataset.name !== action.payload
        ),
      };
    case "REMOVE_CAPTION_TAG":
      state.datasets.forEach((dataset) => {
        const newCaptionContent = dataset.caption.content.filter((tag) => {
          return tag !== action.payload;
        });
        dataset.caption.content = newCaptionContent;
      });
      return { ...state };
    case "SAVE_CAPTION": {
      const saveCaption = async () => {
        const targetDataset = state.datasets.find((dataset) => {
          return dataset.name === action.payload.name;
        });
        if (targetDataset == null) {
          console.error("Dataset not found");
          return { ...state };
        }
        const fileHandle = await targetDataset.dirHandle.getFileHandle(
          targetDataset.caption.name,
          { create: true }
        );
        if (fileHandle == null) {
          console.error("FileHandle not found");
          return { ...state };
        }
        if (!fileHandle.name.endsWith(".txt")) {
          return { ...state };
        }
        const writable = await fileHandle.createWritable();
        const captionStr = targetDataset?.caption.content.join(", ");
        const result_write = await writable.write(captionStr);
        const result_close = await writable.close();
        if (result_write != null || result_close != null) {
          console.error("Caption cannot save");
        }
        console.debug("Caption saved");
      };
      saveCaption();
      return { ...state };
    }
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
