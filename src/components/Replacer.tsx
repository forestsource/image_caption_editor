import { useContext } from "react";
import Paper from "@mui/material/Paper";

import { DatasetsContext } from "../Contexts/DatasetsContext";
import { ReplaceOneTag } from "./ReplaceOneTag";
import { ReplacePartialTag } from "./ReplacePartialTag";
import { ReplaceRegexpTag } from "./ReplaceRegexpTag";
import { Dataset } from "../types";

interface ReplacerProps {
  currentPage: number;
}

export function Replacer({ currentPage }: ReplacerProps) {
  const { state, dispatch } = useContext(DatasetsContext);
  const datasets = state.datasets;
  const currentDataset = datasets[currentPage];

  const saveDatasets = (datasets: Dataset[]) => {
    datasets.forEach((dataset) => {
      dispatch({ type: "UPDATE_DATASET", payload: dataset });
    });
  };

  return (
    <Paper elevation={3} sx={{ margin: "1em" }}>
      <ReplaceOneTag updateDataset={saveDatasets} datasets={[currentDataset]} />
      <ReplacePartialTag
        updateDataset={saveDatasets}
        datasets={[currentDataset]}
      />
      <ReplaceRegexpTag
        updateDataset={saveDatasets}
        datasets={[currentDataset]}
      />
      <span style={{ padding: "1em" }}></span>
    </Paper>
  );
}
