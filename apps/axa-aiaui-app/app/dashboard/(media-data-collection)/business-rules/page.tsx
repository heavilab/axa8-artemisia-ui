// app/dashboard/(media-data-collection)/source-field-mappings/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { BusinessRules } from "@/schemas/firestore";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, where, addDoc } from "firebase/firestore";
import { CreateDraftDialog } from "./create-draft-dialog";
import { BusinessRulesTabs } from "./business-rules-tabs";
import { uniqueNamesGenerator, colors, animals } from "unique-names-generator";
import { useUser } from "@/lib/hooks/use-user";
import {
  collection as fbCollection,
  getDocs as fbGetDocs,
} from "firebase/firestore";

export default function SourceFieldMappingsPage() {
  const [mappings, setMappings] = useState<BusinessRules[]>([]);
  const [activeSetIds, setActiveSetIds] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<string | null>("main");
  const { user } = useUser();
  const [users, setUsers] = useState<
    { email: string; firstName?: string; lastName?: string }[]
  >([]);
  const [profile, setProfile] = useState<{ role: string } | null>(null);

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
    }
    if (user?.email) {
      fetchProfile();
    }
  }, [user?.email]);

  const fetchMappings = useCallback(async () => {
    const q = query(collection(db, "businessRules"));
    const snapshot = await getDocs(q);
    const all = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as unknown as BusinessRules)
    );

    console.log("All business rules:", all);
    console.log("Current user email:", user?.email);

    setMappings(all);

    const uniqueSets = Array.from(
      new Set(
        all
          .filter(
            (m) =>
              m.status === "main" ||
              (m.status === "draft" && m.createdBy === user?.email)
          )
          .map((m) => m.setId)
      )
    );

    console.log("Filtered sets:", uniqueSets);
    console.log(
      "Drafts for current user:",
      all.filter((m) => m.status === "draft" && m.createdBy === user?.email)
    );

    setActiveSetIds(uniqueSets);
  }, [user?.email]);

  useEffect(() => {
    fetchMappings();
  }, [fetchMappings]);

  // Optionally, set default tab to 'main' only on initial mount
  useEffect(() => {
    if (
      (!selectedTab || !activeSetIds.includes(selectedTab)) &&
      activeSetIds.length > 0
    ) {
      setSelectedTab(activeSetIds.includes("main") ? "main" : activeSetIds[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSetIds]);

  const handleCreateDraft = async ({
    agency,
    entity,
    country,
  }: {
    agency: string;
    entity: string;
    country: string;
  }) => {
    const userEmail = user?.email || "";
    const now = new Date();
    const baseName = uniqueNamesGenerator({
      dictionaries: [colors, animals],
      separator: "-",
      length: 2,
      style: "lowerCase",
    });
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // 4-digit number
    const newSetId = `${baseName}-${randomNumber}`;

    // Step 1: Get all business rules with status = main and matching the selected filters
    const q = query(
      collection(db, "businessRules"),
      where("status", "==", "main"),
      where("agency", "==", agency),
      where("entity", "==", entity),
      where("country", "==", country)
    );

    const snapshot = await getDocs(q);

    // Step 2: Copy each rule with modified fields
    const batch = snapshot.docs.map((doc) => {
      const original = doc.data();
      const copy = {
        ...original,
        status: "draft",
        setId: newSetId,
        createdAt: now,
        createdBy: userEmail,
      };
      return addDoc(collection(db, "businessRules"), copy);
    });

    await Promise.all(batch);
    console.log(`Draft ${newSetId} created with ${batch.length} rules`);

    // Refresh the mappings to show the new draft
    await fetchMappings();
    setSelectedTab(newSetId);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Business Rules</h1>
        {profile?.role !== "Readonly" && (
          <CreateDraftDialog
            onCreate={handleCreateDraft}
            onRefresh={fetchMappings}
          />
        )}
      </div>

      <BusinessRulesTabs
        sets={activeSetIds}
        selected={selectedTab}
        onSelect={setSelectedTab}
        mappings={mappings}
        onRefresh={fetchMappings}
        users={users}
      />
    </div>
  );
}
