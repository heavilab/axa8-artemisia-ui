// app/dashboard/country-mappings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DataTable } from "./data-table";
import { columns, CountryMapping } from "./columns";
import { exportToCSV } from "@/lib/utils/csv";
import { Button } from "@/components/ui/button";

export default function CountryMappingsPage() {
  const [data, setData] = useState<CountryMapping[]>([]);

  useEffect(() => {
    async function fetchData() {
      const snapshot = await getDocs(collection(db, "country_mappings"));
      const mapped = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CountryMapping[];
      setData(mapped);
    }

    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Country Mappings</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportToCSV(data, "country_mappings")}
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
