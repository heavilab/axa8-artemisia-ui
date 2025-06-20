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
import { MoreVertical, Trash2, Filter as FilterIcon } from "lucide-react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function getColumns({
  isEditable,
  onRefresh,
  scopeFilterActive = false,
  dataSourceFilterActive = false,
  fieldFilterActive = false,
  targetFieldFilterActive = false,
  matchTypeFilterActive = false,
}: {
  isEditable: boolean;
  onRefresh?: () => void | Promise<void>;
  scopeFilterActive?: boolean;
  dataSourceFilterActive?: boolean;
  fieldFilterActive?: boolean;
  targetFieldFilterActive?: boolean;
  matchTypeFilterActive?: boolean;
}): ColumnDef<BusinessRules>[] {
  const base: ColumnDef<BusinessRules>[] = [
    {
      id: "scope",
      header: () => (
        <span className="flex items-center gap-2">
          Scope
          {scopeFilterActive && <FilterIcon className="w-4 h-4 text-primary" />}
        </span>
      ),
      cell: ({ row }) => {
        const { country, entity, agency } = row.original;
        const scope = [country, entity, agency].filter(Boolean).join("-");
        return <Badge variant="secondary">{scope}</Badge>;
      },
    },
    {
      accessorKey: "dataSource",
      header: () => (
        <span className="flex items-center gap-2">
          Data Source
          {dataSourceFilterActive && (
            <FilterIcon className="w-4 h-4 text-primary" />
          )}
        </span>
      ),
    },
    {
      accessorKey: "field",
      header: () => (
        <span className="flex items-center gap-2">
          Field
          {fieldFilterActive && <FilterIcon className="w-4 h-4 text-primary" />}
        </span>
      ),
    },
    {
      accessorKey: "targetField",
      header: () => (
        <span className="flex items-center gap-2">
          Target Field
          {targetFieldFilterActive && (
            <FilterIcon className="w-4 h-4 text-primary" />
          )}
        </span>
      ),
    },
    {
      accessorKey: "matchType",
      header: () => (
        <span className="flex items-center gap-2">
          Match Type
          {matchTypeFilterActive && (
            <FilterIcon className="w-4 h-4 text-primary" />
          )}
        </span>
      ),
    },
    { accessorKey: "condition", header: "Condition" },
    { accessorKey: "results", header: "Results" },
  ];

  if (!isEditable) return base;

  function ActionCell({ row }: { row: unknown }) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const handleDelete = async () => {
      try {
        const docId = (row as { original: { id: string } }).original.id;
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
      <>
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
              onClick={() => setConfirmOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Business Rule</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete this business rule?</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  await handleDelete();
                  setConfirmOpen(false);
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return [
    ...base,
    {
      id: "actions",
      cell: ({ row }) => <ActionCell row={row} />,
    },
  ];
}
