"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NodeMappings } from "@/schemas/firestore";
import { NodeMappingsTabs } from "./node-mappings-tabs";
import { CreateDraftDialog } from "./create-draft-dialog";
import { useUser } from "@/lib/hooks/use-user";

export default function NodeMappingsPage() {
  const [nodeMappings, setNodeMappings] = useState<NodeMappings[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<
    { email: string; firstName?: string; lastName?: string }[]
  >([]);
  const { user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState<{ role: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

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
      const snapshot = await getDocs(collection(db, "users"));
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
    async function fetchProfile() {
      if (user?.email) {
        const q = query(
          collection(db, "users"),
          where("email", "==", user.email)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setProfile(snapshot.docs[0].data() as { role: string });
        }
      }
      setProfileLoading(false);
    }
    if (!userLoading) {
      fetchProfile();
    }
  }, [user, userLoading]);

  useEffect(() => {
    fetchNodeMappings();
  }, []);

  if (loading || userLoading || profileLoading) {
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
        <div>
          <h1 className="text-2xl font-semibold">Node Mappings</h1>
          <p className="text-muted-foreground mt-2">
            This page enables completing fields manually for various mapping
            levels.
          </p>
        </div>
        {profile?.role !== "Readonly" && (
          <CreateDraftDialog onRefresh={fetchNodeMappings} />
        )}
      </div>

      <NodeMappingsTabs
        nodeMappings={nodeMappings}
        onRefresh={fetchNodeMappings}
        users={users}
        userRole={profile?.role}
      />
    </div>
  );
}
