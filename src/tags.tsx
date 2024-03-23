export const tagsFromString = (content: string): string[] => {
  if (content == "" || content == undefined) {
    return [];
  }
  return content.split(",");
};
