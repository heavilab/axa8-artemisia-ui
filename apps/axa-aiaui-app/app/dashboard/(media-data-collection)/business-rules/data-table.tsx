"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
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
import { timeAgo } from "@/lib/utils";
import { useState } from "react";
import { BusinessRules } from "@/schemas/firestore";

interface UserProfile {
  email: string;
  firstName?: string;
  lastName?: string;
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  users?: UserProfile[];
}

export function DataTable({
  columns,
  data,
  users = [],
}: DataTableProps<BusinessRules>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Find the most recently updated row
  let lastUpdated: Date | null = null;
  let lastUpdatedBy: string | null = null;
  let lastUpdatedByEmail: string | null = null;
  for (const row of data) {
    const updated = row.updatedAt?.toDate
      ? row.updatedAt.toDate()
      : row.updatedAt instanceof Date
      ? row.updatedAt
      : null;
    const created = row.createdAt?.toDate
      ? row.createdAt.toDate()
      : row.createdAt instanceof Date
      ? row.createdAt
      : null;
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
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
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
