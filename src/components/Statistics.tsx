import { useContext } from "react";
import Box from "@mui/material/Box";

import { DatasetsContext } from "../Contexts/DatasetsContext";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface statics {
  tagName: string;
  usageRatio: number;
}

const TOP_N_TAGS = 25;

export function Statistics() {
  const { state } = useContext(DatasetsContext);
  const datasets = state.datasets;
  const allTags = datasets.flatMap((dataset) => dataset.caption.content);
  const statics = (): statics[] => {
    const tags = allTags.reduce((acc, tag) => {
      if (acc[tag] === undefined) {
        acc[tag] = 1;
      } else {
        acc[tag] += 1;
      }
      return acc;
    }, {} as { [key: string]: number });
    return Object.entries(tags).map(([tagName, count]) => ({
      tagName,
      usageRatio: (count / datasets.length) * 100,
    }));
  };
  const topNTags = statics()
    .sort((a, b) => b.usageRatio - a.usageRatio)
    .slice(0, TOP_N_TAGS);

  return (
    <Box sx={{ margin: "1em" }}>
      <ResponsiveContainer height={1000}>
        <BarChart layout="vertical" data={topNTags}>
          <CartesianGrid strokeDasharray="3 3" strokeWidth={0.5} />
          <XAxis
            type="number"
            domain={[0, 100]}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis dataKey="tagName" type="category" interval={0} />
          <Bar dataKey="usageRatio" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
