import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import csv from "csv-parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

async function clearCollection(collectionName: string) {
  const snapshot = await db.collection(collectionName).get();
  const deletions = snapshot.docs.map((doc) => doc.ref.delete());
  await Promise.all(deletions);
  console.log(`🧹 Cleared ${collectionName} (${snapshot.size} docs)`);
}

async function importCountryMappingsFromCSV() {
  const filePath = path.join(__dirname, "data", "country_mappings.csv");

  const entries: Record<string, any>[] = [];

  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => entries.push(data))
      .on("end", async () => {
        const batch = db.batch();
        const collectionRef = db.collection("country_mappings");

        for (const entry of entries) {
          const docRef = collectionRef.doc(); // auto-ID
          batch.set(docRef, entry);
        }

        await batch.commit();
        console.log(`✅ Seeded ${entries.length} country_mappings`);
        resolve();
      })
      .on("error", reject);
  });
}

async function seed() {
  console.log("🌱 Seeding Firestore...");

  // Step 1: Clear the collection
  await clearCollection("country_mappings");

  // Step 2: Populate from CSV
  await importCountryMappingsFromCSV();

  console.log("🎉 Done.");
}

seed();
