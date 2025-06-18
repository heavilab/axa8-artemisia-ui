"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BusinessRules } from "@/schemas/firestore";
import { SourceFieldMappingTable } from "./source-field-mapping-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { BookUp, Filter, Plus } from "lucide-react"; // Add this import
import { NewRuleDialog } from "./new-rule-dialog";

interface Props {
  sets: string[];
  selected: string | null;
  onSelect: (val: string) => void;
  mappings: BusinessRules[];
}

export function SourceFieldTabs({ sets, selected, onSelect, mappings }: Props) {
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>(
    {}
  );

  return (
    <Tabs
      value={selected ?? undefined}
      onValueChange={onSelect}
      className="w-full"
    >
      <div className="flex items-end">
        <TabsList className="flex ">
          {[...sets]
            .sort((a, b) => (a === "main" ? -1 : b === "main" ? 1 : 0))
            .map((setId) => {
              const sample = mappings.find((m) => m.setId === setId);
              const isMain = sample?.status === "main";
              const label = isMain ? "Main" : `Draft ${setId}`;

              return (
                <TabsTrigger key={setId} value={setId}>
                  <span className="flex items-center">{label}</span>
                </TabsTrigger>
              );
            })}
        </TabsList>
      </div>

      {sets.map((setId) => {
        const rows = mappings.filter((m) => m.setId === setId);
        const isMain = rows[0]?.status === "main";
        const createdAt = rows[0]?.createdAt?.toDate();
        const createdBy = rows[0]?.createdBy;

        const searchQuery = searchQueries[setId] || "";
        return (
          <TabsContent value={setId} className="mt-4 space-y-4">
            <div className="flex justify-between items-center gap-4 flex-wrap">
              {!isMain && (
                <NewRuleDialog
                  onSubmit={(rule) => alert(JSON.stringify(rule))}
                />
              )}
              {!isMain && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => alert(`TODO: Add rule to ${setId}`)}
                >
                  <BookUp className="w-4 h-4" />
                  Publish as main
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQueries((prev) => ({
                      ...prev,
                      [setId]: e.target.value,
                    }))
                  }
                  className="h-8 w-48"
                />

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    alert("TODO: open filters dropdown");
                  }}
                >
                  <Filter className="w-4 h-4 mr-1" />
                  Filters
                </Button>
              </div>
            </div>

            <SourceFieldMappingTable
              data={rows}
              isEditable={!isMain}
              setId={setId}
              searchQuery={searchQuery}
            />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
