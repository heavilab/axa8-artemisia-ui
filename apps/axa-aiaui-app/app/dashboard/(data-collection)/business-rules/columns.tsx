// columns.ts
import { ColumnDef } from "@tanstack/react-table";
import { BusinessRule } from "@/schemas/firestore";
import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Filters = {
  agency: string;
  data_source: string;
  field: string;
  target_field: string;
  match_type: string;
};

export function getColumns(filters: Filters): ColumnDef<BusinessRule>[] {
  const withFilterIcon = (label: string, isActive: boolean) => (
    <div className="flex items-center gap-2">
      <span>{label}</span>
      {isActive && (
        <Badge variant="secondary" className="flex items-center gap-1 text-xs">
          <Filter className="w-3 h-3" />
        </Badge>
      )}
    </div>
  );

  return [
    {
      accessorKey: "agency",
      header: () => withFilterIcon("Agency", filters.agency !== "all"),
    },
    {
      accessorKey: "country",
      header: "Country",
    },
    {
      accessorKey: "entity",
      header: "Entity",
    },
    {
      accessorKey: "data_source",
      header: () =>
        withFilterIcon("Data Source", filters.data_source !== "all"),
    },
    {
      accessorKey: "field",
      header: () => withFilterIcon("Field", filters.field !== "all"),
    },
    {
      accessorKey: "target_field",
      header: () =>
        withFilterIcon("Target Field", filters.target_field !== "all"),
    },
    {
      accessorKey: "start_date",
      header: "Start Date",
      cell: ({ getValue }) =>
        new Date(getValue() as string).toLocaleDateString(),
    },
    {
      accessorKey: "end_date",
      header: "End Date",
      cell: ({ getValue }) =>
        new Date(getValue() as string).toLocaleDateString(),
    },
    {
      accessorKey: "match_type",
      header: () => withFilterIcon("Match Type", filters.match_type !== "all"),
    },
    {
      accessorKey: "condition",
      header: "Condition",
    },
    {
      accessorKey: "result",
      header: "Result",
    },
  ];
}
