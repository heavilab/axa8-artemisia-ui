"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DataTable } from "../business-rules/data-table";
import { getColumns } from "./table-columns";
import { NodeMappings } from "@/schemas/firestore";
import { useUser } from "@/lib/hooks/use-user";

export function NodeMappingsTable() {
  const [nodeMappings, setNodeMappings] = useState<NodeMappings[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

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
    fetchNodeMappings();
  }, []);

  const columns = getColumns({
    isEditable: true,
    onRefresh: fetchNodeMappings,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading node mappings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Node Mappings</h2>
          <p className="text-muted-foreground">
            Manage data source field mappings and transformations.
          </p>
        </div>
      </div>
      <DataTable columns={columns} data={nodeMappings} />
    </div>
  );
}
