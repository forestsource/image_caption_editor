import { Dataset, Image, Caption } from "./types";
import { tagSplitter } from "./TagUtils";

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
  for await (const [, value] of dirHandle.entries()) {
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
      const caption: Caption = { name: image.name, uri: "", content: [] };
      datasets.push({ name: image.name, image, caption, dirHandle });
    }
  }
  return datasets;
};