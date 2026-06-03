"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const specialtyData = [
  { specialty: "Cardiology", accuracy: 82 },
  { specialty: "Internal Med", accuracy: 75 },
  { specialty: "Pediatrics", accuracy: 88 },
  { specialty: "Surgery", accuracy: 65 },
  { specialty: "Neurology", accuracy: 70 },
];

export default function SpecialtyChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={specialtyData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis type="number" domain={[0, 100]} className="text-xs text-muted-foreground" />
        <YAxis dataKey="specialty" type="category" className="text-xs text-muted-foreground" width={90} />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
          }}
        />
        <Bar dataKey="accuracy" fill="var(--primary)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}