"use client";

import { useEffect, useState, useRef } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  deleteDoc,
  addDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MediaCategorizations } from "@/schemas/firestore";
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
import { ChevronDown, ChevronRight, FileSpreadsheet } from "lucide-react";

const REQUIRED_COLUMNS = ["name", "parentName", "definition", "dataType"];

export default function MediaCategorizationsPage() {
  const [data, setData] = useState<(MediaCategorizations & { id: string })[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(
    new Set()
  );
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const q = query(
        collection(db, "mediaCategorizations"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const mapped = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as (MediaCategorizations & { id: string })[];
      setData(mapped);
      setLoading(false);
    };
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
    // Remove all existing media categorizations
    const snapshot = await getDocs(collection(db, "mediaCategorizations"));
    const deletions = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletions);
    // Add new media categorizations
    for (const row of parsedRows) {
      if (typeof row === "object" && row !== null && "id" in row) {
        const rest = { ...(row as Record<string, unknown>) };
        delete (rest as Record<string, unknown>).id;
        await addDoc(collection(db, "mediaCategorizations"), rest);
      } else {
        await addDoc(collection(db, "mediaCategorizations"), row);
      }
    }
    setUploading(false);
    setDialogOpen(false);
    window.location.reload(); // quick way to refresh data
  }

  // Separate parents and children
  const parents = data.filter((item) => item.parentName === "/");
  const children = data.filter((item) => item.parentName !== "/");

  // Group children by their parent
  const childrenByParent = children.reduce((acc, child) => {
    const parent = child.parentName;
    if (!acc[parent]) {
      acc[parent] = [];
    }
    acc[parent].push(child);
    return acc;
  }, {} as Record<string, (MediaCategorizations & { id: string })[]>);

  const toggleParent = (parentName: string) => {
    const newExpanded = new Set(expandedParents);
    if (newExpanded.has(parentName)) {
      newExpanded.delete(parentName);
    } else {
      newExpanded.add(parentName);
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
            Loading media categorizations...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Media Categorizations</h1>
          <p className="text-muted-foreground mt-2">
            Hierarchical media categorizations with definitions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => {
              const exportData = data.map((row) => {
                const copy = { ...row };
                delete (copy as Record<string, unknown>).id;
                return copy;
              });
              exportToCSV(exportData, "media-categorizations");
            }}
          >
            Download
            <FileSpreadsheet className="h-4 w-4 ml-1" />
          </Button>
          {profile?.role === "Admin" && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" className="cursor-pointer">
                  Update
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Media Categorizations</DialogTitle>
                  <DialogDescription>
                    Upload a CSV file with columns: name, parentName,
                    definition, dataType
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
          const filteredParentChildren = children.filter(
            (child) => child.parentName === parent.name
          );
          const isExpanded = expandedParents.has(parent.name);
          const hasChildren = filteredParentChildren.length > 0;

          return (
            <Collapsible
              key={parent.id}
              open={isExpanded}
              onOpenChange={() => toggleParent(parent.name)}
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
                        <h3 className="text-lg font-semibold">{parent.name}</h3>
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
                          {filteredParentChildren.length} subcategories
                        </Badge>
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                {hasChildren && (
                  <CollapsibleContent>
                    <div className="p-4">
                      <div className="space-y-3 pl-6 border-l-2 border-muted">
                        {filteredParentChildren.map((child) => (
                          <div
                            key={child.id}
                            className="py-3 border-b border-muted/30 last:border-b-0"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm mb-1">
                                  {child.name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {child.definition}
                                </p>
                              </div>
                              {child.dataType && (
                                <Badge
                                  variant="outline"
                                  className="text-xs shrink-0"
                                >
                                  {child.dataType}
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
        {parents.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              No media categorizations available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
