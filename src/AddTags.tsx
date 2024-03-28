import React, { useContext, useEffect } from "react";
import { FilterOptionsState } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Fab from "@mui/material/Fab";
import Autocomplete, {
  AutocompleteChangeReason,
  AutocompleteChangeDetails,
} from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import SaveIcon from "@mui/icons-material/Save";

import Papa from "papaparse";

import { DatasetsContext } from "./Contexts/DatasetsContext";
import { NotificationsContext } from "./Contexts/NotificationsContext";
import { Severity as sv, suggestionTags } from "./types";

const INPUT_LENGTH_ENABLE_AUTOCOMPLETE = 2;

export function AddTags() {
  const { state: notificationsState, dispatch: notificationsDispatch } =
    useContext(NotificationsContext);
  const { state: DataSetState, dispatch: DataSetDispatch } =
    useContext(DatasetsContext);
  const { state, dispatch } = useContext(DatasetsContext);
  const datasets = state.datasets;
  const [suggestionTags, setSuggestionTags] = React.useState<suggestionTags[]>(
    []
  );
  const [addTag, setAddTag] = React.useState<string>("");
  const [insertTo, setInsertTo] = React.useState<string>("prefix");

  useEffect(() => {
    loadSuggestionTags();
  }, []);

  async function loadSuggestionTags() {
    const response = await fetch(process.env.PUBLIC_URL + "/danbooru.csv");
    const csvData = await response.text();
    const parsedCsvData = Papa.parse(csvData, {
      header: false,
      dynamicTyping: false,
    });
    const results: string[][] = parsedCsvData.data as any[][];
    let suggestionTags: suggestionTags[] = [];
    results.forEach((result) => {
      let destabilizedTag: string[] = [];
      if (result[3] !== undefined) {
        destabilizedTag = result[3].split(",");
      }
      suggestionTags.push({
        normalizedTag: result[0],
        destabilizedTags: destabilizedTag,
      });
    });
    setSuggestionTags(suggestionTags);
  }

  /* Autocomplete filter */
  const optionFilter = (
    options: string[],
    state: FilterOptionsState<string>
  ): string[] => {
    if (state.inputValue.length <= INPUT_LENGTH_ENABLE_AUTOCOMPLETE) {
      return [];
    }
    let fuzzySearch = suggestionTags.filter((suggestionTag) => {
      return suggestionTag.destabilizedTags.includes(state.inputValue);
    });
    let partialMatch = suggestionTags.filter((suggestionTag) => {
      return suggestionTag.normalizedTag.includes(state.inputValue);
    });
    let result = fuzzySearch.concat(partialMatch);
    return result.map((suggestionTag) => suggestionTag.normalizedTag);
  };

  const onSaveCaption = () => {
    datasets.forEach((dataset) => {
      dispatch({ type: "SAVE_CAPTION", payload: dataset });
    });
    notificationsDispatch({
      type: "NOTIFY",
      payload: { open: true, msg: "Saved", severity: sv.SUCCESS },
    });
  };

  const onChangeTag = (
    event: React.SyntheticEvent,
    value: string | null,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<string> | undefined
  ) => {
    console.debug("onChangeTag: ", value);
    setAddTag(value || "");
  };

  const handleInsertToChange = (event: SelectChangeEvent<string>) => {
    setInsertTo(event.target.value);
  };

  const handleAdd = () => {
    // addTag を 全てのデータセットに追加
    datasets.forEach((dataset) => {
      if (insertTo === "prefix") {
        dataset.caption.content = [addTag].concat(dataset.caption.content);
      } else {
        dataset.caption.content = dataset.caption.content.concat([addTag]);
      }
    });
    console.debug("handleAdd: ", addTag);
    DataSetDispatch({ type: "SET_DATASETS", payload: datasets });
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
        <Box sx={{ padding: "1em" }}>
          <Autocomplete
            disablePortal
            freeSolo
            filterOptions={optionFilter}
            options={[]}
            onChange={onChangeTag}
            renderInput={(params) => (
              <TextField {...params} label="Tag" value={addTag} />
            )}
          />
        </Box>
        <Box sx={{ padding: "1em" }}>
          <InputLabel id="Insert-to-label">Insert to...</InputLabel>
          <Select
            labelId="Insert-to-label"
            id="Insert-to-select"
            value={insertTo}
            label="Insert to"
            onChange={handleInsertToChange}
          >
            <MenuItem value={"prefix"}>Prefix</MenuItem>
            <MenuItem value={"suffix"}>Suffix</MenuItem>
          </Select>
          <Button
            sx={{ marginLeft: "2em" }}
            variant="outlined"
            disabled={addTag === ""}
            onClick={handleAdd}
          >
            Add Tag
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
