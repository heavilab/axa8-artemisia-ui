"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BusinessRules } from "@/schemas/firestore";
import { BusinessRulesTable } from "./business-rules-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { BookUp, Building, Filter } from "lucide-react";
import { NewRuleDialog } from "./new-rule-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { exportToCSV } from "@/lib/utils/csv";

interface Props {
  sets: string[];
  selected: string | null;
  onSelect: (val: string) => void;
  mappings: BusinessRules[];
  onRefresh: () => void | Promise<void>;
}

export function BusinessRulesTabs({
  sets,
  selected,
  onSelect,
  mappings,
  onRefresh,
}: Props) {
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>(
    {}
  );

  if (mappings[0] === undefined) return;

  const agency = mappings[0].agency;
  const entity = mappings[0].entity;
  const country = mappings[0].country;

  return (
    <Tabs
      value={selected ?? undefined}
      onValueChange={onSelect}
      className="w-full"
    >
      <div className="flex items-end">
        <TabsList className="flex ">
          {/* Main tab first */}
          {(() => {
            const main = mappings.find((m) => m.status === "main");
            return main ? (
              <TabsTrigger key={main.setId} value={main.setId}>
                <span className="flex items-center">Main</span>
              </TabsTrigger>
            ) : null;
          })()}
          {/* Drafts sorted by createdAt descending */}
          {(() => {
            const draftSets = Array.from(
              new Set(
                mappings.filter((m) => m.status === "draft").map((m) => m.setId)
              )
            );
            // For each draft set, get the latest createdAt from its mappings
            const draftsWithCreatedAt = draftSets.map((setId) => {
              const draftMappings = mappings.filter((m) => m.setId === setId);
              // Find the latest createdAt for this setId
              const latest = draftMappings.reduce((acc, curr) => {
                if (!acc) return curr;
                return dateFromAny(curr.createdAt) > dateFromAny(acc.createdAt)
                  ? curr
                  : acc;
              }, undefined as undefined | BusinessRules);
              return { setId, createdAt: latest?.createdAt };
            });
            draftsWithCreatedAt.sort((a, b) => {
              const aDate = dateFromAny(a.createdAt);
              const bDate = dateFromAny(b.createdAt);
              return bDate.getTime() - aDate.getTime();
            });
            return draftsWithCreatedAt.map(({ setId }) => {
              const sample = mappings.find((m) => m.setId === setId);
              const isMain = sample?.status === "main";
              return (
                <TabsTrigger key={setId} value={setId}>
                  <span className="flex items-center">
                    <div className="flex items-center gap-2">
                      Draft
                      <Badge variant="secondary">{setId}</Badge>
                      {!isMain && (
                        <DeleteDraftDialog
                          setId={setId}
                          onRefresh={onRefresh}
                        />
                      )}
                    </div>
                  </span>
                </TabsTrigger>
              );
            });
          })()}
        </TabsList>
      </div>

      {sets.map((setId) => {
        const rows = mappings.filter((m) => m.setId === setId);
        const isMain = rows[0]?.status === "main";

        const searchQuery = searchQueries[setId] || "";
        return (
          <TabsContent key={setId} value={setId} className="mt-4 space-y-4">
            <div className="flex justify-between items-center gap-4 flex-wrap">
              <div className="flex gap-2 mr-auto">
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
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => exportToCSV(rows, `business_rules_${setId}`)}
                >
                  Download CSV
                </Button>
              </div>
              <div className="flex gap-2 ">
                <Badge variant="secondary">
                  <Building />
                  {country}-{entity}-{agency}
                </Badge>
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
              </div>
            </div>

            <BusinessRulesTable
              data={rows}
              isEditable={!isMain}
              searchQuery={searchQuery}
              onRefresh={onRefresh}
            />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

function DeleteDraftDialog({
  setId,
  onRefresh,
}: {
  setId: string;
  onRefresh: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const { deleteSetById } = await import("./actions");
    await deleteSetById(setId);
    await onRefresh();
    setLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="text-xs font-bold px-1 text-muted-foreground hover:text-destructive"
          title="Delete draft"
          style={{ lineHeight: 1 }}
        >
          X
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Draft</DialogTitle>
        </DialogHeader>
        <p>
          Are you sure you want to delete all rules for draft &quot;{setId}
          &quot;?
        </p>
        <DialogFooter>
          <DialogClose asChild disabled={loading}>
            <Button variant="outline" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function dateFromAny(val: unknown): Date {
  if (
    val &&
    typeof val === "object" &&
    "toDate" in val &&
    typeof (val as Record<string, unknown>).toDate === "function"
  ) {
    return (val as { toDate: () => Date }).toDate();
  }
  if (val instanceof Date) {
    return val;
  }
  if (typeof val === "string" || typeof val === "number") {
    return new Date(val);
  }
  // If it's an object (like Timestamp) but doesn't have toDate, fallback
  return new Date(0);
}
