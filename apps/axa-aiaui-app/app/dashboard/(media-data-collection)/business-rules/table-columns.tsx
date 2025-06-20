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
import { EditRuleDialog } from "./new-rule-dialog";
import { updateDraftRuleById } from "./actions";

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
          {scopeFilterActive && <FilterIcon className="w-3 h-3 text-primary" />}
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
            <FilterIcon className="w-3 h-3 text-primary" />
          )}
        </span>
      ),
    },
    {
      accessorKey: "field",
      header: () => (
        <span className="flex items-center gap-2">
          Field
          {fieldFilterActive && <FilterIcon className="w-3 h-3 text-primary" />}
        </span>
      ),
    },
    {
      accessorKey: "targetField",
      header: () => (
        <span className="flex items-center gap-2">
          Target Field
          {targetFieldFilterActive && (
            <FilterIcon className="w-3 h-3 text-primary" />
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
            <FilterIcon className="w-3 h-3 text-primary" />
          )}
        </span>
      ),
    },
    { accessorKey: "condition", header: "Condition" },
    { accessorKey: "results", header: "Results" },
  ];

  if (!isEditable) return base;

  function ActionCell({
    row,
  }: {
    row: { original: BusinessRules & { id?: string } };
  }) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const rule = row.original;
    const handleDelete = async () => {
      try {
        const docId = rule.id;
        if (!docId) throw new Error("Document ID is missing");
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
    const handleEdit = async (updates: unknown) => {
      try {
        await updateDraftRuleById(
          rule.id as string,
          updates as {
            [key: string]:
              | import("firebase/firestore").FieldValue
              | Partial<unknown>
              | undefined;
          }
        );
        toast.success("Business rule updated successfully");
        if (onRefresh) {
          await onRefresh();
        }
        setEditDialogOpen(false);
      } catch {
        toast.error("Failed to update business rule");
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
              onClick={() => setEditDialogOpen(true)}
              className="focus:text-primary"
              disabled={rule.status !== "draft"}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setConfirmOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <EditRuleDialog
          initialRule={rule}
          onSubmit={handleEdit}
          agency={rule.agency}
          open={editDialogOpen}
          setOpen={setEditDialogOpen}
        />
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
