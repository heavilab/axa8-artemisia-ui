// app/dashboard/(media-data-collection)/source-field-mappings/table-columns.ts
import { ColumnDef } from "@tanstack/react-table";
import { BusinessRules } from "@/schemas/firestore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2 } from "lucide-react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function getColumns({
  isEditable,
  onRefresh,
}: {
  isEditable: boolean;
  onRefresh?: () => void | Promise<void>;
}): ColumnDef<BusinessRules>[] {
  const base: ColumnDef<BusinessRules>[] = [
    {
      id: "scope",
      header: "Scope",
      cell: ({ row }) => {
        const { country, entity, agency } = row.original;
        const scope = [country, entity, agency].filter(Boolean).join("-");
        return <Badge variant="secondary">{scope}</Badge>;
      },
    },
    { accessorKey: "dataSource", header: "Data Source" },
    { accessorKey: "field", header: "Field" },
    { accessorKey: "targetField", header: "Target Field" },
    { accessorKey: "matchType", header: "Match Type" },
    { accessorKey: "condition", header: "Condition" },
    { accessorKey: "results", header: "Results" },
  ];

  if (!isEditable) return base;

  return [
    ...base,
    {
      id: "actions",
      cell: ({ row }) => {
        const handleDelete = async () => {
          try {
            // Get the document ID from the row
            const docId = row.id;
            await deleteDoc(doc(db, "businessRules", docId));
            toast.success("Business rule deleted successfully");
            if (onRefresh) {
              await onRefresh();
            }
          } catch (error) {
            console.error("Error deleting business rule:", error);
            toast.error("Failed to delete business rule");
          }
        };

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0 flex items-center justify-center"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
