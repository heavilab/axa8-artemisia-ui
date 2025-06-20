"use client";

import { NodeMappings } from "@/schemas/firestore";
import { NodeMappingsTabs } from "./node-mappings-tabs";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UserProfile {
  email: string;
  firstName?: string;
  lastName?: string;
}

export function NodeMappingsTable() {
  const [nodeMappings, setNodeMappings] = useState<NodeMappings[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const nodeMappingsSnapshot = await getDocs(
        collection(db, "nodeMappings")
      );
      const nodeMappingsData = nodeMappingsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as NodeMappings[];

      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = usersSnapshot.docs.map((doc) => ({
        email: doc.id,
        ...doc.data(),
      })) as UserProfile[];

      setNodeMappings(nodeMappingsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <NodeMappingsTabs
        nodeMappings={nodeMappings}
        onRefresh={fetchData}
        users={users}
      />
    </div>
  );
}
