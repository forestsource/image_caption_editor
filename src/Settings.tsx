import React, { useContext } from "react";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

import { SettingsContext } from "./Contexts/SettingsContext";

export function Settings() {
  const { state, dispatch } = useContext(SettingsContext);
  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let setting = { ...state.setting, darkMode: event.target.checked };
    dispatch({
      type: "SET_SETTING",
      payload: setting,
    });
  };

  return (
    <Box sx={{ margin: "1em" }}>
      <FormControlLabel
        checked={state.setting.darkMode}
        control={<Switch onChange={handleThemeChange} />}
        label="dark mode"
      />
    </Box>
  );
}
