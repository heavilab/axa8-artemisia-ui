// app/dashboard/(media-data-collection)/business-rules/source-field-mapping-table.tsx
import { BusinessRules } from "@/schemas/firestore";
import { DataTable } from "./data-table";
import { getColumns } from "./table-columns";
import { useMemo } from "react";

interface UserProfile {
  email: string;
  firstName?: string;
  lastName?: string;
}

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
  users?: UserProfile[];
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
  users = [],
}: Props) {
  const filtered = data.filter((row) =>
    Object.values(row)
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );
  const sorted = filtered.slice().sort((a, b) => {
    const aDate = a.createdAt?.toDate
      ? a.createdAt.toDate()
      : a.createdAt instanceof Date
      ? a.createdAt
      : new Date(0);
    const bDate = b.createdAt?.toDate
      ? b.createdAt.toDate()
      : b.createdAt instanceof Date
      ? b.createdAt
      : new Date(0);
    return bDate.getTime() - aDate.getTime();
  });

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

  return <DataTable columns={columns} data={sorted} users={users} />;
}
