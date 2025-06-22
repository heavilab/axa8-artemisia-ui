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
import { DataGlossary } from "@/schemas/firestore";
import { exportToCSV } from "@/lib/utils/csv";
import { Search } from "@/components/ui/search";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Download, Upload } from "lucide-react";

const REQUIRED_COLUMNS = [
  "priorityOnline",
  "priorityOffline",
  "dataFieldName",
  "outputType",
  "description",
  "example",
];

export default function DataGlossaryPage() {
  const [data, setData] = useState<(DataGlossary & { id: string })[]>([]);
  const [search, setSearch] = useState("");
  const [showMustHaveOnly, setShowMustHaveOnly] = useState(false);
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "dataGlossary"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const mapped = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as (DataGlossary & { id: string })[];
      setData(mapped);
    } catch (error) {
      console.error("Error fetching data glossary:", error);
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
    // Remove all existing data glossary entries
    const snapshot = await getDocs(collection(db, "dataGlossary"));
    const deletions = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletions);
    // Add new data glossary entries
    for (const row of parsedRows) {
      if (typeof row === "object" && row !== null && "id" in row) {
        const rest = { ...(row as Record<string, unknown>) };
        delete (rest as Record<string, unknown>).id;
        await addDoc(collection(db, "dataGlossary"), rest);
      } else {
        await addDoc(collection(db, "dataGlossary"), row);
      }
    }
    setUploading(false);
    setDialogOpen(false);
    window.location.reload(); // quick way to refresh data
  }

  if (userLoading || profileLoading) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading data glossary...</div>
        </div>
      </div>
    );
  }

  const filteredData =
    search.trim() === ""
      ? data
      : data.filter(
          (row) =>
            row.dataFieldName.toLowerCase().includes(search.toLowerCase()) ||
            row.description.toLowerCase().includes(search.toLowerCase())
        );

  const finalData = showMustHaveOnly
    ? filteredData.filter((item) => item.priorityOnline === "MUST HAVE")
    : filteredData;

  // Sort alphabetically by dataFieldName
  const sortedData = finalData.sort((a, b) =>
    a.dataFieldName.localeCompare(b.dataFieldName)
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Data Glossary</h1>
          <p className="text-muted-foreground mt-2">
            Reference guide for data field definitions and specifications
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
              exportToCSV(exportData, "data-glossary");
            }}
          >
            <Download className="w-4 h-4" />
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
                  <DialogTitle>Update Data Glossary</DialogTitle>
                  <DialogDescription>
                    Upload a CSV file with columns: priorityOnline,
                    priorityOffline, dataFieldName, outputType, description,
                    example
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

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <Search
            placeholder="Search field names or descriptions..."
            value={search}
            onChange={setSearch}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showMustHaveOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowMustHaveOnly(!showMustHaveOnly)}
          >
            {showMustHaveOnly ? "✓" : "○"} MUST HAVE Only
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {sortedData.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-mono text-primary">
                  {item.dataFieldName}
                </CardTitle>
                <div className="flex gap-2">
                  {item.priorityOnline && (
                    <Badge
                      variant={
                        item.priorityOnline === "MUST HAVE"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {item.priorityOnline}
                    </Badge>
                  )}
                  <Badge variant="outline">{item.outputType}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  Description
                </h4>
                <p className="text-sm leading-relaxed">{item.description}</p>
              </div>

              {item.example && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                    Example
                  </h4>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {item.example}
                  </code>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  Offline Priority:
                </span>
                {item.priorityOffline && (
                  <Badge
                    variant={
                      item.priorityOffline === "MUST HAVE"
                        ? "default"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    {item.priorityOffline}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No data fields found matching your search.
          </p>
        </div>
      )}
    </div>
  );
}
