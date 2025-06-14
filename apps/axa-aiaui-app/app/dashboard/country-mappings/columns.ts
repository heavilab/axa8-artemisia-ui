// app/dashboard/country-mappings/columns.ts
import { ColumnDef } from "@tanstack/react-table";

export type CountryMapping = {
  id: string;
  country: string;
  data_currency: string;
  language: string;
};

export const columns: ColumnDef<CountryMapping>[] = [
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
