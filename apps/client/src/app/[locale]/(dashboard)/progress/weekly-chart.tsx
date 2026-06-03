"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const weeklyData = [
  { day: "Mon", minutes: 45 }, { day: "Tue", minutes: 60 }, { day: "Wed", minutes: 30 },
  { day: "Thu", minutes: 75 }, { day: "Fri", minutes: 50 }, { day: "Sat", minutes: 90 },
  { day: "Sun", minutes: 20 },
];

export default function WeeklyChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={weeklyData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="day" className="text-xs text-muted-foreground" />
        <YAxis className="text-xs text-muted-foreground" />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
          }}
        />
        <Bar dataKey="minutes" fill="var(--primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}