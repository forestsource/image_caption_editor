import { useContext } from "react";
import Paper from "@mui/material/Paper";

import { DatasetsContext } from "../Contexts/DatasetsContext";
import { NotificationsContext } from "../Contexts/NotificationsContext";
import { ReplaceOneTag } from "./ReplaceOneTag";
import { ReplacePartialTag } from "./ReplacePartialTag";
import { ReplaceRegexpTag } from "./ReplaceRegexpTag";
import { Dataset } from "../types";
import { Severity as sv } from "../types";
import { useTranslation } from "react-i18next";

interface ReplacerProps {
  currentPage: number;
}

export function Replacer({ currentPage }: ReplacerProps) {
  const { t } = useTranslation();
  const { state, dispatch } = useContext(DatasetsContext);
  const { dispatch: notificationsDispatch } = useContext(NotificationsContext);
  const datasets = state.datasets;
  const currentDataset = datasets[currentPage];

  const saveDatasets = (datasets: Dataset[]) => {
    datasets.forEach((dataset) => {
      dispatch({ type: "UPDATE_DATASET", payload: dataset });
    });
    notificationsDispatch({
      type: "NOTIFY",
      payload: { open: true, msg: t("replace.replaced"), severity: sv.SUCCESS },
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
