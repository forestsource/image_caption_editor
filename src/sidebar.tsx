import { Drawer, Button } from "@mui/material";
import React, { useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/Inbox";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";

import { tagsFromString } from "./tags";
import { get as IDAget, set as IDAset } from "idb-keyval";
import type { Image, Caption, Dataset } from "./types";
import { DatasetsContext } from "./App";

const drawerWidth = 3 / 12;

export function Sidebar() {
  const { datasets, setDatasets } = useContext(DatasetsContext);
  let [tags, setTags] = React.useState<string[]>([]);

  async function verifyPermission() {
    console.debug("verifyPermission");
    let dirHandle = await IDAget("dir");
    if (dirHandle != undefined) {
      let permission = await dirHandle.queryPermission({ mode: "readwrite" });
      if (permission !== "granted") {
        permission = await dirHandle.requestPermission({ mode: "readwrite" });
        if (permission !== "granted") {
          dirHandle = await window.showDirectoryPicker({ mode: "readwrite" });
        }
      }
    } else {
      dirHandle = await window.showDirectoryPicker({ mode: "readwrite" });
    }
    await createDataset(dirHandle);
    // await IDAset("dir", dirHandle);
  }

  async function createDataset(dirHandle: FileSystemDirectoryHandle) {
    console.debug("createDataset");
    let datasets: Dataset[] = [];
    let images: Image[] = [];
    let captions: Caption[] = [];
    for await (const [key, value] of dirHandle.entries()) {
      const fh = dirHandle.getFileHandle(value.name);
      const name = (await fh).name;
      const file: File = await (await fh).getFile();
      const file_uri: string = window.URL.createObjectURL(file);
      // file type が png/jpg/jiff/gif/webp なら画像として扱う
      if (
        file.type == "image/png" ||
        file.type == "image/jpeg" ||
        file.type == "image/jiff" ||
        file.type == "image/gif" ||
        file.type == "image/webp"
      ) {
        const image: Image = { name: value.name, uri: file_uri };
        images.push(image);
      }
      if (file.type == "text/plain") {
        const caption: Caption = {
          name: value.name,
          uri: file_uri,
          content: await file.text(),
        };
        captions.push(caption);
      }
    }
    for await (const image of images) {
      const caption = captions.find((caption) => caption.name === image.name);
      if (caption) {
        datasets.push({ name: image.name, image, caption, dirHandle });
      } else {
        console.info("caption not found for image", image);
        const caption: Caption = { name: image.name, uri: "", content: "" };
        datasets.push({ name: image.name, image, caption, dirHandle });
      }
    }
    console.debug("datasets:", datasets);
    setDatasets(datasets);
  }

  const navigate = useNavigate();
  let { pageId } = useParams();
  let pageIndex: number = parseInt(pageId!);
  let dataset: Dataset = datasets[pageIndex];
  const pageChange = (index: number) => {
    console.debug("pageChange: ", index);
    setTags(tagsFromString(datasets[index].caption.content));
    navigate(`/edit/${index}`, { state: { id: index } });
  };
  const pageChenger = (event: React.ChangeEvent<unknown>, value: number) => {
    const index = value - 1;
    pageChange(pageIndex);
  };

  return (
    <Box id="sidebar-box">
      <Drawer
        id="sidebar-drawer"
        variant="permanent"
        sx={{
          width: drawerWidth,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            minWidth: "50px",
            boxSizing: "border-box",
          },
        }}
      >
        <List id="sidebar-list">
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
              <ListItemText primary="Load Image" onClick={verifyPermission} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
              <ListItemText primary="Drafts" />
            </ListItemButton>
          </ListItem>
        </List>

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
      </Drawer>
    </Box>
  );
}
