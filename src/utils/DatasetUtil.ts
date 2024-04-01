import { Dataset, Image, Caption } from "../types";
import { tagSplitter } from "./TagUtils";
import { DirectoryLoadError, InvalidFileTypeError } from "../Errors";

const filenameWithoutExtention = (path: string) => {
  if (path === "" || path === undefined) {
    return "";
  }
  const basename = path.split("/").pop();
  if (basename === undefined) {
    return "";
  }
  return basename.split(".")[0];
};

export const createDataset = async (dirHandle: FileSystemDirectoryHandle) => {
  const datasets: Dataset[] = [];
  const images: Image[] = [];
  const captions: Caption[] = [];
  for await (let [, value] of dirHandle.entries()) {
    if (value.kind !== "file") {
      continue;
    }
    const fh = dirHandle.getFileHandle(value.name);
    const file: File = await (await fh).getFile();
    const file_uri: string = window.URL.createObjectURL(file);
    if (
      file.type == "image/png" ||
      file.type == "image/jpeg" ||
      file.type == "image/jiff" ||
      file.type == "image/gif" ||
      file.type == "image/webp"
    ) {
      const image: Image = { name: value.name, uri: file_uri };
      images.push(image);
    } else if (file.type == "text/plain") {
      const caption: Caption = {
        name: value.name,
        uri: file_uri,
        content: tagSplitter(await file.text()),
      };
      captions.push(caption);
    }
  }
  for await (const image of images) {
    const caption = captions.find(
      (caption) =>
        filenameWithoutExtention(caption.name) ===
        filenameWithoutExtention(image.name)
    );
    if (caption) {
      datasets.push({ name: image.name, image, caption, dirHandle });
    } else {
      console.info("caption not found for image", image);
      const captionName = filenameWithoutExtention(image.name) + ".txt";
      const caption: Caption = { name: captionName, uri: "", content: [] };
      datasets.push({ name: image.name, image, caption, dirHandle });
    }
  }
  console.debug("return:", datasets);
  return datasets;
};

export async function loadDatasetFolder(): Promise<Dataset[]>{
    let dirHandle = null;
    try {
      dirHandle = await window.showDirectoryPicker({ mode: "readwrite" });
      return createDataset(dirHandle);
    } catch (e) {
      if (e instanceof DOMException) {
        if (e.name === "AbortError") {
          throw new DirectoryLoadError("Cancel directory pickup");
        } 
      } 
      if(e instanceof TypeError) {
        throw new InvalidFileTypeError("Invalid file type");
      } 
      console.error(e);
      throw e;
    }
  }

export function flatTags(datasets: Dataset[]): string[] {
  return datasets.flatMap((dataset) => {
    if (
      dataset === undefined ||
      dataset.caption === undefined ||
      dataset.caption.content === undefined
    ) {
      return [];
    }
    return dataset.caption.content;
  });
};