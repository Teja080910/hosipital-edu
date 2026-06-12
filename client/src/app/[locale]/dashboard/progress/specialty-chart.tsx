"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SpecialtyChartProps {
  data?: { specialtyId: string; name: Record<string, string>; totalAnswered: number; totalCorrect: number }[];
}

export default function SpecialtyChart({ data = [] }: SpecialtyChartProps) {
  const chartData = data
    .filter(d => d.totalAnswered > 0)
    .map(d => ({
      specialty: d.name?.en || Object.values(d.name || {})[0] || "Unknown",
      accuracy: Math.round((d.totalCorrect / d.totalAnswered) * 100),
    }))
    .sort((a, b) => b.accuracy - a.accuracy);

  if (!chartData.length) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">No data yet</div>;
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} layout="vertical">
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