import React, { createContext } from "react";
import { useReducer } from "react";
import { Setting } from "../types";
import { PreferredLanguage as pl } from "../types";

type SettingsState = {
  setting: Setting;
};

type SettingsAction =
  | { type: "SET_SETTING"; payload: Setting }
  | { type: "USE_USER_DEFAULT" }
  | { type: "SAVE_SETTING"; payload: Setting };

const SettingsContext = createContext<{
  state: SettingsState;
  dispatch: React.Dispatch<SettingsAction>;
}>({
  state: { setting: { darkMode: false, preferredLanguage: pl.EN } },
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
      let lang;
      if (navigator.language.startsWith("ja")) {
        lang = pl.JA;
      } else {
        lang = pl.EN;
      }
      return {
        ...state,
        setting: {
          ...state.setting,
          darkMode: isDarkMode,
          preferredLanguage: lang,
        },
      };
    case "SAVE_SETTING":
      localStorage.setItem("setting", JSON.stringify(state.setting));
      return { ...state, setting: action.payload };
    default:
      return state;
  }
};

const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(settingsReducer, {
    setting: { darkMode: false, preferredLanguage: pl.EN },
  });

  return (
    <SettingsContext.Provider value={{ state, dispatch }}>
      {children}
    </SettingsContext.Provider>
  );
};

export { SettingsContext, SettingsProvider };
