import React, { createContext } from "react";
import { useReducer } from "react";
import { Notification } from "../types";
import { Severity as sev } from "../types";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";

type NotificationsState = {
  notification: Notification;
};

type NotificationsAction =
  | { type: "NOTIFY"; payload: Notification }
  | { type: "CLOSE" };

const NotificationsContext = createContext<{
  state: NotificationsState;
  dispatch: React.Dispatch<NotificationsAction>;
}>({
  state: { notification: { open: false, msg: "", severity: sev.INFO } },
  dispatch: () => undefined,
});

const notificationsReducer = (
  state: NotificationsState,
  action: NotificationsAction
): NotificationsState => {
  switch (action.type) {
    case "NOTIFY":
      return { ...state, notification: action.payload };
    case "CLOSE":
      return {
        ...state,
        notification: {
          open: false,
          msg: "",
          severity: state.notification.severity,
        },
      };
    default:
      return state;
  }
};

const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(notificationsReducer, {
    notification: { open: false, msg: "", severity: sev.INFO },
  });

  /* handler */
  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    dispatch({ type: "CLOSE" });
  };

  return (
    <NotificationsContext.Provider value={{ state, dispatch }}>
      {children}
      <Snackbar
        open={state.notification.open}
        autoHideDuration={2000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity={state.notification.severity}
          sx={{ width: "100%" }}
        >
          <Typography>{state.notification.msg}</Typography>
        </Alert>
      </Snackbar>
    </NotificationsContext.Provider>
  );
};

export { NotificationsContext, NotificationsProvider };
