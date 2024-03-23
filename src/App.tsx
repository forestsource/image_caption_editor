import React, { createContext, useCallback, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";
import Grid from "@mui/material/Unstable_Grid2";
import Box from "@mui/material/Box";

import { ListDirectory } from "./list";
import { Editor } from "./editor";
import { Dataset } from "./types";
import { Sidebar } from "./sidebar";

export const DatasetsContext = React.createContext(
  {} as {
    datasets: Dataset[];
    setDatasets: React.Dispatch<React.SetStateAction<Dataset[]>>;
  }
);

function App() {
  const emptyDataset: Dataset[] = [];
  const [datasets, setDatasets] = useState(emptyDataset);
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        disableGutters
        maxWidth={false}
        sx={{
          backgroundColor: "background.default",
          paddingTop: "1em",
          height: "100vh",
        }}
      >
        <BrowserRouter>
          <DatasetsContext.Provider value={{ datasets, setDatasets }}>
            <Grid container>
              <Grid xs={3} id="sidebar-before-grid">
                <Box>
                  <Sidebar />
                </Box>
              </Grid>
              <Grid xs={9} sx={{ backgroundColor: "blue" }}>
                <Routes>
                  <Route path="/" element={<ListDirectory />} />
                  <Route path="/edit/:pageId" element={<Editor />} />
                </Routes>
              </Grid>
            </Grid>
          </DatasetsContext.Provider>
        </BrowserRouter>
      </Container>
    </ThemeProvider>
  );
}

export default App;
