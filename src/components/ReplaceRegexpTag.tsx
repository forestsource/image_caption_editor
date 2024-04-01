import React from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { processStringWithRegexp, isValidRegex } from "../utils/RegexpUtil";

import { Dataset } from "../types";

interface ReplaceRegexpTagProps {
  datasets: Dataset[];
  updateDataset: (datasets: Dataset[]) => void;
}

export function ReplaceRegexpTag({
  datasets,
  updateDataset,
}: ReplaceRegexpTagProps) {
  const { t } = useTranslation();
  const [regexpString, setRegexpString] = React.useState("");
  const [regexpError, setRegexpError] = React.useState(false);

  const replaceRegexpPerTag = () => {
    datasets.forEach((dataset) => {
      const newCaptionContent = dataset.caption.content.map((tag: string) => {
        let result = "";
        try {
          result = processStringWithRegexp(tag, regexpString);
        } catch {
          console.info("regexp is invalid: ", regexpString);
          return tag;
        }
        return result;
      });
      dataset.caption.content = newCaptionContent;
    });
    updateDataset(datasets);
  };

  const handleReplaceString = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRegexpString(e.target.value);
    if (isValidRegex(val)) {
      setRegexpError(false);
      return;
    }
    setRegexpError(true);
  };

  return (
    <Box sx={{ padding: "1em" }} id="replace-regexp-box">
      <Typography>
        {t("replace.regexp_per_tag")} <b>( .* )</b>
      </Typography>
      <TextField
        label="regexp"
        sx={{ paddingTop: "1em", width: "100%" }}
        value={regexpString}
        error={regexpError}
        helperText={regexpError ? t("replace.regexp_helper") : ""}
        onChange={handleReplaceString}
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
  );
}
