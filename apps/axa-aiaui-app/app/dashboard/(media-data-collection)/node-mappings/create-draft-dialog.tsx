"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Plus } from "lucide-react";
import { addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/lib/hooks/use-user";
import { uniqueNamesGenerator, colors, animals } from "unique-names-generator";
import { toast } from "sonner";

export function CreateDraftDialog({
  onRefresh,
}: {
  onRefresh: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const handleCreateDraft = async () => {
    const userEmail = user?.email || "";
    const now = new Date();
    const baseName = uniqueNamesGenerator({
      dictionaries: [colors, animals],
      separator: "-",
      length: 2,
      style: "lowerCase",
    });
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // 4-digit number
    const newDatasetId = `nm_${baseName}_${randomNumber}`;

    try {
      setLoading(true);

      // Step 1: Get all node mappings with status = main
      const q = query(
        collection(db, "nodeMappings"),
        where("status", "==", "main")
      );

      const snapshot = await getDocs(q);

      // Step 2: Copy each mapping with modified fields
      const batch = snapshot.docs.map((doc) => {
        const original = doc.data();
        const copy = {
          ...original,
          status: "draft",
          datasetId: newDatasetId,
          createdAt: now,
          createdBy: userEmail,
        };
        return addDoc(collection(db, "nodeMappings"), copy);
      });

      await Promise.all(batch);
      console.log(
        `Draft ${newDatasetId} created with ${batch.length} mappings`
      );

      toast.success(`Draft created successfully with ${batch.length} mappings`);

      // Refresh the mappings to show the new draft
      await onRefresh();
      setOpen(false);
    } catch (error) {
      console.error("Error creating draft:", error);
      toast.error("Failed to create draft");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Draft
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Draft</DialogTitle>
          <p className="text-sm text-muted-foreground">
            This will create a draft by copying all node mappings from the
            current <strong>Main</strong> version.
          </p>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            A new draft will be created with a unique dataset ID, containing all
            current main node mappings that you can then modify.
          </p>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={loading}
            onClick={handleCreateDraft}
            className="cursor-pointer"
          >
            {loading ? "Creating..." : "Create Draft"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
