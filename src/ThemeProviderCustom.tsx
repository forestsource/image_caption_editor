import { useContext, useEffect, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";
import { SettingsContext } from "./Contexts/SettingsContext";

export const ThemeProviderCustom: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { state, dispatch } = useContext(SettingsContext);
  const [darkMode, setDarkMode] = useState(state.setting.darkMode);

  useEffect(() => {
    dispatch({ type: "USE_USER_DEFAULT" });
  }, []);

  useEffect(() => {
    setDarkMode(state.setting.darkMode);
  }, [state.setting.darkMode]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
