import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";
import Grid from "@mui/material/Unstable_Grid2";

import { ListDirectory } from "./list";
import { Editor } from "./editor";
import { Sidebar } from "./sidebar";
import { BatchEditor } from "./BatchEditor";
import { DatasetsProvider } from "./Contexts/DatasetsContext";
import { TagEditorProvider } from "./Contexts/TagEditorContext";

function App() {
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
          <DatasetsProvider>
            <TagEditorProvider>
              <Grid container>
                <Grid xs={3} id="sidebar-before-grid">
                  <Sidebar />
                </Grid>
                <Grid xs={9}>
                  <Routes>
                    <Route path="/" element={<ListDirectory />} />
                    <Route path="/edit/:pageId" element={<Editor />} />
                    <Route path="/batchEdit" element={<BatchEditor />} />
                  </Routes>
                </Grid>
              </Grid>
            </TagEditorProvider>
          </DatasetsProvider>
        </BrowserRouter>
      </Container>
    </ThemeProvider>
  );
}

export default App;
