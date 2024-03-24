import React, { useContext } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";

import { DatasetsContext } from "./Contexts/DatasetsContext";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Item 1", value: 50 },
  { name: "Item 2", value: 70 },
  { name: "Item 3", value: 30 },
  { name: "Item 4", value: 30 },
  { name: "Item 5", value: 30 },
  { name: "Item 6", value: 30 },
  { name: "Item 7", value: 30 },
  { name: "Item 8", value: 30 },
  { name: "Item 9", value: 30 },
  { name: "Item 10", value: 30 },
  { name: "Item 11", value: 30 },
  { name: "Item 12", value: 30 },
  { name: "Item 13", value: 30 },
  { name: "Item 14", value: 30 },
  { name: "Item 15", value: 30 },
  { name: "Item 16", value: 30 },
  { name: "Item 17", value: 30 },
  { name: "Item 18", value: 30 },
  { name: "Item 19", value: 30 },
  { name: "Item 20", value: 30 },
  { name: "Item 21", value: 30 },
  { name: "jack", value: 30 },
  { name: "Item 23", value: 30 },
];

export function BatchEditor() {
  const { state, dispatch } = useContext(DatasetsContext);
  const datasets = state.datasets;
  const allTags = datasets.flatMap((dataset) => {
    if (
      dataset.caption === undefined ||
      dataset.caption.content === undefined
    ) {
      return [];
    }
    return [];
  });

  return (
    <Box>
      <Card sx={{ margin: "1em" }}>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart layout="vertical" data={data}>
            <CartesianGrid strokeDasharray="3 3" strokeWidth={0.5} />
            <XAxis
              type="number"
              domain={[0, 100]}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis dataKey="name" type="category" interval={0} />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </Box>
  );
}
