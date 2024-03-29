import { BrowserRouter, Routes, Route } from "react-router-dom";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Unstable_Grid2";

import { ListDirectory } from "./pages/List";
import { Editor } from "./pages/Editor";
import { Sidebar } from "./components/Sidebar";
import { BatchEditor } from "./pages/BatchEditor";
import { Settings } from "./pages/Settings";
import { SettingsProvider } from "./Contexts/SettingsContext";
import { DatasetsProvider } from "./Contexts/DatasetsContext";
import { TagEditorProvider } from "./Contexts/TagEditorContext";
import { NotificationsProvider } from "./Contexts/NotificationsContext";
import { ThemeProviderCustom } from "./components/ThemeProviderCustom";

function App() {
  return (
    <SettingsProvider>
      <ThemeProviderCustom>
        <NotificationsProvider>
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
                        <Route path="/settings" element={<Settings />} />
                      </Routes>
                    </Grid>
                  </Grid>
                </TagEditorProvider>
              </DatasetsProvider>
            </BrowserRouter>
          </Container>
        </NotificationsProvider>
      </ThemeProviderCustom>
    </SettingsProvider>
  );
}

export default App;
