"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BusinessRules } from "@/schemas/firestore";
import { BusinessRulesTable } from "./business-rules-table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Filter } from "lucide-react";
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
import { Combobox } from "@/components/ui/combobox";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Search } from "@/components/ui/search";

interface UserProfile {
  email: string;
  firstName?: string;
  lastName?: string;
}

interface Props {
  sets: string[];
  selected: string | null;
  onSelect: (val: string) => void;
  mappings: BusinessRules[];
  onRefresh: () => void | Promise<void>;
  users?: UserProfile[];
}

export function BusinessRulesTabs({
  sets,
  selected,
  onSelect,
  mappings,
  onRefresh,
  users = [],
}: Props) {
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>(
    {}
  );
  // Filter state
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  // Tab-specific filter state
  const [filters, setFilters] = useState<
    Record<
      string,
      {
        scope: string;
        dataSource: string;
        field: string;
        targetField: string;
        matchType: string;
      }
    >
  >({});

  // Helper to get/set filters for a tab
  const getTabFilters = (tabId: string) =>
    filters[tabId] || {
      scope: "",
      dataSource: "",
      field: "",
      targetField: "",
      matchType: "",
    };
  const setTabFilter = (
    tabId: string,
    key: keyof (typeof filters)[string],
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [tabId]: { ...getTabFilters(tabId), [key]: value },
    }));
  };
  const clearTabFilters = (tabId: string) => {
    setFilters((prev) => ({
      ...prev,
      [tabId]: {
        scope: "",
        dataSource: "",
        field: "",
        targetField: "",
        matchType: "",
      },
    }));
  };

  if (mappings[0] === undefined) return;

  const agency = mappings[0].agency;

  // Get all unique values for combobox options
  const allDataSources = Array.from(
    new Set(mappings.map((m) => m.dataSource).filter(Boolean))
  );
  const dataSourceOptions = allDataSources.map((v) => ({ value: v, label: v }));
  const allFields = Array.from(
    new Set(mappings.map((m) => m.field).filter((v): v is string => !!v))
  );
  const fieldOptions = allFields.map((v) => ({ value: v, label: v }));
  const allTargetFields = Array.from(
    new Set(mappings.map((m) => m.targetField).filter((v): v is string => !!v))
  );
  const targetFieldOptions = allTargetFields.map((v) => ({
    value: v,
    label: v,
  }));
  const allMatchTypes = Array.from(
    new Set(mappings.map((m) => m.matchType).filter((v): v is string => !!v))
  );
  const matchTypeOptions = allMatchTypes.map((v) => ({ value: v, label: v }));
  const allScopes = Array.from(
    new Set(
      mappings
        .map((m) => [m.country, m.entity, m.agency].filter(Boolean).join("-"))
        .filter(Boolean)
    )
  );
  const scopeOptions = allScopes.map((v) => ({ value: v, label: v }));

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
              return aDate.getTime() - bDate.getTime();
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
        let rows = mappings.filter((m) => m.setId === setId);
        const isMain = rows[0]?.status === "main";

        // Get filters for this tab
        const tabFilters = getTabFilters(setId);
        const { scope, dataSource, field, targetField, matchType } = tabFilters;

        // Only allow scope filter for main tab
        const showScopeFilter = isMain;

        const activeFilterCount = Object.values(tabFilters).filter(
          (v) => v !== ""
        ).length;

        // Apply filters
        if (showScopeFilter && scope) {
          rows = rows.filter(
            (row) =>
              [row.country, row.entity, row.agency]
                .filter(Boolean)
                .join("-") === scope
          );
        }
        if (dataSource) {
          rows = rows.filter((row) => row.dataSource === dataSource);
        }
        if (field) {
          rows = rows.filter((row) => row.field === field);
        }
        if (targetField) {
          rows = rows.filter((row) => row.targetField === targetField);
        }
        if (matchType) {
          rows = rows.filter((row) => row.matchType === matchType);
        }

        const searchQuery = searchQueries[setId] || "";

        // Get draft context for new rule
        const draftContext = rows[0] || {};
        const handleCreateRule = async (rule: unknown) => {
          // Type guard for rule object
          if (typeof rule !== "object" || rule === null) return;
          const r = rule as Record<string, unknown>;
          // Compose the new rule object
          const newRule = {
            ...r,
            setId,
            country: draftContext.country,
            entity: draftContext.entity,
            agency: draftContext.agency,
            status: "draft",
            createdAt: Timestamp.now(),
            createdBy: draftContext.createdBy || "",
          };
          await addDoc(collection(db, "businessRules"), newRule);
          await onRefresh();
        };

        return (
          <TabsContent key={setId} value={setId} className="mt-4 space-y-4">
            <div className="flex justify-between items-center gap-4 flex-wrap">
              <div className="flex gap-2 mr-auto">
                <Search
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(value) =>
                    setSearchQueries((prev) => ({
                      ...prev,
                      [setId]: value,
                    }))
                  }
                  className="h-8 w-48"
                />

                {/* Filters Button and Dialog */}
                <Dialog
                  open={filterDialogOpen && selected === setId}
                  onOpenChange={setFilterDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 relative"
                    >
                      <Filter className="w-4 h-4 mr-1" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xs">
                    <DialogHeader>
                      <DialogTitle>Filters</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      {showScopeFilter && (
                        <Combobox
                          label="Scope"
                          options={scopeOptions}
                          value={scope}
                          onChange={(v) => setTabFilter(setId, "scope", v)}
                          placeholder="Select scope"
                        />
                      )}
                      <Combobox
                        label="Data Source"
                        options={dataSourceOptions}
                        value={dataSource}
                        onChange={(v) => setTabFilter(setId, "dataSource", v)}
                        placeholder="Select data source"
                      />
                      <Combobox
                        label="Field"
                        options={fieldOptions}
                        value={field}
                        onChange={(v) => setTabFilter(setId, "field", v)}
                        placeholder="Select field"
                      />
                      <Combobox
                        label="Target Field"
                        options={targetFieldOptions}
                        value={targetField}
                        onChange={(v) => setTabFilter(setId, "targetField", v)}
                        placeholder="Select target field"
                      />
                      <Combobox
                        label="Match Type"
                        options={matchTypeOptions}
                        value={matchType}
                        onChange={(v) => setTabFilter(setId, "matchType", v)}
                        placeholder="Select match type"
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="secondary"
                        onClick={() => clearTabFilters(setId)}
                      >
                        Clear
                      </Button>
                      <DialogClose asChild>
                        <Button variant="default">Apply</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    const exportData = rows.map(
                      (row: Record<string, unknown>) => {
                        const rest = { ...row };
                        delete rest.id;
                        return rest;
                      }
                    );
                    exportToCSV(exportData, `business_rules_${setId}`);
                  }}
                >
                  Download CSV
                </Button>
              </div>
              <div className="flex gap-2 ">
                {!isMain && (
                  <NewRuleDialog onSubmit={handleCreateRule} agency={agency} />
                )}
                {!isMain && (
                  <PublishDraftDialog
                    setId={setId}
                    rows={rows}
                    onRefresh={onRefresh}
                    mappings={mappings}
                  />
                )}
              </div>
            </div>

            <BusinessRulesTable
              data={rows}
              isEditable={!isMain}
              searchQuery={searchQuery}
              onRefresh={onRefresh}
              scopeFilterActive={showScopeFilter && !!scope}
              dataSourceFilterActive={!!dataSource}
              fieldFilterActive={!!field}
              targetFieldFilterActive={!!targetField}
              matchTypeFilterActive={!!matchType}
              users={users}
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
          className="text-xs font-bold px-1 text-muted-foreground hover:text-destructive h-5 flex items-center justify-center cursor-pointer"
          title="Delete draft"
          style={{ lineHeight: 1 }}
        >
          ×
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

function PublishDraftDialog({
  setId,
  rows,
  onRefresh,
  mappings,
}: {
  setId: string;
  rows: BusinessRules[];
  onRefresh: () => void | Promise<void>;
  mappings: BusinessRules[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const scope = rows[0] as BusinessRules | undefined;
  // Find the main rule for this scope
  let mainRule: BusinessRules | undefined = undefined;
  if (scope) {
    mainRule = (mappings || []).find(
      (m) =>
        m.status === "main" &&
        m.country === scope.country &&
        m.entity === scope.entity &&
        m.agency === scope.agency
    );
  }
  // Find the latest createdAt in the draft
  const draftCreatedAt = rows.reduce(
    (latest: Date | null, row: BusinessRules) => {
      const d = row.createdAt?.toDate
        ? row.createdAt.toDate()
        : row.createdAt instanceof Date
        ? row.createdAt
        : null;
      if (!d) return latest;
      if (!latest || d > latest) return d;
      return latest;
    },
    null
  );
  const mainPublishedAt = mainRule?.publishedAt?.toDate
    ? mainRule.publishedAt.toDate()
    : mainRule?.publishedAt instanceof Date
    ? mainRule.publishedAt
    : null;
  const isOutOfDate =
    mainPublishedAt && draftCreatedAt && draftCreatedAt < mainPublishedAt;
  const handlePublish = async () => {
    setLoading(true);
    const { publishDraftAsMain } = await import("./actions");
    await publishDraftAsMain({
      draftSetId: setId,
      country: scope?.country || "",
      entity: scope?.entity || "",
      agency: scope?.agency || "",
    });
    await onRefresh();
    setLoading(false);
    setOpen(false);
    const scopeString = scope
      ? [scope.country, scope.entity, scope.agency].filter(Boolean).join("-")
      : "-";
    toast.success(`Draft published as main for scope: ${scopeString}`);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="h-8">
          Publish
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Publish Draft as Main</DialogTitle>
        </DialogHeader>
        {isOutOfDate && (
          <div className="mb-1 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm text-yellow-900">
            <b>Warning:</b> This draft was created before the current main was
            published. You might be out of date!
          </div>
        )}
        <div className="py-2 text-sm text-muted-foreground">
          This will publish the current draft as the new <b>Main</b> version{" "}
          <b>
            for scope:{" "}
            {scope
              ? [scope.country, scope.entity, scope.agency]
                  .filter(Boolean)
                  .join("-")
              : "-"}
          </b>
          . The previous main for this scope will be deprecated and all rules in
          this draft will become the new main rules for this scope.
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button variant="default" onClick={handlePublish} disabled={loading}>
            {loading ? "Publishing..." : "Publish"}
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
