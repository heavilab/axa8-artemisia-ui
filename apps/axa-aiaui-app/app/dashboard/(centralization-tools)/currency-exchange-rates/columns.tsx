"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronsUpDown } from "lucide-react";
import { CurrencyExchangeRates } from "@/schemas/firestore";

export const columns: ColumnDef<CurrencyExchangeRates>[] = [
  {
    accessorKey: "forex",
    enableSorting: true,
    header: ({ column }) => (
      <button
        className="flex items-center gap-2 select-none hover:underline"
        onClick={column.getToggleSortingHandler()}
        type="button"
      >
        Currency Pair
        <ChevronsUpDown className="w-3 h-3 ml-1 text-muted-foreground" />
      </button>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("forex")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "value",
    enableSorting: true,
    header: ({ column }) => (
      <button
        className="flex items-center gap-2 select-none hover:underline"
        onClick={column.getToggleSortingHandler()}
        type="button"
      >
        Exchange Rate
        <ChevronsUpDown className="w-3 h-3 ml-1 text-muted-foreground" />
      </button>
    ),
    cell: ({ row }) => {
      const value = row.getValue("value");
      const num = typeof value === "number" ? value : Number(value);
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {isNaN(num) ? "" : num.toFixed(4)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    enableSorting: true,
    header: ({ column }) => (
      <button
        className="flex items-center gap-2 select-none hover:underline"
        onClick={column.getToggleSortingHandler()}
        type="button"
      >
        Date
        <ChevronsUpDown className="w-3 h-3 ml-1 text-muted-foreground" />
      </button>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("date")}
          </span>
        </div>
      );
    },
  },
];
