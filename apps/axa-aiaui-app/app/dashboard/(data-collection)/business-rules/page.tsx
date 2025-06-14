"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { businessRuleSchema } from "@/schemas/firestore";
import { BusinessRule } from "@/schemas/firestore";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Utility to get unique values from an array
function getUnique(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

export default function BusinessRulesPage() {
  const [rules, setRules] = useState<BusinessRule[]>([]);
  const [filteredRules, setFilteredRules] = useState<BusinessRule[]>([]);
  const [filters, setFilters] = useState({
    agency: "all",
    data_source: "all",
    field: "all",
    target_field: "all",
    match_type: "all",
  });

  // All filter values
  const [agencies, setAgencies] = useState<string[]>([]);
  const [dataSources, setDataSources] = useState<string[]>([]);
  const [fields, setFields] = useState<string[]>([]);
  const [targetFields, setTargetFields] = useState<string[]>([]);
  const [matchTypes, setMatchTypes] = useState<string[]>([]);

  useEffect(() => {
    async function fetchRules() {
      const snapshot = await getDocs(collection(db, "business_rules"));
      const parsed = snapshot.docs
        .map((doc) => {
          const data = { ...doc.data(), id: doc.id };
          const result = businessRuleSchema.safeParse(data);
          return result.success ? result.data : null;
        })
        .filter((r): r is z.infer<typeof businessRuleSchema> => !!r);

      setRules(parsed);
      setFilteredRules(parsed);

      // Set unique filter values
      setAgencies(
        getUnique(
          parsed
            .map((r) => r.agency)
            .filter((v): v is string => typeof v === "string")
        )
      );
      setDataSources(
        getUnique(
          parsed
            .map((r) => r.data_source)
            .filter((v): v is string => typeof v === "string")
        )
      );
      setFields(
        getUnique(
          parsed
            .map((r) => r.field)
            .filter((v): v is string => typeof v === "string")
        )
      );
      setTargetFields(
        getUnique(
          parsed
            .map((r) => r.target_field)
            .filter((v): v is string => typeof v === "string")
        )
      );
      setMatchTypes(
        getUnique(
          parsed
            .map((r) => r.match_type)
            .filter((v): v is string => typeof v === "string")
        )
      );
    }

    fetchRules();
  }, []);

  useEffect(() => {
    const filtered = rules.filter(
      (r) =>
        (filters.agency === "all" || r.agency === filters.agency) &&
        (filters.data_source === "all" ||
          r.data_source === filters.data_source) &&
        (filters.field === "all" || r.field === filters.field) &&
        (filters.target_field === "all" ||
          r.target_field === filters.target_field) &&
        (filters.match_type === "all" || r.match_type === filters.match_type)
    );
    setFilteredRules(filtered);
  }, [filters, rules]);

  const renderSelect = (
    label: string,
    field: keyof typeof filters,
    values: string[]
  ) => (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <Select
        value={filters[field]}
        onValueChange={(value) =>
          setFilters((prev) => ({ ...prev, [field]: value }))
        }
      >
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {values.map((v) => (
            <SelectItem key={v} value={v}>
              {v}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Business Rules</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {renderSelect("Agency", "agency", agencies)}
        {renderSelect("Data Source", "data_source", dataSources)}
        {renderSelect("Field", "field", fields)}
        {renderSelect("Target Field", "target_field", targetFields)}
        {renderSelect("Match Type", "match_type", matchTypes)}
      </div>

      <DataTable columns={columns} data={filteredRules} />
    </main>
  );
}
