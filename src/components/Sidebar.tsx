import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ListIcon from "@mui/icons-material/List";
import Divider from "@mui/material/Divider";
import SettingsIcon from "@mui/icons-material/Settings";
import BurstModeIcon from "@mui/icons-material/BurstMode";
import BugReportIcon from "@mui/icons-material/BugReport";
import { useTranslation } from "react-i18next";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

import { DatasetsContext } from "../Contexts/DatasetsContext";
import { NotificationsContext } from "../Contexts/NotificationsContext";
import { Severity as sv } from "../types";
import { loadDatasetFolder } from "../utils/DatasetUtil";
import { DirectoryLoadError, InvalidFileTypeError } from "../Errors";

const DRAWER_WIDTH = 3 / 12;

export function Sidebar() {
  const { t } = useTranslation();
  const { state, dispatch } = useContext(DatasetsContext);
  const { dispatch: notificationsDispatch } = useContext(NotificationsContext);
  const datasets = state.datasets;

  async function loadDataset() {
    let datasets = [];
    try {
      datasets = await loadDatasetFolder();
    } catch (e) {
      if (e instanceof DirectoryLoadError) {
        notificationsDispatch({
          type: "NOTIFY",
          payload: {
            open: true,
            msg: t("dataset.no_picked"),
            severity: sv.WARNING,
          },
        });
        return;
      } else if (e instanceof InvalidFileTypeError) {
        notificationsDispatch({
          type: "NOTIFY",
          payload: {
            open: true,
            msg: t("dataset.wrong_type"),
            severity: sv.ERROR,
          },
        });
        return;
      } else {
        if (e instanceof Error) {
          console.error(e);
          console.error(e.name);
          console.error(`${typeof e} ${Object.prototype.toString.call(e)}`);
        }
        return notificationsDispatch({
          type: "NOTIFY",
          payload: {
            open: true,
            msg: t("dataset.unknown_error"),
            severity: sv.ERROR,
          },
        });
      }
    }
    console.debug("SET_DATASETS: ", datasets);
    if (datasets.length === 0) {
      return notificationsDispatch({
        type: "NOTIFY",
        payload: {
          open: true,
          msg: t("dataset.no_images"),
          severity: sv.WARNING,
        },
      });
    }
    dispatch({ type: "SET_DATASETS", payload: datasets });
  }

  const navigate = useNavigate();
  const pageChange = (index: number) => {
    console.debug("pageChange: ", index);
    navigate(`/edit/${index}`, { state: { id: index } });
  };

  const openIssuePage = () => {
    window.open(
      "https://github.com/forestsource/image_caption_editor/issues",
      "_blank"
    );
  };

  return (
    <Box id="sidebar-box">
      <Drawer
        id="sidebar-drawer"
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            minWidth: "50px",
            boxSizing: "border-box",
          },
        }}
      >
        <List id="sidebar-list">
          <ListItem disablePadding onClick={loadDataset}>
            <ListItemButton>
              <ListItemIcon>
                <AddPhotoAlternateIcon />
              </ListItemIcon>
              <ListItemText primary={t("sidebar.load_dataset")} />
            </ListItemButton>
          </ListItem>
          <ListItem
            disablePadding
            onClick={() => {
              navigate("/");
            }}
          >
            <ListItemButton>
              <ListItemIcon>
                <ListIcon />
              </ListItemIcon>
              <ListItemText primary={t("sidebar.list")} />
            </ListItemButton>
          </ListItem>
          <ListItem
            disablePadding
            onClick={() => {
              navigate("/batchEdit");
            }}
          >
            <ListItemButton>
              <ListItemIcon>
                <BurstModeIcon />
              </ListItemIcon>
              <ListItemText primary={t("sidebar.batch_edit")} />
            </ListItemButton>
          </ListItem>
          <ListItem
            disablePadding
            onClick={() => {
              navigate("/settings");
            }}
          >
            <ListItemButton>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary={t("sidebar.settings")} />
            </ListItemButton>
          </ListItem>
        </List>
        <ListItem disablePadding onClick={openIssuePage}>
          <ListItemButton>
            <ListItemIcon>
              <BugReportIcon />
            </ListItemIcon>
            <ListItemText primary={t("sidebar.report")}></ListItemText>
          </ListItemButton>
        </ListItem>
        <Divider />

        <ImageList sx={{ maxHeight: "80vh" }} cols={2} gap={4}>
          {datasets.map((dataset, index) => (
            <ImageListItem
              key={dataset.image.uri}
              sx={{
                transition: "transform 0.3s",
                "&:hover": {
                  opacity: [0.9, 0.8, 0.7],
                  boxShadow: 2,
                  cursor: "pointer",
                  transform: "scale(1.05)",
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
      </Drawer>
    </Box>
  );
}
