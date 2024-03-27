import React, { useContext } from "react";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

import { ThemeContext } from "./Contexts/ThemeContext";

export function Settings() {
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDarkMode(event.target.checked);
  };

  return (
    <Box sx={{ margin: "1em" }}>
      <FormControlLabel
        checked={darkMode}
        control={<Switch onChange={handleThemeChange} />}
        label="dark mode"
      />
    </Box>
  );
}
