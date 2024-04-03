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
import { useTranslation } from "react-i18next";

import { DatasetsContext } from "../Contexts/DatasetsContext";
import { NotificationsContext } from "../Contexts/NotificationsContext";
import { SettingsContext } from "../Contexts/SettingsContext";
import { Severity as sv, suggestionTags } from "../types";
import { loadSuggestionTags, searchIncludeComplement } from "../utils/TagUtils";
import { removeDuplicate } from "../utils/DatasetUtil";

const INPUT_LENGTH_ENABLE_AUTOCOMPLETE = 2;

export function AddTags() {
  const { t } = useTranslation();
  const { dispatch: notificationsDispatch } = useContext(NotificationsContext);
  const { dispatch: DataSetDispatch } = useContext(DatasetsContext);
  const { state, dispatch } = useContext(DatasetsContext);
  const { state: settingsState } = useContext(SettingsContext);
  const datasets = state.datasets;
  const [suggestionTags, setSuggestionTags] = React.useState<suggestionTags[]>(
    []
  );
  const [addTag, setAddTag] = React.useState<string>("");
  const [insertTo, setInsertTo] = React.useState<string>("prefix");

  useEffect(() => {
    fetchSuggestionTags();
  }, []);

  async function fetchSuggestionTags() {
    const suggestionTags = await loadSuggestionTags(
      settingsState.setting.tagStyle
    );
    setSuggestionTags(suggestionTags);
  }

  /* Autocomplete filter */
  const optionFilter = (
    _options: string[],
    state: FilterOptionsState<string>
  ): string[] => {
    if (state.inputValue.length <= INPUT_LENGTH_ENABLE_AUTOCOMPLETE) {
      return [];
    }
    return searchIncludeComplement(suggestionTags, state.inputValue);
  };

  const onSaveCaption = () => {
    datasets.forEach((dataset) => {
      dispatch({ type: "SAVE_CAPTION", payload: dataset });
    });
    notificationsDispatch({
      type: "NOTIFY",
      payload: { open: true, msg: t("general.saved"), severity: sv.SUCCESS },
    });
  };

  const onChangeTag = (
    _event: React.SyntheticEvent,
    value: string | null,
    _reason: AutocompleteChangeReason,
    _details?: AutocompleteChangeDetails<string> | undefined
  ) => {
    console.debug("onChangeTag: ", value);
    setAddTag(value || "");
  };

  const handleInsertToChange = (event: SelectChangeEvent<string>) => {
    setInsertTo(event.target.value);
  };

  const handleAdd = () => {
    datasets.forEach((dataset) => {
      if (insertTo === "prefix") {
        dataset.caption.content = [addTag].concat(dataset.caption.content);
      } else {
        dataset.caption.content = dataset.caption.content.concat([addTag]);
      }
    });
    console.debug("handleAdd: ", addTag);
    DataSetDispatch({ type: "SET_DATASETS", payload: removeDuplicate(datasets) });
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
        <Box sx={{ padding: "1em" }}>
          <Autocomplete
            disablePortal
            freeSolo
            filterOptions={optionFilter}
            options={[]}
            onChange={onChangeTag}
            renderInput={(params) => (
              <TextField {...params} label={t("general.tag")} value={addTag} />
            )}
          />
        </Box>
        <Box sx={{ padding: "1em" }}>
          <InputLabel id="Insert-to-label">{t("add_tag.insert_to")}</InputLabel>
          <Select
            labelId="Insert-to-label"
            id="Insert-to-select"
            value={insertTo}
            label={t("add_tag.insert_to")}
            onChange={handleInsertToChange}
          >
            <MenuItem value={"prefix"}>{t("general.prefix")}</MenuItem>
            <MenuItem value={"suffix"}>{t("general.suffix")}</MenuItem>
          </Select>
          <Button
            sx={{ marginLeft: "2em" }}
            variant="outlined"
            disabled={addTag === ""}
            onClick={handleAdd}
          >
            {t("add_tag.add_tag_btn")}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
