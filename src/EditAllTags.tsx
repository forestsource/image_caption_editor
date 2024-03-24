import React, { useContext } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Fab from "@mui/material/Fab";
import SaveIcon from "@mui/icons-material/Save";

import { DatasetsContext } from "./Contexts/DatasetsContext";
import { TopNTags } from "./TopNTags";

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
    </Paper>
  );
}
