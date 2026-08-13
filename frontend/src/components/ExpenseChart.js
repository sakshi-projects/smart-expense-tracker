import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

function ExpenseChart({ categoryData }) {
  const COLORS = ["#8b5cf6", "#ec4899", "#22c55e"];

  return (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginTop: "40px",
    }}
  >
    <h3>Expense by Category</h3>

    <PieChart width={400} height={300}>
      <Pie
        data={categoryData}
        dataKey="value"
        nameKey="name"
        outerRadius={100}
        label
      >
        {categoryData.map((entry, index) => (
          <Cell key={index} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  </div>
);
}

export default ExpenseChart;