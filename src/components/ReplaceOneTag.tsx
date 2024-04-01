import React, { useContext } from "react";
import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import Autocomplete, {
  AutocompleteChangeReason,
  AutocompleteChangeDetails,
} from "@mui/material/Autocomplete";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SellIcon from "@mui/icons-material/Sell";
import { useTranslation } from "react-i18next";
import { DatasetsContext } from "../Contexts/DatasetsContext";
import { Dataset } from "../types";

interface ReplaceRegexpTagProps {
  datasets: Dataset[];
  updateDataset: (datasets: Dataset[]) => void;
}

export function ReplaceOneTag({
  datasets,
  updateDataset,
}: ReplaceRegexpTagProps) {
  const { t } = useTranslation();
  const [beforeTag, setBeforeTag] = React.useState("");
  const [afterTag, setAfterTag] = React.useState("");
  const flatTags = datasets.flatMap((dataset) => dataset.caption.content);
  const allTags = Array.from(new Set(flatTags));

  const replaceATag = () => {
    datasets.forEach((dataset) => {
      const newCaptionContent = dataset.caption.content.map((tag) => {
        if (tag === beforeTag) {
          return afterTag;
        }
        return tag;
      });
      dataset.caption.content = newCaptionContent;
    });
    updateDataset(datasets);
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

  return (
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
  );
}
