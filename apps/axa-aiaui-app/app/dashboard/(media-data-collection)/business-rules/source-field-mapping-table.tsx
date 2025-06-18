// app/dashboard/(media-data-collection)/source-field-mappings/source-field-mapping-table.tsx
import { BusinessRules } from "@/schemas/firestore";
import { DataTable } from "./data-table";
import { getColumns } from "./table-columns";
import { useMemo } from "react";

interface Props {
  data: BusinessRules[];
  isEditable: boolean;
  searchQuery: string;
}

export function SourceFieldMappingTable({
  data,
  isEditable,
  searchQuery = "",
}: Props) {
  const filtered = data.filter(
    (row) =>
      row.field?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.targetField?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.dataSource?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = useMemo(() => getColumns({ isEditable }), [isEditable]);

  return <DataTable columns={columns} data={filtered} />;
}
