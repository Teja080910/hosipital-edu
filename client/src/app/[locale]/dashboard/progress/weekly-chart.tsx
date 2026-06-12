"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface WeeklyChartProps {
  data?: { date: string; count: number }[];
}

export default function WeeklyChart({ data = [] }: WeeklyChartProps) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const chartData = data.map(d => {
    const day = new Date(d.date).getDay();
    return { day: dayNames[day], minutes: d.count * 2 };
  });
  if (!chartData.length) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">No data yet</div>;
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
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