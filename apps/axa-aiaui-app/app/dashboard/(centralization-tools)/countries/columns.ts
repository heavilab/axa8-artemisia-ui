import { Country } from "@/schemas/firestore";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<Country>[] = [
  {
    accessorKey: "country",
    header: "Country",
  },
  {
    accessorKey: "data_currency",
    header: "Data Currency",
  },
  {
    accessorKey: "language",
    header: "Language",
  },
];
