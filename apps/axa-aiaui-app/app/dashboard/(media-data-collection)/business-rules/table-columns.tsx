// app/dashboard/(media-data-collection)/source-field-mappings/table-columns.ts
import { ColumnDef } from "@tanstack/react-table";
import { BusinessRules } from "@/schemas/firestore";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";

export function getColumns({
  isEditable,
  setId,
}: {
  isEditable: boolean;
  setId: string;
}): ColumnDef<BusinessRules>[] {
  const base: ColumnDef<BusinessRules>[] = [
    { accessorKey: "dataSource", header: "Data Source" },
    { accessorKey: "agency", header: "Agency" },
    { accessorKey: "field", header: "Field" },
    { accessorKey: "targetField", header: "Target Field" },
    { accessorKey: "matchType", header: "Match Type" },
    { accessorKey: "condition", header: "Condition" },
    { accessorKey: "results", header: "Results" },
  ];

  if (!isEditable) return base;

  return [
    ...base,
    {
      id: "actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm">
          <MoreVertical />
        </Button>
      ),
    },
  ];
}
