"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { timeAgo } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  users?: Array<{ email: string; firstName?: string; lastName?: string }>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  users = [],
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Find the most recently updated row - only if data has the required properties
  let lastUpdated: Date | null = null;
  let lastUpdatedBy: string | null = null;
  let lastUpdatedByEmail: string | null = null;

  // Type guard to check if data has the required properties
  const hasTimestampFields = (
    item: unknown
  ): item is {
    updatedAt?: unknown;
    createdAt?: unknown;
    createdBy?: string;
  } => {
    return item !== null && typeof item === "object";
  };

  for (const row of data) {
    if (!hasTimestampFields(row)) continue;

    const getDateFromField = (field: unknown): Date | null => {
      if (!field) return null;
      if (field instanceof Date) return field;
      if (
        typeof field === "object" &&
        field !== null &&
        "toDate" in field &&
        typeof (field as { toDate: () => Date }).toDate === "function"
      ) {
        return (field as { toDate: () => Date }).toDate();
      }
      return null;
    };

    const updated = getDateFromField(row.updatedAt);
    const created = getDateFromField(row.createdAt);
    const candidate = updated || created;
    if (!candidate) continue;
    if (!lastUpdated || candidate > lastUpdated) {
      lastUpdated = candidate;
      lastUpdatedByEmail = row.createdBy || null;
    }
  }

  if (lastUpdatedByEmail) {
    const user = users.find((u) => u.email === lastUpdatedByEmail);
    if (user) {
      lastUpdatedBy = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    } else {
      lastUpdatedBy = lastUpdatedByEmail;
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex flex-row items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          {lastUpdated && lastUpdatedBy && (
            <span className="flex items-center text-xs text-muted-foreground">
              <span className="mr-2">•</span>Last updated by {lastUpdatedBy}{" "}
              {timeAgo(lastUpdated)}
            </span>
          )}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
