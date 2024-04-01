import Papa from "papaparse";
import { suggestionTags } from "../types";

export function tagSplitter(tags: string): string[] {
  if (tags === "") {
    return [];
  }
  return tags.split(",").map((tag) => tag.trim());
}

export async function loadSuggestionTags(): Promise<suggestionTags[]> {
  const response = await fetch(process.env.PUBLIC_URL + "/danbooru.csv");
  const csvData = await response.text();
  const parsedCsvData = Papa.parse(csvData, {
    header: false,
    dynamicTyping: false,
  });
  const results: string[][] = parsedCsvData.data as string[][];
  const suggestionTags: suggestionTags[] = [];
  results.forEach((result) => {
    let destabilizedTag: string[] = [];
    if (result[3] !== undefined) {
      destabilizedTag = result[3].split(",");
    }
    suggestionTags.push({
      normalizedTag: result[0],
      destabilizedTags: destabilizedTag,
    });
  });
  return suggestionTags;
}

export function searchIncludeComplement(suggestionTags: suggestionTags[], inputValue: string): string[] {
    const fuzzySearch = suggestionTags.filter((suggestionTag) => {
      return suggestionTag.destabilizedTags.includes(inputValue);
    });
    const partialMatch = suggestionTags.filter((suggestionTag) => {
      return suggestionTag.normalizedTag.includes(inputValue);
    });
    const result = fuzzySearch.concat(partialMatch);
    return result.map((suggestionTag) => suggestionTag.normalizedTag);
}

export function tagCount(tags: string[]): { [key: string]: number } {
  return tags.reduce((acc, tag) => {
    if (acc[tag] === undefined) {
      acc[tag] = 1;
    } else {
      acc[tag] += 1;
    }
    return acc;
  }, {} as { [key: string]: number });
}

  export function filterdTags(filter: string, allTags: string[]): string[] {
    if (filter === "" || filter === undefined) {
      return allTags;
    }
    const regex = new RegExp(filter, "i");
    return allTags.filter((tag) => {
      return tag.match(regex);
    });
  }