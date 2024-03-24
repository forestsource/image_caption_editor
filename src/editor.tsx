import React, { useEffect, useContext, useCallback } from "react";

import { useNavigate, Link as RouterLink } from "react-router-dom";
import { FilterOptionsState } from "@mui/material";
import { useParams } from "react-router-dom";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Unstable_Grid2";
import TextField from "@mui/material/TextField";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Fab from "@mui/material/Fab";
import SaveIcon from "@mui/icons-material/Save";
import Pagination from "@mui/material/Pagination";
import Autocomplete, {
  AutocompleteChangeReason,
  AutocompleteChangeDetails,
} from "@mui/material/Autocomplete";
import { useHotkeys } from "react-hotkeys-hook";

import "./App.css";
import type { Dataset } from "./types";
import { DatasetsContext } from "./Contexts/DatasetsContext";
import { TagEditorContext } from "./Contexts/TagEditorContext";

// DnD
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
  closestCenter,
} from "@dnd-kit/core";

import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Margin } from "@mui/icons-material";

interface TagSuggestion {
  label: string;
  value: string;
}

interface SortableItemProps {
  id: string;
  label: string;
}

const INPUT_LENGTH_ENABLE_AUTOCOMPLETE = 2;

const tagSplitter = (tags: string): string[] => {
  if (tags === "") {
    return [];
  }
  return tags.split(",");
};

export function Editor() {
  const { state: datasetsState, dispatch: datasetsDispatch } =
    useContext(DatasetsContext);
  const { state: tagEditorState, dispatch: tagEditorDispatch } =
    useContext(TagEditorContext);
  const datasets = datasetsState.datasets;
  let tags = tagEditorState.currentTags;
  let { pageId } = useParams();
  let pageIndex: number = parseInt(pageId!);
  let dataset: Dataset = datasets[pageIndex];
  const [onSaveSuccess, setOnSaveSuccess] = React.useState(false);
  const [onSaveFailure, setOnSaveFailure] = React.useState(false);
  const [onPageInfo, setOnPageInfo] = React.useState(false);
  const [pageInfoMsg, setPageInfoMsg] = React.useState("");

  // Change tags when page changes
  useEffect(() => {
    tagEditorDispatch({
      type: "SET_TAGS",
      payload: tagSplitter(datasets[pageIndex].caption.content),
    });
  }, [pageIndex]);

  // TODO: make suggest from file
  const TagSuggestionTags = ["black", "white", "hat", ":D", "1girl", "smile"];

  const snackClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setOnSaveSuccess(false);
    setOnSaveFailure(false);
    setOnPageInfo(false);
  };

  /* For DnD */
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  });
  const sensors = useSensors(pointerSensor);
  function SortableItem({ id, label }: SortableItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <Chip
          ref={setNodeRef}
          style={style}
          variant="outlined"
          label={label}
          {...attributes}
          {...listeners}
          onDelete={onDeleteTag}
        ></Chip>
      </div>
    );
  }
  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over === null) {
        return;
      }
      console.info("active:", active, " over:", over);
      if (active.id !== over.id) {
        const oldIndex = tags
          .map((item) => {
            return item;
          })
          .indexOf(String(active.id));
        const newIndex = tags
          .map((item) => {
            return item;
          })
          .indexOf(String(over.id));
        const newState = arrayMove(tags, oldIndex, newIndex);
        tagEditorDispatch({ type: "SET_TAGS", payload: newState });
      }
    },
    [tags]
  );

  const onChangeTags = (
    event: React.SyntheticEvent,
    value: string[],
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<string> | undefined
  ) => {
    console.log("onChangeTags: ", value);
    datasets[pageIndex].caption.content = value.join(",");
    datasetsDispatch({ type: "SET_DATASETS", payload: datasets });
    tagEditorDispatch({ type: "SET_TAGS", payload: value });
  };
  const onDeleteTag = (event: React.MouseEvent) => {
    const target = event.currentTarget;
    const tag = target.parentElement?.textContent;
    console.debug("onDeleteTag: ", tag);
    const newTags = tags.filter((item) => item !== tag);
    datasets[pageIndex].caption.content = newTags.join(",");
    datasetsDispatch({ type: "SET_DATASETS", payload: datasets });
    tagEditorDispatch({ type: "SET_TAGS", payload: newTags });
  };
  const optionFilter = (
    options: string[],
    state: FilterOptionsState<string>
  ): string[] => {
    if (state.inputValue.length <= INPUT_LENGTH_ENABLE_AUTOCOMPLETE) {
      return [];
    }
    return options.filter((option) => option.includes(state.inputValue));
  };

  /* shortcut keys */
  useHotkeys("ctrl+Enter", () => onSaveCaption());
  useHotkeys("ctrl+ArrowRight", () => nextDataset());
  useHotkeys("ctrl+ArrowLeft", () => prevDataset());
  async function onSaveCaption() {
    const fileHandle = await dataset.dirHandle.getFileHandle(
      dataset.caption.name,
      { create: true }
    );
    const writable = await fileHandle.createWritable();
    const caption = tags.join(",");
    const result_write = await writable.write(caption);
    const result_close = await writable.close();
    if (result_write != null || result_close != null) {
      console.error("Caption cannot save");
      setOnSaveFailure(true);
      return;
    }
    setOnSaveSuccess(true);
    console.info(`onSave: ${dataset.caption.name}`);
  }

  /* page control */
  const navigate = useNavigate();
  const pageChange = (index: number) => {
    console.debug("pageChange: ", index);
    navigate(`/edit/${index}`, { state: { id: index } });
  };
  let nextDataset = () => {
    if (pageIndex + 1 < datasets.length) {
      pageIndex++;
      console.info(pageId);
      pageChange(pageIndex);
    } else {
      setPageInfoMsg("This page is last");
      setOnPageInfo(true);
    }
  };
  let prevDataset = () => {
    if (pageIndex - 1 > -1) {
      pageIndex--;
      pageChange(pageIndex);
    } else {
      setPageInfoMsg("This page is first");
      setOnPageInfo(true);
    }
  };
  const pageChenger = (event: React.ChangeEvent<unknown>, value: number) => {
    const index = value - 1;
    pageChange(index);
  };

  return (
    <Box>
      <Box sx={{ margin: "1rem" }}>
        <Breadcrumbs sx={{ maxHeight: "5%" }} aria-label="breadcrumb">
          <Typography>{datasets[pageIndex].image.name}</Typography>
        </Breadcrumbs>
        <Card>
          <CardMedia
            component="img"
            image={dataset.image.uri}
            sx={{ maxHeight: "40vh", mx: "auto", objectFit: "contain" }}
          />
          <CardContent>
            <Autocomplete
              freeSolo
              multiple
              filterOptions={optionFilter}
              filterSelectedOptions
              id="tag-field"
              value={tags}
              options={TagSuggestionTags}
              getOptionLabel={(option) => option}
              sx={{ maxHeight: 1 / 1, maxWidth: 1 / 1 }}
              renderInput={(params) => (
                <TextField {...params} label="Tags" variant="filled" />
              )}
              renderTags={(tagValue, getTagProps) => {
                return (
                  <DndContext
                    collisionDetection={closestCenter}
                    sensors={sensors}
                    onDragEnd={onDragEnd}
                  >
                    <SortableContext
                      items={tagValue}
                      strategy={rectSortingStrategy}
                    >
                      <>
                        {tagValue.map((tag, index) => (
                          <SortableItem
                            {...getTagProps({ index })}
                            key={tag}
                            id={tag}
                            label={tag}
                            data-dndkit-disabled-dnd-flag="true"
                          />
                        ))}
                      </>
                    </SortableContext>
                  </DndContext>
                );
              }}
              onChange={onChangeTags}
            ></Autocomplete>
            <Fab
              aria-label="save"
              color="primary"
              variant="extended"
              onClick={onSaveCaption}
              sx={{ margin: 1 }}
            >
              <SaveIcon sx={{ mr: 1 }} /> Save
            </Fab>
          </CardContent>
        </Card>
      </Box>
      <Box justifyContent="center" alignContent="center" display="flex">
        <Pagination
          count={datasets.length}
          page={pageIndex + 1}
          siblingCount={3}
          onChange={pageChenger}
        />
      </Box>
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
      <Snackbar
        open={onSaveFailure}
        autoHideDuration={3000}
        onClose={snackClose}
      >
        <Alert onClose={snackClose} severity="error" sx={{ width: "100%" }}>
          {" "}
          Save Failure
        </Alert>
      </Snackbar>
      <Snackbar open={onPageInfo} autoHideDuration={3000} onClose={snackClose}>
        <Alert onClose={snackClose} severity="info" sx={{ width: "100%" }}>
          {" "}
          {pageInfoMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
