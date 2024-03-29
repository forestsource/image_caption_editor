import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Unstable_Grid2";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import WavingHandIcon from "@mui/icons-material/WavingHand";

import type { Dataset } from "../types";
import { DatasetsContext } from "../Contexts/DatasetsContext";
import { useTranslation } from "react-i18next";

export function ListDirectory() {
  const { t } = useTranslation();
  const { state } = useContext(DatasetsContext);
  const datasets = state.datasets;
  const navigate = useNavigate();

  const empty = () => {
    return (
      <Box sx={{ padding: "3em" }}>
        <Typography variant="h5">
          <span style={{ color: "#fbc02d" }}>
            <WavingHandIcon />
            <WavingHandIcon />
            <WavingHandIcon sx={{ marginRight: "0.5em" }} />
          </span>
          {t("list.no_dataset")}
        </Typography>
      </Box>
    );
  };

  if (datasets.length === 0) {
    return empty();
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
