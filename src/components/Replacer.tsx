import React, { useContext } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import { useTranslation } from "react-i18next";
import SaveIcon from "@mui/icons-material/Save";

import { DatasetsContext } from "../Contexts/DatasetsContext";
import { NotificationsContext } from "../Contexts/NotificationsContext";
import { Severity as sv } from "../types";
import { ReplaceOneTag } from "./ReplaceOneTag";
import { ReplacePartialTag } from "./ReplacePartialTag";
import { ReplaceRegexpTag } from "./ReplaceRegexpTag";
import { Dataset } from "../types";

interface ReplacerProps {
  currentPage: number;
}

export function Replacer({ currentPage }: ReplacerProps) {
  const { t } = useTranslation();
  const { dispatch: notificationsDispatch } = useContext(NotificationsContext);
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
