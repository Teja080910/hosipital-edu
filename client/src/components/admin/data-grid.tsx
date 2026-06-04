"use client";

import { DataTable } from "@/components/data-table";

interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface DataGridProps<T> {
  data: T[];
  columns: Column<T>[];
}

export function DataGrid<T extends Record<string, any>>({ data, columns }: DataGridProps<T>) {
  return <DataTable data={data} columns={columns} searchKeys={columns.map(c => c.key) as any} />;
}