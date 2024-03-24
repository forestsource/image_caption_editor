import React, { useContext } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Fab from "@mui/material/Fab";
import SaveIcon from "@mui/icons-material/Save";

import { DatasetsContext } from "./Contexts/DatasetsContext";
import { TopNTags } from "./TopNTags";
import { EditAllTags } from "./EditAllTags";

export function BatchEditor() {
  const { state, dispatch } = useContext(DatasetsContext);
  const datasets = state.datasets;
  const flatTags = datasets.flatMap((dataset) => dataset.caption.content);
  const allTags = Array.from(new Set(flatTags));
  const [filter, setFilter] = React.useState<string>("");

  return (
    <Box>
      <EditAllTags />
      <TopNTags />
    </Box>
  );
}
