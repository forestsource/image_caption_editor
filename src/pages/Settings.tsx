import React, { useContext } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import { useTranslation } from "react-i18next";

import { SettingsContext } from "../Contexts/SettingsContext";
import { NotificationsContext } from "../Contexts/NotificationsContext";
import { PreferredLanguage as pl, Severity as sv } from "../types";
import Typography from "@mui/material/Typography";

export function Settings() {
  const { t } = useTranslation();
  const { state, dispatch } = useContext(SettingsContext);
  const { dispatch: notificationsDispatch } = useContext(NotificationsContext);

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const setting = { ...state.setting, darkMode: event.target.checked };
    dispatch({
      type: "SET_SETTING",
      payload: setting,
    });
  };
  const handleLanguageChange = (event: SelectChangeEvent<pl>) => {
    dispatch({ type: "CHANGE_LANGUAGE", payload: event.target.value as pl });
  };
  const handleSave = () => {
    dispatch({
      type: "SAVE_SETTING",
      payload: state.setting,
    });
    notificationsDispatch({
      type: "NOTIFY",
      payload: {
        open: true,
        msg: t("general.saved"), // Fix this line
        severity: sv.SUCCESS,
      },
    });
  };

  return (
    <Paper elevation={3} sx={{ margin: "1em" }}>
      <Box sx={{ padding: "1em" }}>
        <Box>
          <FormControlLabel
            checked={state.setting.darkMode}
            control={<Switch onChange={handleThemeChange} />}
            label={t("settings.darkmode")}
          />
        </Box>
        <Box sx={{ paddingTop: "1em" }}>
          <FormControl>
            <InputLabel id="prefferedlanguage-select-label">
              {t("settings.language")}
            </InputLabel>
            <Select
              labelId="prefferedlanguage-select-label"
              id="prefferedlanguage-select"
              value={state.setting.preferredLanguage}
              label="langugage"
              onChange={handleLanguageChange}
            >
              <MenuItem value={pl.EN}>
                {" "}
                <Typography>English</Typography>
              </MenuItem>
              <MenuItem value={pl.JA}>
                <Typography>日本語</Typography>
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={handleSave}>
            {t("general.save")}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
