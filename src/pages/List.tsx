import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Unstable_Grid2";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

import type { Dataset } from "../types";
import { DatasetsContext } from "../Contexts/DatasetsContext";
import { useTranslation } from "react-i18next";
import { loadDatasetFolder } from "../utils/DatasetUtil";
import { DirectoryLoadError, InvalidFileTypeError } from "../Errors";
import { NotificationsContext } from "../Contexts/NotificationsContext";
import { Severity as sv } from "../types";

export function ListDirectory() {
  const { t } = useTranslation();
  const { state } = useContext(DatasetsContext);
  const dispatch = useContext(DatasetsContext).dispatch;
  const notificationsDispatch = useContext(NotificationsContext).dispatch;
  const datasets = state.datasets;
  const navigate = useNavigate();

  const loadDataset = () => {
    async function loadDataset() {
      let datasets = [];
      try {
        datasets = await loadDatasetFolder();
      } catch (e) {
        if (e instanceof DirectoryLoadError) {
          notificationsDispatch({
            type: "NOTIFY",
            payload: {
              open: true,
              msg: t("dataset.no_picked"),
              severity: sv.WARNING,
            },
          });
          return;
        } else if (e instanceof InvalidFileTypeError) {
          notificationsDispatch({
            type: "NOTIFY",
            payload: {
              open: true,
              msg: t("dataset.wrong_type"),
              severity: sv.ERROR,
            },
          });
          return;
        } else {
          if (e instanceof Error) {
            console.error(e);
            console.error(e.name);
            console.error(`${typeof e} ${Object.prototype.toString.call(e)}`);
          }
          return notificationsDispatch({
            type: "NOTIFY",
            payload: {
              open: true,
              msg: t("dataset.unknown_error"),
              severity: sv.ERROR,
            },
          });
        }
      }
      console.debug("SET_DATASETS: ", datasets);
      if (datasets.length === 0) {
        return notificationsDispatch({
          type: "NOTIFY",
          payload: {
            open: true,
            msg: t("dataset.no_images"),
            severity: sv.WARNING,
          },
        });
      }
      dispatch({ type: "SET_DATASETS", payload: datasets });
    }
    return (
      <Box
        sx={{
          padding: "3em",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Button variant="contained" size="large" onClick={loadDataset}>
          <AddPhotoAlternateIcon sx={{ marginRight: "0.5em" }} />
          {t("sidebar.load_dataset")}
        </Button>
      </Box>
    );
  };

  if (datasets.length === 0) {
    return loadDataset();
  }
  return (
    <Box>
      <Grid xs={12} id="grid-list">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            overflow: "auto",
            padding: "16px",
            backgroundColor: "background.default",
          }}
        >
          {datasets.map((dataset: Dataset, index: number) => (
            <Card
              key={index}
              onClick={() => navigate(`/edit/${index}`)}
              sx={{
                transition: "transform 0.3s",
                "&:hover": {
                  opacity: [0.9, 0.8, 0.7],
                  cursor: "pointer",
                  transform: "scale(1.05)",
                },
              }}
            >
              <CardMedia
                component="img"
                image={dataset.image.uri}
                sx={{ objectFit: "cover" }}
              />
              <CardContent>
                <Typography>{dataset.caption.content.join(", ")}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Grid>
    </Box>
  );
}
