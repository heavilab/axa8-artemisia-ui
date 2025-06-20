// app/dashboard/(media-data-collection)/business-rules/source-field-mapping-table.tsx
import { BusinessRules } from "@/schemas/firestore";
import { DataTable } from "./data-table";
import { getColumns } from "./table-columns";
import { useMemo } from "react";

interface Props {
  data: BusinessRules[];
  isEditable: boolean;
  searchQuery: string;
  onRefresh?: () => void | Promise<void>;
  scopeFilterActive?: boolean;
  dataSourceFilterActive?: boolean;
  fieldFilterActive?: boolean;
  targetFieldFilterActive?: boolean;
  matchTypeFilterActive?: boolean;
}

export function BusinessRulesTable({
  data,
  isEditable,
  searchQuery = "",
  onRefresh,
  scopeFilterActive = false,
  dataSourceFilterActive = false,
  fieldFilterActive = false,
  targetFieldFilterActive = false,
  matchTypeFilterActive = false,
}: Props) {
  const filtered = data.filter(
    (row) =>
      row.field?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.targetField?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.dataSource?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = useMemo(
    () =>
      getColumns({
        isEditable,
        onRefresh,
        scopeFilterActive,
        dataSourceFilterActive,
        fieldFilterActive,
        targetFieldFilterActive,
        matchTypeFilterActive,
      }),
    [
      isEditable,
      onRefresh,
      scopeFilterActive,
      dataSourceFilterActive,
      fieldFilterActive,
      targetFieldFilterActive,
      matchTypeFilterActive,
    ]
  );

  return <DataTable columns={columns} data={filtered} />;
}
