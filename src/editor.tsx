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
import TextField from "@mui/material/TextField";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Fab from "@mui/material/Fab";
import SaveIcon from "@mui/icons-material/Save";
import Pagination from "@mui/material/Pagination";
import Autocomplete, {
  AutocompleteChangeReason,
  AutocompleteChangeDetails,
} from "@mui/material/Autocomplete";
import { useHotkeys } from "react-hotkeys-hook";
import Papa from "papaparse";

import "./App.css";
import type { Dataset, suggestionTags } from "./types";
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

interface SortableItemProps {
  id: string;
  label: string;
}

const INPUT_LENGTH_ENABLE_AUTOCOMPLETE = 2;

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
  const [suggestionTags, setSuggestionTags] = React.useState<suggestionTags[]>(
    []
  );
  loadSuggestionTags();

  // Change tags when page changes
  useEffect(() => {
    tagEditorDispatch({
      type: "SET_TAGS",
      payload: datasets[pageIndex].caption.content,
    });
  }, [pageIndex]);

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
      distance: 7,
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
          color="primary"
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
    datasets[pageIndex].caption.content = value;
    datasetsDispatch({ type: "SET_DATASETS", payload: datasets });
    tagEditorDispatch({ type: "SET_TAGS", payload: value });
  };
  const onDeleteTag = (event: React.MouseEvent) => {
    const target = event.currentTarget;
    const tag = target.parentElement?.textContent;
    console.debug("onDeleteTag: ", tag);
    const newTags = tags.filter((item) => item !== tag);
    datasets[pageIndex].caption.content = newTags;
    datasetsDispatch({ type: "SET_DATASETS", payload: datasets });
    tagEditorDispatch({ type: "SET_TAGS", payload: newTags });
  };

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

  /* shortcut keys */
  useHotkeys("ctrl+Enter", () => onSaveCaption());
  useHotkeys("ctrl+ArrowRight", () => nextDataset());
  useHotkeys("ctrl+ArrowLeft", () => prevDataset());
  async function onSaveCaption() {
    datasetsDispatch({ type: "SAVE_CAPTION", payload: dataset });
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
        <Breadcrumbs aria-label="breadcrumb">
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
              options={[]}
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
