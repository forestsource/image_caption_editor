import React, { createContext, useCallback, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";

import { ListDirectory } from "./list";
import { Editor } from "./editor";
import { Dataset } from "./types";
import "./App.css";

//font
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

export const DatasetsContext = React.createContext(
  {} as {
    datasets: Dataset[];
    setDatasets: React.Dispatch<React.SetStateAction<Dataset[]>>;
  }
);

function App() {
  const emptyDataset: Dataset[] = [];
  const [datasets, setDatasets] = useState(emptyDataset);
  return (
    <div className="App">
      <header className="">
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Cache-Control" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </header>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container sx={{ backgroundColor: "secondary.main", height: "100vh" }}>
          <BrowserRouter>
            <DatasetsContext.Provider value={{ datasets, setDatasets }}>
              <Routes>
                <Route path="/" element={<ListDirectory />} />
                <Route path="/edit/:pageId" element={<Editor />} />
              </Routes>
            </DatasetsContext.Provider>
          </BrowserRouter>
        </Container>
      </ThemeProvider>
    </div>
  );
}

export default App;
