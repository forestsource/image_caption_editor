// ThemeContext.tsx
import React from "react";

export const ThemeContext = React.createContext({
  darkMode: false,
  setDarkMode: (mode: boolean) => {},
});
