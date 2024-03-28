import React, { createContext } from "react";
import { useReducer } from "react";
import { Setting } from "../types";

type SettingsState = {
  setting: Setting;
};

type SettingsAction =
  | { type: "SET_SETTING"; payload: Setting }
  | { type: "USE_USER_DEFAULT" };

const SettingsContext = createContext<{
  state: SettingsState;
  dispatch: React.Dispatch<SettingsAction>;
}>({
  state: { setting: { darkMode: false, preferredLanguage: "en" } },
  dispatch: () => undefined,
});

const settingsReducer = (
  state: SettingsState,
  action: SettingsAction
): SettingsState => {
  switch (action.type) {
    case "SET_SETTING":
      return { ...state, setting: action.payload };
    case "USE_USER_DEFAULT":
      const isDarkMode =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      return { ...state, setting: { ...state.setting, darkMode: isDarkMode } };
    default:
      return state;
  }
};

const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(settingsReducer, {
    setting: { darkMode: false, preferredLanguage: "en" },
  });

  return (
    <SettingsContext.Provider value={{ state, dispatch }}>
      {children}
    </SettingsContext.Provider>
  );
};

export { SettingsContext, SettingsProvider };
