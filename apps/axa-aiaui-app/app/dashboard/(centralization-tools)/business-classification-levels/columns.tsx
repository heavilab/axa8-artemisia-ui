"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronsUpDown } from "lucide-react";
import { BusinessClassificationLevels } from "@/schemas/firestore";

export const columns: ColumnDef<BusinessClassificationLevels>[] = [
  {
    accessorKey: "businessClassificationLevel1",
    enableSorting: true,
    header: ({ column }) => (
      <button
        className="flex items-center gap-2 select-none hover:underline"
        onClick={column.getToggleSortingHandler()}
        type="button"
      >
        Business Classification Level 1
        <ChevronsUpDown className="w-3 h-3 ml-1 text-muted-foreground" />
      </button>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("businessClassificationLevel1")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "businessClassificationLevel2",
    enableSorting: true,
    header: ({ column }) => (
      <button
        className="flex items-center gap-2 select-none hover:underline"
        onClick={column.getToggleSortingHandler()}
        type="button"
      >
        Business Classification Level 2
        <ChevronsUpDown className="w-3 h-3 ml-1 text-muted-foreground" />
      </button>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("businessClassificationLevel2")}
          </span>
        </div>
      );
    },
  },
];
