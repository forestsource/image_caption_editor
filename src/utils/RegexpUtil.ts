export function processStringWithRegexp(str: string, regexInput: string): string {
  const parts = regexInput.split("/");
  if (parts.length < 3) {
    console.debug(parts);
    throw new Error("Invalid regexp format");
  }
  const pattern = parts[1];
  const flags = parts[3];
  const regex = new RegExp(pattern, flags);
  return str.replace(regex, parts[2]);
}

export const isValidRegex = (userInput: string): boolean => {
  try {
    new RegExp(userInput);
  } catch (e) {
    return false;
  }
  return true;
};