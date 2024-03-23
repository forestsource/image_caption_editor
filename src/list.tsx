import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Unstable_Grid2";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import type { Dataset } from "./types";
import { DatasetsContext } from "./Contexts/DatasetsContext";

const cardStyle = {
  width: "18rem",
  height: "20rem",
  padding: "10px",
  border: "none",
  cursor: "pointer",
};
const cardStyleHover = {
  backgroundColor: "var(--bs-primary)",
  top: "-0.5em",
  boxShadow: "0 2px 3px rgba(0, 0, 0, 0.3)",
};

const bigOnHover = {
  height: "100%",
  "&:hover": {
    // backgroundColor: 'primary.main',
    opacity: [0.9, 0.8, 0.7],
    margin: -1,
    boxShadow: 1,
  },
};

export function ListDirectory() {
  const { state, dispatch } = useContext(DatasetsContext);
  const datasets = state.datasets;
  const navigate = useNavigate();

  return (
    <>
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
                sx={{}}
              >
                <CardMedia
                  component="img"
                  image={dataset.image.uri}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent>
                  <Typography>{dataset.caption.content}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Grid>
      </Box>
    </>
  );
}
