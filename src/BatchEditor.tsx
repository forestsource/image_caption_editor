import React, { useContext } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import { DatasetsContext } from "./Contexts/DatasetsContext";
import { TopNTags } from "./TopNTags";
import { DeleteTags } from "./DeleteTags";
import { Replacer } from "./Replacer";
import { AddTags } from "./AddTags";
import { useTranslation } from "react-i18next";

export function BatchEditor() {
  const { t } = useTranslation();
  const { state, dispatch } = useContext(DatasetsContext);
  const datasets = state.datasets;
  const flatTags = datasets.flatMap((dataset) => dataset.caption.content);
  const allTags = Array.from(new Set(flatTags));
  const [filter, setFilter] = React.useState<string>("");
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label={t("batch.tab.delete")} />
        <Tab label={t("batch.tab.add")} />
        <Tab label={t("batch.tab.replace")} />
        <Tab label={t("batch.tab.statistics")} />
      </Tabs>
      {tabValue === 0 && <DeleteTags />}
      {tabValue === 1 && <AddTags />}
      {tabValue === 2 && <Replacer />}
      {tabValue === 3 && <TopNTags />}
    </Box>
  );
}
