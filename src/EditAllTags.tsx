import React, { useContext } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Fab from "@mui/material/Fab";
import SaveIcon from "@mui/icons-material/Save";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import { DatasetsContext } from "./Contexts/DatasetsContext";

const isValidRegex = (userInput: string): boolean => {
  try {
    new RegExp(userInput);
  } catch (e) {
    return false;
  }
  return true;
};

export function EditAllTags() {
  const { state, dispatch } = useContext(DatasetsContext);
  const datasets = state.datasets;
  const flatTags = datasets.flatMap((dataset) => dataset.caption.content);
  const allTags = Array.from(new Set(flatTags));
  const [filter, setFilter] = React.useState<string>("");
  const [onSaveSuccess, setOnSaveSuccess] = React.useState(false);
  const [onSaveFailure, setOnSaveFailure] = React.useState(false);

  const filterdTags = () => {
    if (filter === "" || filter === undefined) {
      return allTags;
    }
    if (!isValidRegex(filter)) {
      return [];
    }
    const regex = new RegExp(filter, "i");
    return allTags.filter((tag) => {
      return tag.match(regex);
    });
  };
  const handleDelete = (tag: string) => () => {
    dispatch({ type: "REMOVE_CAPTION_TAG", payload: tag });
    console.debug("delete tag: ", datasets[0].caption.content);
  };
  const onSaveCaption = () => {
    datasets.forEach((dataset) => {
      dispatch({ type: "SAVE_CAPTION", payload: dataset });
    });
    setOnSaveSuccess(true);
  };

  const snackClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setOnSaveSuccess(false);
    setOnSaveFailure(false);
  };

  return (
    <Paper elevation={3} sx={{ margin: "1em" }}>
      <Box
        sx={{
          margin: "1em",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Fab
          aria-label="save"
          color="primary"
          variant="extended"
          onClick={onSaveCaption}
          sx={{ margin: 1 }}
        >
          <SaveIcon sx={{ mr: 1 }} /> Save All
        </Fab>
        <TextField
          id="tag-filter"
          label="search"
          variant="standard"
          onChange={(event) => setFilter(event.target.value)}
          sx={{ textAlign: "right" }}
        />
      </Box>
      <Box sx={{ margin: "1em", paddingBottom: "1em" }} id="allTagsBox">
        {filterdTags().map((tag, index) => (
          <Chip
            key={index}
            label={tag}
            color={"primary"}
            variant="outlined"
            sx={{ margin: "0.1em" }}
            onDelete={handleDelete(tag)}
          />
        ))}
      </Box>
      <Snackbar
        open={onSaveSuccess}
        autoHideDuration={2000}
        onClose={snackClose}
      >
        <Alert onClose={snackClose} severity="success" sx={{ width: "100%" }}>
          {" "}
          Save Success
        </Alert>
      </Snackbar>
    </Paper>
  );
}
