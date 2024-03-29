import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Helmet, HelmetProvider } from "react-helmet-async";
import "./i18n/configs";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Helmet>
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Cache-Control" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </Helmet>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
