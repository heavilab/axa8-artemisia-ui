"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NodeMappings } from "@/schemas/firestore";
import { DataTable } from "../business-rules/data-table";
import { getColumns } from "./table-columns";
import { Search } from "@/components/ui/search";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateDraftDialog } from "./create-draft-dialog";
import {
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface UserProfile {
  email: string;
  firstName?: string;
  lastName?: string;
}

interface Props {
  nodeMappings: NodeMappings[];
  onRefresh: () => void | Promise<void>;
  users?: UserProfile[];
}

export function NodeMappingsTabs({
  nodeMappings,
  onRefresh,
  users = [],
}: Props) {
  const [selectedTab, setSelectedTab] = useState<string>("main");
  const [searchQuery, setSearchQuery] = useState("");

  // Get unique dataset IDs for drafts
  const draftDatasetIds = Array.from(
    new Set(
      nodeMappings
        .filter((m) => m.status === "draft" && m.datasetId)
        .map((m) => m.datasetId!)
    )
  );

  // Filter mappings based on selected tab and search query
  const filteredMappings = nodeMappings.filter((mapping) => {
    // Filter by status (main or draft)
    if (selectedTab === "main" && mapping.status !== "main") return false;
    if (selectedTab === "drafts" && mapping.status !== "draft") return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchableFields = [
        mapping.dataSource,
        mapping.field,
        mapping.targetField,
        mapping.matchType,
      ]
        .join(" ")
        .toLowerCase();
      if (!searchableFields.includes(query)) return false;
    }

    return true;
  });

  const columns = getColumns({
    onRefresh,
  });

  const draftColumns = getColumns({
    onRefresh,
    showActions: true,
  });

  return (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
      <div className="flex items-center justify-between mb-4">
        <TabsList>
          <TabsTrigger value="main">
            <span className="flex items-center">Main</span>
          </TabsTrigger>
          {draftDatasetIds.map((datasetId) => (
            <TabsTrigger key={datasetId} value={datasetId}>
              <span className="flex items-center gap-2">
                Draft
                <Badge variant="secondary">{datasetId}</Badge>
                <DeleteDraftDialog
                  datasetId={datasetId}
                  onRefresh={onRefresh}
                />
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="main" className="space-y-4">
        <div className="flex items-center gap-2">
          <Search
            placeholder="Search node mappings..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-64"
          />
        </div>
        <DataTable columns={columns} data={filteredMappings} users={users} />
      </TabsContent>

      {draftDatasetIds.map((datasetId) => (
        <TabsContent key={datasetId} value={datasetId} className="space-y-4">
          <div className="flex items-center gap-2">
            <Search
              placeholder="Search node mappings..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="w-64"
            />
          </div>
          <DataTable
            columns={draftColumns}
            data={nodeMappings.filter(
              (m) => m.datasetId === datasetId && m.datasetId
            )}
            users={users}
          />
        </TabsContent>
      ))}

      {draftDatasetIds.length === 0 && (
        <TabsContent value="drafts" className="space-y-4">
          <div className="flex items-center justify-end">
            <CreateDraftDialog onRefresh={onRefresh} />
          </div>
        </TabsContent>
      )}
    </Tabs>
  );
}

function DeleteDraftDialog({
  datasetId,
  onRefresh,
}: {
  datasetId: string;
  onRefresh: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // Find all node mappings with this datasetId
      const nodeMappingsRef = collection(db, "nodeMappings");
      const q = query(nodeMappingsRef, where("datasetId", "==", datasetId));
      const querySnapshot = await getDocs(q);

      // Delete all documents in the batch
      const deletePromises = querySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      toast.success(`Draft "${datasetId}" deleted successfully`);
      await onRefresh();
    } catch (error) {
      console.error("Error deleting draft:", error);
      toast.error("Failed to delete draft");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="text-xs font-bold px-1 text-muted-foreground hover:text-destructive h-5 flex items-center justify-center cursor-pointer"
          title="Delete draft"
          style={{ lineHeight: 1 }}
        >
          ×
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Draft</DialogTitle>
        </DialogHeader>
        <p>
          Are you sure you want to delete all node mappings for draft &quot;
          {datasetId}
          &quot;?
        </p>
        <DialogFooter>
          <DialogClose asChild disabled={loading}>
            <Button variant="outline" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
