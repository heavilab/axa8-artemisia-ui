"use client";

import { useEffect, useState, useRef } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { exportToCSV } from "@/lib/utils/csv";
import { Button } from "@/components/ui/button";
import { Country } from "@/schemas/firestore";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import Papa, { ParseResult } from "papaparse";
import { Input } from "@/components/ui/input";
import { useUser } from "@/lib/hooks/use-user";

const REQUIRED_COLUMNS = ["country", "data_currency", "language"];

export default function Page() {
  const [data, setData] = useState<Country[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sanityResult, setSanityResult] = useState<null | {
    ok: boolean;
    message: string;
  }>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState<{ role: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const snapshot = await getDocs(collection(db, "countries"));
      const mapped = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Country[];
      setData(mapped);
    }

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
      complete: (results: ParseResult<any>) => {
        const headers = results.meta.fields || [];
        const check = sanityCheck(headers);
        setSanityResult(check);
        setParsedRows(results.data as any[]);
      },
    });
  }

  async function handlePublish() {
    setUploading(true);
    // Remove all existing countries
    const snapshot = await getDocs(collection(db, "countries"));
    const deletions = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletions);
    // Add new countries
    for (const row of parsedRows) {
      // Ignore 'id' column if present
      const { id, ...rest } = row;
      await addDoc(collection(db, "countries"), rest);
    }
    setUploading(false);
    setDialogOpen(false);
    window.location.reload(); // quick way to refresh data
  }

  if (userLoading || profileLoading) {
    return null;
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Countries</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              // Remove Firestore 'id' from each row before export
              const exportData = data.map(({ id, ...rest }) => rest);
              exportToCSV(exportData, "countries");
            }}
          >
            Download CSV
          </Button>
          {profile?.role === "Admin" && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default">Update</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Countries</DialogTitle>
                  <DialogDescription>
                    Upload a CSV file with columns: country, data_currency,
                    language
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
      <div className="mb-2 max-w-xs">
        <Input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <DataTable
        columns={columns}
        data={
          search.trim() === ""
            ? data
            : data.filter((row) =>
                Object.values(row)
                  .join(" ")
                  .toLowerCase()
                  .includes(search.toLowerCase())
              )
        }
      />
    </div>
  );
}
