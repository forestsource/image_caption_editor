import React, { useContext } from "react";
import Paper from "@mui/material/Paper";
import Autocomplete, {
  AutocompleteChangeReason,
  AutocompleteChangeDetails,
} from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import { Typography } from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AbcIcon from "@mui/icons-material/Abc";
import SellIcon from "@mui/icons-material/Sell";

import { DatasetsContext } from "./Contexts/DatasetsContext";

function processStringWithRegex(str: string, regexInput: string): string {
  const parts = regexInput.split("/");
  if (parts.length < 3) {
    console.debug(parts);
    throw new Error("Invalid regex format");
  }
  const pattern = parts[1];
  const flags = parts[3];
  const regex = new RegExp(pattern, flags);
  return str.replace(regex, parts[2]);
}

export function Replacer() {
  const [onSaveSuccess, setOnSaveSuccess] = React.useState(false);
  const [beforeTag, setBeforeTag] = React.useState("");
  const [afterTag, setAfterTag] = React.useState("");
  const [selectedPartialTag, setSelectedPartialTag] = React.useState("");
  const [beforeStringPartialTag, setBeforeStringPartialTag] =
    React.useState("");
  const [afterStringPartialTag, setAfterStringPartialTag] = React.useState("");
  const [regexpString, setRegexpString] = React.useState("");
  const { state, dispatch } = useContext(DatasetsContext);
  const datasets = state.datasets;
  const flatTags = datasets.flatMap((dataset) => dataset.caption.content);
  const allTags = Array.from(new Set(flatTags));

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
  };
  const replaceATag = () => {
    console.debug("replaceATag", beforeTag, afterTag);
    datasets.forEach((dataset) => {
      const newCaptionContent = dataset.caption.content.map((tag) => {
        if (tag === beforeTag) {
          return afterTag;
        }
        return tag;
      });
      dataset.caption.content = newCaptionContent;
    });
    dispatch({ type: "SET_DATASETS", payload: datasets });
  };
  const replaceStringATag = () => {
    datasets.forEach((dataset) => {
      const newCaptionContent = dataset.caption.content.map((tag) => {
        if (tag === selectedPartialTag) {
          return tag.replace(beforeStringPartialTag, afterStringPartialTag);
        }
        return tag;
      });
      dataset.caption.content = newCaptionContent;
    });
    dispatch({ type: "SET_DATASETS", payload: datasets });
  };
  const replaceRegexpPerTag = () => {
    datasets.forEach((dataset) => {
      const newCaptionContent = dataset.caption.content.map((tag) => {
        let result = "";
        try {
          result = processStringWithRegex(tag, regexpString);
        } catch {
          console.info("regexp is invalid: ", regexpString);
          // TODP: format error を表示する
          return tag;
        }
        console.debug(result, tag, regexpString);
        return result;
      });
      dataset.caption.content = newCaptionContent;
    });
    dispatch({ type: "SET_DATASETS", payload: datasets });
  };
  const onChangeBeforeTag = (
    event: React.SyntheticEvent<Element, Event>,
    value: string | null,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<string> | undefined
  ) => {
    if (value === null) {
      value = "";
    }
    setBeforeTag(value);
  };
  const onChangePartialTag = (
    event: React.SyntheticEvent<Element, Event>,
    value: string | null,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<string> | undefined
  ) => {
    if (value === null) {
      value = "";
    }
    setSelectedPartialTag(value);
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
          <SaveIcon sx={{ mr: 1 }} /> Save All
        </Fab>
      </Box>
      <Box sx={{ padding: "1em" }} id="replace-a-tag-box">
        <Typography>
          Replace a tag <SellIcon />
        </Typography>
        <Grid container spacing={0}>
          <Grid item xs={5}>
            <Autocomplete
              disablePortal
              options={allTags}
              onChange={onChangeBeforeTag}
              renderInput={(params) => (
                <TextField {...params} label="before tag" value={beforeTag} />
              )}
            />
          </Grid>
          <Grid
            item
            xs={1}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowForwardIcon />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="after tag"
              sx={{ width: "100%" }}
              value={afterTag}
              onChange={(e) => setAfterTag(e.target.value)}
            />
          </Grid>
        </Grid>
        <Box
          sx={{
            paddingTop: "1em",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button variant="outlined" onClick={replaceATag}>
            Replace
          </Button>
        </Box>
      </Box>
      <Box sx={{ padding: "1em" }} id="replace-partial-tag-box">
        <Typography>
          Replace partial tag <AbcIcon />
        </Typography>
        <Autocomplete
          disablePortal
          options={allTags}
          onChange={onChangePartialTag}
          renderInput={(params) => (
            <TextField
              {...params}
              label="target tag"
              value={selectedPartialTag}
            />
          )}
        />
        <Grid container spacing={0} sx={{ paddingTop: "1em" }}>
          <Grid item xs={5}>
            <TextField
              label="before string"
              sx={{ width: "100%" }}
              value={beforeStringPartialTag}
              onChange={(e) => setBeforeStringPartialTag(e.target.value)}
            />
          </Grid>
          <Grid
            item
            xs={2}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowForwardIcon />
          </Grid>
          <Grid item xs={5}>
            <TextField
              label="after string"
              sx={{ width: "100%" }}
              value={afterStringPartialTag}
              onChange={(e) => setAfterStringPartialTag(e.target.value)}
            />
          </Grid>
        </Grid>
        <Box
          sx={{
            paddingTop: "1em",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button variant="outlined" onClick={replaceStringATag}>
            Replace
          </Button>
        </Box>
      </Box>
      <Box sx={{ padding: "1em" }} id="replace-regexp-box">
        <Typography>
          Regexp per tag <b>( .* )</b>
        </Typography>
        <TextField
          label="regexp"
          sx={{ paddingTop: "1em", width: "100%" }}
          value={regexpString}
          onChange={(e) => setRegexpString(e.target.value)}
        />
        <Box
          sx={{
            paddingTop: "1em",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button variant="outlined" onClick={replaceRegexpPerTag}>
            Replace
          </Button>
        </Box>
      </Box>
      <span style={{ padding: "1em" }}></span>
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
