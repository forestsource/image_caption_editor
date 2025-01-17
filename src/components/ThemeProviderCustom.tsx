import { useContext, useEffect, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";
import { SettingsContext } from "../Contexts/SettingsContext";

export const ThemeProviderCustom: React.FC<{ children: React.ReactNode }> = ({
  // eslint-disable-next-line react/prop-types
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
    typography: {
      fontFamily: [
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
        '"メイリオ"',
        '"Meiryo"',
        '"Noto Sans JP"',
        '"Yu Gothic"',
      ].join(","),
    },
  });

  // eslint-disable-next-line react/prop-types
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
