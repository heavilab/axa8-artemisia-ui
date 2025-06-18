"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { exportToCSV } from "@/lib/utils/csv";
import { Button } from "@/components/ui/button";
import { Country } from "@/schemas/firestore";

export default function Page() {
  const [data, setData] = useState<Country[]>([]);

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

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Countries</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportToCSV(data, "countries")}
          >
            Download CSV
          </Button>
          <Button variant="outline" disabled>
            Upload
          </Button>
          <Button variant="default" disabled>
            Publish
          </Button>
        </div>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
