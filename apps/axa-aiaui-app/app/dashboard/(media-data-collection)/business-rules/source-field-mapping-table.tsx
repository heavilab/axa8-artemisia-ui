// app/dashboard/(media-data-collection)/source-field-mappings/source-field-mapping-table.tsx
import { BusinessRules } from "@/schemas/firestore";
import { DataTable } from "./data-table";
import { getColumns } from "./table-columns";
import { useMemo } from "react";

interface Props {
  data: BusinessRules[];
  isEditable: boolean;
  setId: string;
}

export function SourceFieldMappingTable({
  data,
  isEditable,
  setId,
  searchQuery = "",
}: {
  data: BusinessRules[];
  isEditable: boolean;
  setId: string;
  searchQuery?: string;
}) {
  const filtered = data.filter(
    (row) =>
      row.field?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.targetField?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.dataSource?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = useMemo(
    () => getColumns({ isEditable, setId }),
    [isEditable, setId]
  );

  return <DataTable columns={columns} data={filtered} />;
}
