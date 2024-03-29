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
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import SaveIcon from "@mui/icons-material/Save";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AbcIcon from "@mui/icons-material/Abc";
import SellIcon from "@mui/icons-material/Sell";

import { DatasetsContext } from "../Contexts/DatasetsContext";
import { NotificationsContext } from "../Contexts/NotificationsContext";
import { Severity as sv } from "../types";
import { processStringWithRegexp } from "../RegexpUtil";

export function Replacer() {
  const { t } = useTranslation();
  const { dispatch: notificationsDispatch } = useContext(NotificationsContext);
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
    notificationsDispatch({
      type: "NOTIFY",
      payload: { open: true, msg: t("general.saved"), severity: sv.SUCCESS },
    });
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
          result = processStringWithRegexp(tag, regexpString);
        } catch {
          console.info("regexp is invalid: ", regexpString);
          // TODO: format error を表示する
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
    _event: React.SyntheticEvent<Element, Event>,
    value: string | null,
    _reason: AutocompleteChangeReason,
    _details?: AutocompleteChangeDetails<string> | undefined
  ) => {
    if (value === null) {
      value = "";
    }
    setBeforeTag(value);
  };
  const onChangePartialTag = (
    _event: React.SyntheticEvent<Element, Event>,
    value: string | null,
    _reason: AutocompleteChangeReason,
    _details?: AutocompleteChangeDetails<string> | undefined
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
          <SaveIcon sx={{ mr: 1 }} /> {t("general.save_all")}
        </Fab>
      </Box>
      <Box sx={{ padding: "1em" }} id="replace-a-tag-box">
        <Typography>
          {t("replace.replace_tag")} <SellIcon />
        </Typography>
        <Grid container spacing={0}>
          <Grid item xs={5}>
            <Autocomplete
              disablePortal
              options={allTags}
              onChange={onChangeBeforeTag}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("replace.before_tag")}
                  value={beforeTag}
                />
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
              label={t("replace.after_tag")}
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
            {t("replace.replace")}
          </Button>
        </Box>
      </Box>
      <Box sx={{ padding: "1em" }} id="replace-partial-tag-box">
        <Typography>
          {t("replace.replace_partial_tag")} <AbcIcon />
        </Typography>
        <Autocomplete
          disablePortal
          options={allTags}
          onChange={onChangePartialTag}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("replace.target_tag")}
              value={selectedPartialTag}
            />
          )}
        />
        <Grid container spacing={0} sx={{ paddingTop: "1em" }}>
          <Grid item xs={5}>
            <TextField
              label={t("replace.before_string")}
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
              label={t("replace.after_string")}
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
            {t("replace.replace")}
          </Button>
        </Box>
      </Box>
      <Box sx={{ padding: "1em" }} id="replace-regexp-box">
        <Typography>
          {t("replace.regexp_per_tag")} <b>( .* )</b>
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
            {t("replace.replace")}
          </Button>
        </Box>
      </Box>
      <span style={{ padding: "1em" }}></span>
    </Paper>
  );
}
