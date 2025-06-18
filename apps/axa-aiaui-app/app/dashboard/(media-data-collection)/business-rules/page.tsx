// app/dashboard/(media-data-collection)/source-field-mappings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { BusinessRules } from "@/schemas/firestore";
import { db } from "@/lib/firebase";
import { collection, query, getDocs } from "firebase/firestore";
import { CreateDraftDialog } from "./create-draft-dialog";
import { SourceFieldTabs } from "./source-field-tabs";

export default function SourceFieldMappingsPage() {
  const [mappings, setMappings] = useState<BusinessRules[]>([]);
  const [activeSetIds, setActiveSetIds] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<string | null>("main");

  useEffect(() => {
    const fetchMappings = async () => {
      const q = query(collection(db, "businessRules"));
      const snapshot = await getDocs(q);
      const all = snapshot.docs.map((doc) => doc.data() as BusinessRules);

      setMappings(all);

      const uniqueSets = Array.from(
        new Set(
          all
            .filter(
              (m) =>
                m.status === "main" ||
                (m.status === "draft" && m.createdBy === "romain@heaviside.fr")
            )
            .map((m) => m.setId)
        )
      );
      setActiveSetIds(uniqueSets);

      if (uniqueSets.includes("main")) {
        setSelectedTab("main");
      } else {
        setSelectedTab(
          uniqueSets.includes("main") ? "main" : uniqueSets[0] || ""
        );
      }
    };

    fetchMappings();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Business Rules</h1>
        <CreateDraftDialog
          onCreate={(info) => console.log("Creating draft with:", info)}
        />
      </div>

      <SourceFieldTabs
        sets={activeSetIds}
        selected={selectedTab}
        onSelect={setSelectedTab}
        mappings={mappings}
      />
    </div>
  );
}
