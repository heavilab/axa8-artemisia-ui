"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NodeMappings } from "@/schemas/firestore";
import { NodeMappingsTabs } from "./node-mappings-tabs";
import { CreateDraftDialog } from "./create-draft-dialog";
import {
  collection as fbCollection,
  getDocs as fbGetDocs,
} from "firebase/firestore";

export default function NodeMappingsPage() {
  const [nodeMappings, setNodeMappings] = useState<NodeMappings[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<
    { email: string; firstName?: string; lastName?: string }[]
  >([]);

  const fetchNodeMappings = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "nodeMappings"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as NodeMappings[];
      setNodeMappings(data);
    } catch (error) {
      console.error("Error fetching node mappings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchUsers() {
      const snapshot = await fbGetDocs(fbCollection(db, "users"));
      setUsers(
        snapshot.docs.map(
          (doc) =>
            doc.data() as {
              email: string;
              firstName?: string;
              lastName?: string;
            }
        )
      );
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchNodeMappings();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading node mappings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Node Mappings</h1>
        <CreateDraftDialog onRefresh={fetchNodeMappings} />
      </div>

      <NodeMappingsTabs
        nodeMappings={nodeMappings}
        onRefresh={fetchNodeMappings}
        users={users}
      />
    </div>
  );
}
