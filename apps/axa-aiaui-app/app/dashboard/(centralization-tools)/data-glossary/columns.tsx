"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronsUpDown } from "lucide-react";
import { DataGlossary } from "@/schemas/firestore";

export const columns: ColumnDef<DataGlossary>[] = [
  {
    accessorKey: "dataFieldName",
    enableSorting: true,
    header: ({ column }) => (
      <button
        className="flex items-center gap-2 select-none hover:underline"
        onClick={column.getToggleSortingHandler()}
        type="button"
      >
        Data Field Name
        <ChevronsUpDown className="w-3 h-3 ml-1 text-muted-foreground" />
      </button>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("dataFieldName")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "priorityOnline",
    enableSorting: true,
    header: ({ column }) => (
      <button
        className="flex items-center gap-2 select-none hover:underline"
        onClick={column.getToggleSortingHandler()}
        type="button"
      >
        Priority Online
        <ChevronsUpDown className="w-3 h-3 ml-1 text-muted-foreground" />
      </button>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("priorityOnline")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "priorityOffline",
    enableSorting: true,
    header: ({ column }) => (
      <button
        className="flex items-center gap-2 select-none hover:underline"
        onClick={column.getToggleSortingHandler()}
        type="button"
      >
        Priority Offline
        <ChevronsUpDown className="w-3 h-3 ml-1 text-muted-foreground" />
      </button>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("priorityOffline")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "outputType",
    enableSorting: true,
    header: ({ column }) => (
      <button
        className="flex items-center gap-2 select-none hover:underline"
        onClick={column.getToggleSortingHandler()}
        type="button"
      >
        Output Type
        <ChevronsUpDown className="w-3 h-3 ml-1 text-muted-foreground" />
      </button>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("outputType")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    enableSorting: true,
    header: ({ column }) => (
      <button
        className="flex items-center gap-2 select-none hover:underline"
        onClick={column.getToggleSortingHandler()}
        type="button"
      >
        Description
        <ChevronsUpDown className="w-3 h-3 ml-1 text-muted-foreground" />
      </button>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate">
            {row.getValue("description")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "example",
    enableSorting: true,
    header: ({ column }) => (
      <button
        className="flex items-center gap-2 select-none hover:underline"
        onClick={column.getToggleSortingHandler()}
        type="button"
      >
        Example
        <ChevronsUpDown className="w-3 h-3 ml-1 text-muted-foreground" />
      </button>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate">
            {row.getValue("example")}
          </span>
        </div>
      );
    },
  },
];
