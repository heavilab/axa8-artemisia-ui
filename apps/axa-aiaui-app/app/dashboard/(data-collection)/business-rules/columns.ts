"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BusinessRule } from "@/schemas/firestore";

export const columns: ColumnDef<BusinessRule>[] = [
  {
    accessorKey: "data_source",
    header: "Data Source",
  },
  {
    accessorKey: "field",
    header: "Field",
  },
  {
    accessorKey: "target_field",
    header: "Target Field",
  },
  {
    accessorKey: "start_date",
    header: "Start Date",
    cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
  },
  {
    accessorKey: "end_date",
    header: "End Date",
    cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
  },
  {
    accessorKey: "match_type",
    header: "Match Type",
  },
  {
    accessorKey: "condition",
    header: "Condition",
  },
  {
    accessorKey: "results",
    header: "Result",
  },
];
