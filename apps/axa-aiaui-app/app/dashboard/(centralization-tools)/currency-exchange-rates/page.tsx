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
import { CurrencyExchangeRates } from "@/schemas/firestore";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { exportToCSV } from "@/lib/utils/csv";
import { Search } from "@/components/ui/search";
import { Button } from "@/components/ui/button";
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

const REQUIRED_COLUMNS = ["forex", "value", "date"];

export default function CurrencyExchangeRatesPage() {
  const [data, setData] = useState<CurrencyExchangeRates[]>([]);
  const [search, setSearch] = useState("");
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
        collection(db, "currencyExchangeRates"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const mapped = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CurrencyExchangeRates[];
      setData(mapped);
    } catch (error) {
      console.error("Error fetching currency exchange rates:", error);
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
    // Remove all existing currency exchange rates
    const snapshot = await getDocs(collection(db, "currencyExchangeRates"));
    const deletions = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletions);
    // Add new currency exchange rates
    for (const row of parsedRows) {
      if (typeof row === "object" && row !== null && "id" in row) {
        const rest = { ...(row as Record<string, unknown>) };
        delete (rest as Partial<typeof rest>).id;
        await addDoc(collection(db, "currencyExchangeRates"), rest);
      } else {
        await addDoc(collection(db, "currencyExchangeRates"), row);
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
          <div className="text-muted-foreground">
            Loading currency exchange rates...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Currency Exchange Rates</h1>
        <div className="flex gap-2">
          {profile?.role === "Admin" && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default">Update</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Currency Exchange Rates</DialogTitle>
                  <DialogDescription>
                    Upload a CSV file with columns: forex, value, date
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
      <div className="flex items-center gap-2">
        <div className="flex-1 max-w-xs">
          <Search placeholder="Search..." value={search} onChange={setSearch} />
        </div>
        <Button
          variant="outline"
          onClick={() => {
            // Remove Firestore 'id' from each row before export
            const exportData = data.map((row) => {
              const copy = { ...row };
              delete (copy as Partial<typeof copy>).id;
              return copy;
            });
            exportToCSV(exportData, "currency-exchange-rates");
          }}
        >
          Download CSV
        </Button>
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
