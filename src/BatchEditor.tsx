import React, { useContext } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";

import { DatasetsContext } from "./Contexts/DatasetsContext";
import { TopNTags } from "./TopNTags";

export function BatchEditor() {
  const { state, dispatch } = useContext(DatasetsContext);
  const datasets = state.datasets;

  return (
    <Box>
      <Card sx={{ margin: "1em" }}>
        <TopNTags />
      </Card>
    </Box>
  );
}
