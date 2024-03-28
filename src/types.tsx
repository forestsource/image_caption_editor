export interface Image {
  uri: string;
  name: string;
}

export interface Caption {
  name: string;
  uri: string;
  content: string[];
}

export interface Dataset {
  name: string;
  image: Image;
  caption: Caption;
  dirHandle: FileSystemDirectoryHandle;
}

export interface suggestionTags {
  normalizedTag: string;
  destabilizedTags: string[];
}

export enum PreferredLanguage {
  JA = "ja",
  EN = "en",
}

export interface Setting {
  darkMode: boolean;
  preferredLanguage: PreferredLanguage;
}
