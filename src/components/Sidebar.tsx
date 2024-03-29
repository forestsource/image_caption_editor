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
import FileUploadIcon from "@mui/icons-material/FileUpload";
import SettingsIcon from "@mui/icons-material/Settings";
import BurstModeIcon from "@mui/icons-material/BurstMode";
import { useTranslation } from "react-i18next";

import { DatasetsContext } from "../Contexts/DatasetsContext";
import { NotificationsContext } from "../Contexts/NotificationsContext";
import { Severity as sv } from "../types";
import { createDataset } from "../DatasetUtil";

const DRAWER_WIDTH = 3 / 12;

export function Sidebar() {
  const { t } = useTranslation();
  const { state, dispatch } = useContext(DatasetsContext);
  const { dispatch: notificationsDispatch } = useContext(NotificationsContext);
  const datasets = state.datasets;

  async function verifyPermission() {
    console.debug("verifyPermission");
    let dirHandle = null;
    try {
      dirHandle = await window.showDirectoryPicker({ mode: "readwrite" });
    } catch (e) {
      console.info("Cancel directory pickup", e);
    }
    if (dirHandle === undefined || dirHandle === null) {
      console.info("Cancel directory pickup");
      notificationsDispatch({
        type: "NOTIFY",
        payload: {
          open: true,
          msg: t("sidebar.no_picked"),
          severity: sv.WARNING,
        },
      });
      return;
    }
    const datasets = await createDataset(dirHandle);
    dispatch({ type: "SET_DATASETS", payload: datasets });
  }

  const navigate = useNavigate();
  const pageChange = (index: number) => {
    console.debug("pageChange: ", index);
    navigate(`/edit/${index}`, { state: { id: index } });
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
          <ListItem disablePadding onClick={verifyPermission}>
            <ListItemButton>
              <ListItemIcon>
                <FileUploadIcon />
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
