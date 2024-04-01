import React, { useEffect, useContext, useCallback } from "react";
import { FilterOptionsState } from "@mui/material";
import { useParams } from "react-router-dom";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Fab from "@mui/material/Fab";
import SaveIcon from "@mui/icons-material/Save";
import Pagination from "@mui/material/Pagination";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Autocomplete, {
  AutocompleteChangeReason,
  AutocompleteChangeDetails,
} from "@mui/material/Autocomplete";
import { useTranslation } from "react-i18next";
import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate } from "react-router-dom";

import type { Dataset, Image, Caption, suggestionTags } from "../types";
import { DatasetsContext } from "../Contexts/DatasetsContext";
import { TagEditorContext } from "../Contexts/TagEditorContext";
import { NotificationsContext } from "../Contexts/NotificationsContext";
import { Severity as sv } from "../types";
import { loadSuggestionTags, searchIncludeComplement } from "../utils/TagUtils";
import { Replacer } from "../components/Replacer";

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
  const { t } = useTranslation();
  const { state: datasetsState, dispatch: datasetsDispatch } =
    useContext(DatasetsContext);
  const { state: tagEditorState, dispatch: tagEditorDispatch } =
    useContext(TagEditorContext);
  const { dispatch: notificationsDispatch } = useContext(NotificationsContext);
  const datasets = datasetsState.datasets;
  const tags = tagEditorState.currentTags;
  const { pageId } = useParams();
  let pageIndex: number = parseInt(pageId!);
  const dataset = () => {
    let dataset: Dataset;
    if (datasets.length === 0) {
      dataset = {
        name: t("editor.no_dataset"),
        image: { uri: "" } as Image,
        caption: { name: "", uri: "", content: [] } as Caption,
      } as Dataset;
    } else {
      dataset = datasets[pageIndex];
    }
    return dataset;
  };
  const [suggestionTags, setSuggestionTags] = React.useState<suggestionTags[]>(
    []
  );

  useEffect(() => {
    fetchSuggestionTags();
  }, []);

  useEffect(() => {
    tagEditorDispatch({
      type: "SET_TAGS",
      payload: dataset().caption.content,
    });
  }, [pageIndex, datasets]);

  async function fetchSuggestionTags() {
    const suggestionTags = await loadSuggestionTags();
    setSuggestionTags(suggestionTags);
  }

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
          sx={{
            margin: "0.1em",
            transition: "transform 0.3s",
            "&:hover": {
              cursor: "pointer",
              opacity: [0.1, 0.1, 0.9],
              color: "#e91e63",
            },
          }}
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

  /* handlers */
  const onChangeTags = (
    _event: React.SyntheticEvent,
    value: string[],
    _reason: AutocompleteChangeReason,
    _details?: AutocompleteChangeDetails<string> | undefined
  ) => {
    console.log("onChangeTags: ", value);
    dataset().caption.content = value;
    datasetsDispatch({ type: "SET_DATASETS", payload: datasets });
    tagEditorDispatch({ type: "SET_TAGS", payload: value });
  };
  const onDeleteTag = (event: React.MouseEvent) => {
    const target = event.currentTarget;
    const tag = target.parentElement?.textContent;
    console.debug("onDeleteTag: ", tag);
    const newTags = tags.filter((item) => item !== tag);
    dataset().caption.content = newTags;
    datasetsDispatch({ type: "SET_DATASETS", payload: datasets });
    tagEditorDispatch({ type: "SET_TAGS", payload: newTags });
  };
  async function onSaveCaption() {
    datasetsDispatch({ type: "SAVE_CAPTION", payload: dataset() });
    notificationsDispatch({
      type: "NOTIFY",
      payload: { open: true, msg: t("general.saved"), severity: sv.SUCCESS },
    });
    console.info(`onSave: ${dataset().caption.name}`);
  }
  const optionFilter = (
    _options: string[],
    state: FilterOptionsState<string>
  ): string[] => {
    if (state.inputValue.length <= INPUT_LENGTH_ENABLE_AUTOCOMPLETE) {
      return [];
    }
    return searchIncludeComplement(suggestionTags, state.inputValue);
  };
  const pageChenger = (event: React.ChangeEvent<unknown>, value: number) => {
    const index = value - 1;
    pageChange(index);
  };

  /* shortcut keys */
  useHotkeys("ctrl+Enter", () => onSaveCaption());
  useHotkeys("ctrl+ArrowRight", () => nextDataset());
  useHotkeys("ctrl+ArrowLeft", () => prevDataset());

  /* page control */
  const navigate = useNavigate();
  const pageChange = (index: number) => {
    console.debug("pageChange: ", index);
    navigate(`/edit/${index}`, { state: { id: index } });
  };
  const nextDataset = () => {
    if (pageIndex + 1 < datasets.length) {
      pageIndex++;
      console.info(pageId);
      pageChange(pageIndex);
    } else {
      notificationsDispatch({
        type: "NOTIFY",
        payload: {
          open: true,
          msg: t("editor.msg.page_last"),
          severity: sv.INFO,
        },
      });
    }
  };
  const prevDataset = () => {
    if (pageIndex - 1 > -1) {
      pageIndex--;
      pageChange(pageIndex);
    } else {
      notificationsDispatch({
        type: "NOTIFY",
        payload: {
          open: true,
          msg: t("editor.msg.page_first"),
          severity: sv.INFO,
        },
      });
    }
  };

  return (
    <Box>
      <Box sx={{ margin: "1rem" }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "1em" }}>
          <Typography>{dataset().name}</Typography>
        </Breadcrumbs>
        <Card>
          <CardMedia
            component="img"
            image={dataset().image.uri}
            sx={{
              minHeight: "40vh",
              maxHeight: "40vh",
              mx: "auto",
              objectFit: "contain",
            }}
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
                <TextField
                  {...params}
                  label={t("general.tags")}
                  variant="filled"
                />
              )}
              onChange={onChangeTags}
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
            ></Autocomplete>
            <Box>
              <Accordion>
                <AccordionSummary
                  id="accordion-header"
                  aria-controls="accordion-content"
                >
                  {t("general.advanced")}
                </AccordionSummary>
                <AccordionDetails>
                  <Replacer currentPage={pageIndex} />
                </AccordionDetails>
              </Accordion>
            </Box>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{ margin: "1em" }}
            >
              <Fab
                aria-label="save"
                color="primary"
                variant="extended"
                onClick={onSaveCaption}
              >
                <SaveIcon sx={{ mr: 1 }} /> {t("general.save")}
              </Fab>
            </Box>
          </CardContent>
        </Card>
      </Box>
      <Box
        id="pagination-box"
        justifyContent="center"
        display="flex"
        sx={{ position: "fixed", bottom: "1em", width: "80%" }}
      >
        <Pagination
          count={datasets.length}
          page={pageIndex + 1}
          siblingCount={3}
          onChange={pageChenger}
        />
      </Box>
    </Box>
  );
}
