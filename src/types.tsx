export interface Image {
  uri: string;
  name: string;
}

export interface Caption {
  name: string;
  uri: string;
  content: string;
}

export interface Dataset {
  name: string;
  image: Image;
  // caption: string
  caption: Caption;
  dirHandle: FileSystemDirectoryHandle;
}