"use client";

import { useEffect, useState, useRef } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BusinessClassificationLevels } from "@/schemas/firestore";
import { exportToCSV } from "@/lib/utils/csv";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import Papa, { ParseResult } from "papaparse";
import { useUser } from "@/lib/hooks/use-user";
import { ChevronDown, ChevronRight, Download, Upload } from "lucide-react";

const REQUIRED_COLUMNS = [
  "term",
  "businessClassificationLevel1",
  "definition",
  "examples",
];

export default function BusinessClassificationLevelsPage() {
  const [data, setData] = useState<
    (BusinessClassificationLevels & { id: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sanityResult, setSanityResult] = useState<null | {
    ok: boolean;
    message: string;
  }>(null);
  const [parsedRows, setParsedRows] = useState<unknown[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState<{ role: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(
    new Set()
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "businessClassificationLevels"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const mapped = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as (BusinessClassificationLevels & { id: string })[];
      setData(mapped);
    } catch (error) {
      console.error("Error fetching business classification levels:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  function sanityCheck(headers: string[]) {
    const missing = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));
    if (missing.length > 0) {
      return { ok: false, message: `Missing columns: ${missing.join(", ")}` };
    }
    return { ok: true, message: "Format OK" };
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<unknown>) => {
        const headers = results.meta.fields || [];
        const check = sanityCheck(headers);
        setSanityResult(check);
        setParsedRows(results.data as unknown[]);
      },
    });
  }

  async function handlePublish() {
    setUploading(true);
    // Remove all existing business classification levels
    const snapshot = await getDocs(
      collection(db, "businessClassificationLevels")
    );
    const deletions = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletions);
    // Add new business classification levels
    for (const row of parsedRows) {
      if (typeof row === "object" && row !== null && "id" in row) {
        const rest = { ...(row as Record<string, unknown>) };
        delete (rest as Record<string, unknown>).id;
        await addDoc(collection(db, "businessClassificationLevels"), rest);
      } else {
        await addDoc(collection(db, "businessClassificationLevels"), row);
      }
    }
    setUploading(false);
    setDialogOpen(false);
    window.location.reload(); // quick way to refresh data
  }

  // Separate parents and children
  const parents = data.filter(
    (item) => item.businessClassificationLevel1 === "/"
  );
  const children = data.filter(
    (item) => item.businessClassificationLevel1 !== "/"
  );

  // Debug logging
  console.log("All data:", data);
  console.log("Parents:", parents);
  console.log("Children:", children);

  // Group children by their parent
  const childrenByParent = children.reduce((acc, child) => {
    const parent = child.businessClassificationLevel1;
    if (!acc[parent]) {
      acc[parent] = [];
    }
    acc[parent].push(child);
    return acc;
  }, {} as Record<string, (BusinessClassificationLevels & { id: string })[]>);

  // Debug logging
  console.log("Children by parent:", childrenByParent);

  const toggleParent = (parentTerm: string) => {
    const newExpanded = new Set(expandedParents);
    if (newExpanded.has(parentTerm)) {
      newExpanded.delete(parentTerm);
    } else {
      newExpanded.add(parentTerm);
    }
    setExpandedParents(newExpanded);
  };

  if (userLoading || profileLoading) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">
            Loading business classification levels...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Business Classification Levels
          </h1>
          <p className="text-muted-foreground mt-2">
            Hierarchical business classification with definitions and examples
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => {
              // Remove Firestore 'id' from each row before export
              const exportData = data.map((row) => {
                const copy = { ...row };
                delete (copy as Record<string, unknown>).id;
                return copy;
              });
              exportToCSV(exportData, "business-classification-levels");
            }}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          {profile?.role === "Admin" && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" className="cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Update
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Update Business Classification Levels
                  </DialogTitle>
                  <DialogDescription>
                    Upload a CSV file with columns: term,
                    businessClassificationLevel1, definition, examples
                  </DialogDescription>
                </DialogHeader>
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="mb-2"
                />
                {sanityResult && (
                  <div
                    className={
                      sanityResult.ok ? "text-green-600" : "text-red-600"
                    }
                  >
                    {sanityResult.message}
                  </div>
                )}
                <DialogFooter>
                  <Button
                    onClick={handlePublish}
                    disabled={!sanityResult?.ok || uploading}
                    className="mt-2"
                  >
                    {uploading ? "Publishing..." : "Publish"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Parent Categories */}
        {parents.map((parent) => {
          const parentChildren = children.filter(
            (child) => child.businessClassificationLevel1 === parent.term
          );
          const isExpanded = expandedParents.has(parent.term);
          const hasChildren = parentChildren.length > 0;

          return (
            <Collapsible
              key={parent.id}
              open={isExpanded}
              onOpenChange={() => toggleParent(parent.term)}
            >
              <div className="border rounded-lg">
                <CollapsibleTrigger asChild>
                  <div className="cursor-pointer hover:bg-muted/50 transition-colors p-4 border-b border-muted/30">
                    <div className="flex items-center gap-3">
                      {hasChildren ? (
                        isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{parent.term}</h3>
                        <p
                          className={`text-sm text-muted-foreground mt-1 ${
                            !isExpanded ? "line-clamp-2" : ""
                          }`}
                        >
                          {parent.definition}
                        </p>
                      </div>
                      {hasChildren && (
                        <Badge variant="secondary">
                          {parentChildren.length} subcategories
                        </Badge>
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                {hasChildren && (
                  <CollapsibleContent>
                    <div className="p-4">
                      <div className="space-y-3 pl-6 border-l-2 border-muted">
                        {parentChildren.map((child) => (
                          <div
                            key={child.id}
                            className="py-3 border-b border-muted/30 last:border-b-0"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm mb-1">
                                  {child.term}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {child.definition}
                                </p>
                              </div>
                              {child.examples && (
                                <Badge
                                  variant="outline"
                                  className="text-xs shrink-0"
                                >
                                  Examples
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                )}
              </div>
            </Collapsible>
          );
        })}
        {/* Show message if no results */}
        {parents.length === 0 && children.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              No business classifications found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
