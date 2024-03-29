import React from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import { TopNTags } from "./TopNTags";
import { DeleteTags } from "./DeleteTags";
import { Replacer } from "./Replacer";
import { AddTags } from "./AddTags";
import { useTranslation } from "react-i18next";

export function BatchEditor() {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
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
