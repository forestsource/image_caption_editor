import { useContext } from "react";
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

export function BatchReplacer() {
  const { t } = useTranslation();
  const { dispatch: notificationsDispatch } = useContext(NotificationsContext);
  const { state, dispatch } = useContext(DatasetsContext);
  const datasets = state.datasets;

  const saveDatasets = (datasets: Dataset[]) => {
    dispatch({ type: "SET_DATASETS", payload: datasets });
    notificationsDispatch({
      type: "NOTIFY",
      payload: { open: true, msg: t("replace.replaced"), severity: sv.SUCCESS },
    });
  };

  const onSaveCaption = () => {
    datasets.forEach((dataset) => {
      dispatch({ type: "SAVE_CAPTION", payload: dataset });
    });
    notificationsDispatch({
      type: "NOTIFY",
      payload: { open: true, msg: t("general.saved"), severity: sv.SUCCESS },
    });
  };

  return (
    <Paper elevation={3} sx={{ margin: "1em" }}>
      <Box sx={{ padding: "1em" }}>
        <Fab
          aria-label="save"
          color="primary"
          variant="extended"
          onClick={onSaveCaption}
        >
          <SaveIcon sx={{ mr: 1 }} /> {t("general.save_all")}
        </Fab>
      </Box>
      <ReplaceOneTag updateDataset={saveDatasets} datasets={datasets} />
      <ReplacePartialTag updateDataset={saveDatasets} datasets={datasets} />
      <ReplaceRegexpTag updateDataset={saveDatasets} datasets={datasets} />
      <span style={{ padding: "1em" }}></span>
    </Paper>
  );
}
