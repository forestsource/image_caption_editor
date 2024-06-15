import React, { useContext } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Fab from "@mui/material/Fab";
import SaveIcon from "@mui/icons-material/Save";
import Avatar from "@mui/material/Avatar";
import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";

import { DatasetsContext } from "../Contexts/DatasetsContext";
import { NotificationsContext } from "../Contexts/NotificationsContext";
import { Severity as sv } from "../types";
import { tagCount, filterdTags } from "../utils/TagUtils";

interface TagChip {
  tagName: string;
  count: number;
}

export function DeleteTags() {
  const { t } = useTranslation();
  const { state, dispatch } = useContext(DatasetsContext);
  const { dispatch: notificationsDispatch } = useContext(NotificationsContext);
  const [filter, setFilter] = React.useState<string>("");
  const datasets = state.datasets;
  const flatTags = datasets.flatMap((dataset) => dataset.caption.content);

  const allTagChips = (): TagChip[] => {
    console.debug("filter:", filter);
    const tags = tagCount(filterdTags(filter, flatTags));
    return Object.entries(tags)
      .map(([tagName, count]) => ({
        tagName,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  };

  const handleDelete = (tag: string) => () => {
    dispatch({ type: "REMOVE_CAPTION_TAG", payload: tag });
    console.debug("delete tag: ", datasets[0].caption.content);
  };
  const onSaveCaption = () => {
    datasets.forEach((dataset) => {
      dispatch({ type: "SAVE_CAPTION", payload: dataset });
    });
    notificationsDispatch({
      type: "NOTIFY",
      payload: {
        open: true,
        msg: t("general.saved"),
        severity: sv.SUCCESS,
      },
    });
  };

  const deleteDuplicateTags = () => {
    datasets.forEach(() => {
      dispatch({ type: "REMOVE_DUPLICATE_TAGS", payload: "" });
    });
    notificationsDispatch({
      type: "NOTIFY",
      payload: {
        open: true,
        msg: t("delete_tag.del_duplicate"),
        severity: sv.SUCCESS,
      },
    });
  };

  return (
    <Paper elevation={3} sx={{ margin: "1em" }}>
      <Box
        sx={{
          margin: "1em",
        }}
      >
        <Box sx={{ paddingTop: "1em" }}>
          <Fab
            aria-label="save"
            color="primary"
            variant="extended"
            onClick={onSaveCaption}
          >
            <SaveIcon sx={{ mr: 1 }} /> {t("general.save_all")}
          </Fab>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
          <Box sx={{ textAlign: "left" }}>
            <TextField
              id="tag-filter"
              label={t("general.search")}
              variant="standard"
              onChange={(event) => setFilter(event.target.value)}
            />
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Button onClick={deleteDuplicateTags}>{t("delete_tag.del_duplicate")}</Button>
          </Box>
        </Box>
        <Box sx={{ margin: "1em", paddingBottom: "1em" }} id="allTagsBox">
          {allTagChips().map((tagChip, index) => (
            <Chip
              key={index}
              label={tagChip.tagName}
              color={"primary"}
              variant="outlined"
              avatar={<Avatar>{tagChip.count}</Avatar>}
              sx={{ margin: "0.3em" }}
              onDelete={handleDelete(tagChip.tagName)}
            />
          ))}
        </Box>
      </Box>
    </Paper>
  );
}
