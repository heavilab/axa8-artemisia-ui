"use client";

import { ColumnDef } from "@tanstack/react-table";
import { NodeMappings } from "@/schemas/firestore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Filter as FilterIcon,
  ChevronsUpDown,
} from "lucide-react";
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
import { getDataSourceIcon } from "@/lib/utils/icon-utils";

export type NodeMapping = {
  id: string;
  dataSource: string;
  advertiser: string;
  nodeName: string;
  fundingEntity: string;
  mediaLevel_1: string;
  startDate: string;
  endDate: string;
  datasetId: string;
  createdAt: any;
  publishedAt?: any;
  createdBy: string;
};

export function getColumns({
  isEditable,
  onRefresh,
  dataSourceFilterActive = false,
  showActions = false,
}: {
  isEditable: boolean;
  onRefresh?: () => void | Promise<void>;
  dataSourceFilterActive?: boolean;
  showActions?: boolean;
}): ColumnDef<NodeMappings>[] {
  const base: ColumnDef<NodeMappings>[] = [
    {
      accessorKey: "dataSource",
      enableSorting: true,
      header: ({ column }) => {
        return (
          <button
            className="flex items-center gap-2 select-none hover:underline"
            onClick={column.getToggleSortingHandler()}
            type="button"
          >
            Data Source
            <ChevronsUpDown className="w-3 h-3 ml-1 text-muted-foreground" />
          </button>
        );
      },
      cell: ({ row }) => {
        const value = row.original.dataSource;
        const { Icon, iconProps } = getDataSourceIcon(value);
        return (
          <span className="flex items-center gap-2">
            <Icon {...iconProps} />
            <span>{value}</span>
          </span>
        );
      },
    },
    {
      accessorKey: "advertiser",
      enableSorting: true,
      header: ({ column }) => (
        <button
          className="flex items-center gap-2 select-none hover:underline"
          onClick={column.getToggleSortingHandler()}
          type="button"
        >
          Advertiser
          <ChevronsUpDown className="w-3 h-3 ml-1 text-muted-foreground" />
        </button>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-medium">
              {row.getValue("advertiser")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "nodeName",
      enableSorting: true,
      header: ({ column }) => (
        <button
          className="flex items-center gap-2 select-none hover:underline"
          onClick={column.getToggleSortingHandler()}
          type="button"
        >
          Node Name
          <ChevronsUpDown className="w-3 h-3 ml-1 text-muted-foreground" />
        </button>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-medium">
              {row.getValue("nodeName")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "fundingEntity",
      enableSorting: true,
      header: ({ column }) => (
        <button
          className="flex items-center gap-2 select-none hover:underline"
          onClick={column.getToggleSortingHandler()}
          type="button"
        >
          Funding Entity
          <ChevronsUpDown className="w-3 h-3 ml-1 text-muted-foreground" />
        </button>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-medium">
              {row.getValue("fundingEntity")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "mediaLevel_1",
      enableSorting: true,
      header: ({ column }) => (
        <button
          className="flex items-center gap-2 select-none hover:underline"
          onClick={column.getToggleSortingHandler()}
          type="button"
        >
          Media Level 1
          <ChevronsUpDown className="w-3 h-3 ml-1 text-muted-foreground" />
        </button>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-medium">
              {row.getValue("mediaLevel_1")}
            </span>
          </div>
        );
      },
    },
  ];

  if (!showActions) return base;

  return [
    ...base,
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => <ActionCell row={row} />,
    },
  ];

  function ActionCell({
    row,
  }: {
    row: { original: NodeMappings & { id?: string } };
  }) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const handleDelete = async () => {
      if (!row.original.id) {
        toast.error("No document ID found");
        return;
      }

      try {
        await deleteDoc(doc(db, "nodeMappings", row.original.id));
        toast.success("Node mapping deleted successfully");
        setIsDeleteDialogOpen(false);
        onRefresh?.();
      } catch (error) {
        console.error("Error deleting node mapping:", error);
        toast.error("Failed to delete node mapping");
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
              <span className="sr-only">Open menu</span>
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Node Mapping</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete this node mapping?</p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }
}
