import React, { useContext } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Fab from "@mui/material/Fab";
import SaveIcon from "@mui/icons-material/Save";
import Avatar from "@mui/material/Avatar";
import { useTranslation } from "react-i18next";

import { DatasetsContext } from "../Contexts/DatasetsContext";
import { NotificationsContext } from "../Contexts/NotificationsContext";
import { Severity as sv } from "../types";

interface TagChip {
  tagName: string;
  count: number;
}

const isValidRegex = (userInput: string): boolean => {
  try {
    new RegExp(userInput);
  } catch (e) {
    return false;
  }
  return true;
};

export function DeleteTags() {
  const { t } = useTranslation();
  const { state, dispatch } = useContext(DatasetsContext);
  const { dispatch: notificationsDispatch } = useContext(NotificationsContext);
  const datasets = state.datasets;
  const flatTags = datasets.flatMap((dataset) => dataset.caption.content);
  const allTags = (): TagChip[] => {
    const tags = flatTags.reduce((acc, tag) => {
      if (acc[tag] === undefined) {
        acc[tag] = 1;
      } else {
        acc[tag] += 1;
      }
      return acc;
    }, {} as { [key: string]: number });
    return Object.entries(tags)
      .map(([tagName, count]) => ({
        tagName,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  };
  const [filter, setFilter] = React.useState<string>("");

  const filterdTags = () => {
    if (filter === "" || filter === undefined) {
      return allTags();
    }
    if (!isValidRegex(filter)) {
      return [];
    }
    const regex = new RegExp(filter, "i");
    return allTags().filter((tag) => {
      return tag.tagName.match(regex);
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
    notificationsDispatch({
      type: "NOTIFY",
      payload: {
        open: true,
        msg: t("general.saved"),
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
        <TextField
          id="tag-filter"
          label={t("general.search")}
          variant="standard"
          onChange={(event) => setFilter(event.target.value)}
          sx={{ textAlign: "right" }}
        />
      </Box>
      <Box sx={{ margin: "1em", paddingBottom: "1em" }} id="allTagsBox">
        {filterdTags().map((tagChip, index) => (
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
    </Paper>
  );
}
