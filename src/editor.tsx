import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  ReactElement,
} from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Button } from "@mui/material";
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
import ClearIcon from "@mui/icons-material/Clear";
import Pagination from "@mui/material/Pagination";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import Autocomplete, {
  AutocompleteChangeReason,
  AutocompleteChangeDetails,
} from "@mui/material/Autocomplete";
import { useHotkeys } from "react-hotkeys-hook";

import "./App.css";
import type { Dataset } from "./types";
import { DatasetsContext } from "./App";

// DnD
import {
  DndContext,
  UniqueIdentifier,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragStartEvent,
  DragEndEvent,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TagSuggestion {
  label: string;
  value: string;
}

interface SortableItemProps {
  id: string;
  children: ReactElement;
}

export function Editor() {
  const navigate = useNavigate();
  const { datasets, setDatasets } = useContext(DatasetsContext);
  let { pageId } = useParams();
  let pageIndex: number = parseInt(pageId!);
  // const [pageIndex, setPageIndex] = useState<number>(pageId);
  let dataset: Dataset = datasets[pageIndex];
  const [onSaveSuccess, setOnSaveSuccess] = React.useState(false);
  const [onSaveFailure, setOnSaveFailure] = React.useState(false);
  const [onPageInfo, setOnPageInfo] = React.useState(false);
  const [pageInfoMsg, setPageInfoMsg] = React.useState("");

  // TODO: make suggest from file
  const TagSuggestionTags = ["black", "white", "hat", ":D", "1girl", "smile"];

  // Initialize tags
  // let original_tags: Tag[] = raw_tags.map((tag, index) =>{return {id: index, name: tag}});
  // const [tags, setTags] = React.useState(original_tags);
  let [tags, setTags] = React.useState<string[]>(
    dataset.caption.content.split(",")
  );

  const snackClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setOnSaveSuccess(false);
    setOnSaveFailure(false);
    setOnPageInfo(false);
  };

  // DnD
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  function SortableItem({ id, children }: SortableItemProps) {
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
          {...attributes}
          {...listeners}
          label={children.props.label}
        ></Chip>
        <ClearIcon />
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
        setTags(newState);
      }
    },
    [tags]
  );

  // form control
  const onChange = (
    event: React.SyntheticEvent,
    value: string[],
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<string> | undefined
  ) => {
    console.log("onChange: ", value);
    setTags(value);
    datasets[pageIndex].caption.content = value.join(",");
    setDatasets(datasets);
  };

  // shortcut settings
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
    // FIXME: Check the return value type.
    if (result_write != null || result_close != null) {
      console.error("Caption cannot save");
      setOnSaveFailure(true);
      return;
    }
    setOnSaveSuccess(true);
    console.info(`onSave: ${dataset.caption.name}`);
  }
  const pageChange = (index: number) => {
    setTags(datasets[index].caption.content.split(","));
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
    pageChange(pageIndex);
  };
  const pageChengerByImage = (event: MouseEvent, value: number) => {
    pageChange(pageIndex);
  };

  return (
    <>
      <Box sx={{ maxHeight: "100vh", backgroundColor: "background.default" }}>
        <Breadcrumbs sx={{ maxHeight: "5%" }} aria-label="breadcrumb">
          <Link to="/" component={RouterLink} underline="hover" color="inherit">
            <Typography>Top</Typography>
          </Link>
          <Typography>{`image${pageIndex + 1}`}</Typography>
        </Breadcrumbs>
        <Grid container spacing={1}>
          <Grid xs={2}>
            <Card>
              <ImageList sx={{ maxHeight: "80vh" }} cols={2} gap={4}>
                {datasets.map((dataset, index) => (
                  <ImageListItem
                    key={dataset.image.uri}
                    sx={{
                      "&:hover": {
                        // backgroundColor: 'primary.main',
                        opacity: [0.9, 0.8, 0.7],
                        boxShadow: 2,
                        cursor: "pointer",
                      },
                    }}
                  >
                    <img
                      src={dataset.image.uri}
                      srcSet={dataset.image.uri}
                      alt={dataset.image.name}
                      loading="lazy"
                      onClick={() => {
                        pageChange(index);
                      }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Card>
          </Grid>
          <Grid xs={10}>
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
                              <SortableItem key={tag} id={tag}>
                                <Chip
                                  label={tag}
                                  {...getTagProps({ index })}
                                ></Chip>
                              </SortableItem>
                            ))}
                          </>
                        </SortableContext>
                      </DndContext>
                    );
                  }}
                  onChange={onChange}
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
          </Grid>
        </Grid>
        <Box justifyContent="center" alignContent="center" display="flex">
          <Pagination
            count={datasets.length}
            page={pageIndex + 1}
            onChange={pageChenger}
          />
        </Box>
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
    </>
  );
}
