import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Unstable_Grid2";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { get as IDAget, set as IDAset } from "idb-keyval";

import type { Image, Caption, Dataset } from "./types";
import { DatasetsContext } from "./App";
import "./App.css";
import { style } from "@mui/system";

const cardStyle = {
  width: "18rem",
  height: "20rem",
  padding: "10px",
  border: "none",
  cursor: "pointer",
};
const cardStyleHover = {
  backgroundColor: "var(--bs-primary)",
  top: "-0.5em",
  boxShadow: "0 2px 3px rgba(0, 0, 0, 0.3)",
};

export function ListDirectory() {
  const [images, setImages] = useState<Image[]>([]);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const { datasets, setDatasets } = useContext(DatasetsContext);
  const navigate = useNavigate();

  // function createDataset(
  //   images: Image[],
  //   captions: Caption[],
  //   dirHandle: FileSystemDirectoryHandle
  // ) {
  //   let datasets: Dataset[] = [];
  //   for (let i = 0; i < images.length; i++) {
  //     const dataset: Dataset = {
  //       image: images[i],
  //       caption: captions[i],
  //       dirHandle,
  //     };
  //     datasets.push(dataset);
  //   }
  //   return datasets;
  // }

  // let images_a: Array<Image> = [];
  // let caption_a: Array<Caption> = [];
  async function verifyPermission() {
    let dirHandle = await IDAget("dir");
    // If handler is exist, request access permission
    if (dirHandle != undefined) {
      let permission = await dirHandle.queryPermission({ mode: "readwrite" });
      if (permission !== "granted") {
        permission = await dirHandle.requestPermission({ mode: "readwrite" });
        // If user deny permission, show dialog to choose another dir
        if (permission !== "granted") {
          dirHandle = await window.showDirectoryPicker({ mode: "readwrite" });
        }
      }
    } else {
      dirHandle = await window.showDirectoryPicker({ mode: "readwrite" });
    }
    createDataset(dirHandle);
    // await IDAset("dir", dirHandle);
  }

  async function createDataset(dirHandle: FileSystemDirectoryHandle) {
    let datasets: Dataset[] = [];
    let images: Image[] = [];
    let captions: Caption[] = [];
    for await (const [key, value] of dirHandle.entries()) {
      const fh = dirHandle.getFileHandle(value.name);
      const name = (await fh).name;
      const file: File = await (await fh).getFile();
      const file_uri: string = window.URL.createObjectURL(file);
      if (file.type == "image/png") {
        const im: Image = { uri: file_uri, name: name };
        images.push(im);
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
      }
    }
    setDatasets(datasets);
  }

  return (
    <>
      <Grid container spacing={1}>
        <Grid xs={12} sx={{ margin: 3 }}>
          <Button variant="contained" onClick={verifyPermission}>
            Load Images
          </Button>
        </Grid>
        <Grid xs={12}>
          <Grid
            container
            spacing={1}
            padding={1}
            margin={1}
            sx={{ backgroundColor: "secondary.main" }}
          >
            {datasets.map((dataset: Dataset, index: number) => (
              <Grid xs={4} md={3} xl={2}>
                <Card
                  onClick={() => navigate(`/edit/${index}`)}
                  sx={{
                    height: "100%",
                    "&:hover": {
                      // backgroundColor: 'primary.main',
                      opacity: [0.9, 0.8, 0.7],
                      margin: -1,
                      boxShadow: 1,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    image={dataset.image.uri}
                    sx={{ md: "auto", objectFit: "contain", height: "40%" }}
                  />
                  <CardContent sx={{ height: "60%" }}>
                    <Typography>{dataset.caption.content}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
