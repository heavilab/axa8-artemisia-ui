"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getColumns } from "./columns";
import { DataTable } from "./data-table";
import { businessRuleSchema, BusinessRule } from "@/schemas/firestore";
import { z } from "zod";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Utility to get unique values
function getUnique(arr: (string | undefined)[]): string[] {
  return Array.from(new Set(arr.filter((v): v is string => !!v)));
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

      setAgencies(getUnique(parsed.map((r) => r.agency)));
      setDataSources(getUnique(parsed.map((r) => r.data_source)));
      setFields(getUnique(parsed.map((r) => r.field)));
      setTargetFields(getUnique(parsed.map((r) => r.target_field)));
      setMatchTypes(getUnique(parsed.map((r) => r.match_type)));
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
    <div className="flex flex-col gap-2 w-[200px]">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select
        value={filters[field]}
        onValueChange={(value) =>
          setFilters((prev) => ({ ...prev, [field]: value }))
        }
      >
        <SelectTrigger className="w-full h-9">
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent className="max-h-none">
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

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== "all"
  ).length;

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Business Rules</h1>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex justify-end">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge
                  variant="secondary"
                  className="rounded-full px-2 py-0 text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="p-4  flex flex-col gap-4">
          {renderSelect("Agency", "agency", agencies)}
          {renderSelect("Data Source", "data_source", dataSources)}
          {renderSelect("Field", "field", fields)}
          {renderSelect("Target Field", "target_field", targetFields)}
          {renderSelect("Match Type", "match_type", matchTypes)}
        </DropdownMenuContent>
      </DropdownMenu>

      <DataTable columns={getColumns(filters)} data={filteredRules} />
    </main>
  );
}
