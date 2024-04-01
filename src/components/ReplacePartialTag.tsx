import React, { useContext } from "react";
import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import Autocomplete, {
  AutocompleteChangeReason,
  AutocompleteChangeDetails,
} from "@mui/material/Autocomplete";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AbcIcon from "@mui/icons-material/Abc";
import { useTranslation } from "react-i18next";

import { flatTags } from "../utils/DatasetUtil";
import { Dataset } from "../types";

interface ReplacePartialTagProps {
  datasets: Dataset[];
  updateDataset: (datasets: Dataset[]) => void;
}

export function ReplacePartialTag({
  datasets,
  updateDataset,
}: ReplacePartialTagProps) {
  const { t } = useTranslation();
  const [selectedPartialTag, setSelectedPartialTag] = React.useState("");
  const [beforeStringPartialTag, setBeforeStringPartialTag] =
    React.useState("");
  const [afterStringPartialTag, setAfterStringPartialTag] = React.useState("");
  const allTags = Array.from(new Set(flatTags(datasets)));

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
    setBeforeStringPartialTag("");
    setAfterStringPartialTag("");
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
    updateDataset(datasets);
  };

  return (
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
  );
}
