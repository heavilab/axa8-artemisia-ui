import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import csv from "csv-parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

// Define collection-specific behavior
const collections: Record<string, { enrich?: boolean }> = {
  users: {},
  countries: {},
  businessRules: { enrich: true }, // requires enrichment
  nodeMappings: {}, // regular load
  currencyExchangeRates: {}, // regular load
  dataGlossary: {}, // regular load
  businessClassificationLevels: {}, // regular load
  mediaCategorizations: {}, // regular load
};

async function clearCollection(collectionName: string) {
  const snapshot = await db.collection(collectionName).get();
  const deletions = snapshot.docs.map((doc) => doc.ref.delete());
  await Promise.all(deletions);
  console.log(`🧹 Cleared ${collectionName} (${snapshot.size} docs)`);
}

async function importFromCSV(
  collectionName: string,
  enrich = false,
  status = "main",
  setId = "0"
) {
  const fileName =
    collectionName === "businessRules"
      ? "businessRules_cleaned.csv"
      : collectionName === "nodeMappings"
      ? "nodeMappings_cleaned.csv"
      : `${collectionName}.csv`;
  const filePath = path.join(__dirname, "data", fileName);
  const entries: Record<string, any>[] = [];

  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => entries.push(data))
      .on("end", async () => {
        const batch = db.batch();
        const collectionRef = db.collection(collectionName);

        for (const entry of entries) {
          const docRef = collectionRef.doc();

          let enriched = entry;
          if (enrich) {
            enriched = {
              ...entry,
              setId: setId,
              status: status,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
              publishedAt: Timestamp.now(),
              createdBy: "romain@heaviside.fr",
              emptyFieldRatio: 0,
            };
          } else if (collectionName === "nodeMappings") {
            enriched = {
              ...entry,
              setId: setId,
              status: status,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
              publishedAt: Timestamp.now(),
              createdBy: "romain@heaviside.fr",
            };
          } else if (collectionName === "currencyExchangeRates") {
            enriched = {
              ...entry,
              userId: "romain@heaviside.fr",
              createdAt: new Date(),
              publishedAt: new Date(),
              createdBy: "romain@heaviside.fr",
            };
          } else if (collectionName === "dataGlossary") {
            enriched = {
              ...entry,
              userId: "romain@heaviside.fr",
              createdAt: new Date(),
              publishedAt: new Date(),
              createdBy: "romain@heaviside.fr",
            };
          } else if (collectionName === "businessClassificationLevels") {
            enriched = {
              ...entry,
              userId: "romain@heaviside.fr",
              createdAt: new Date(),
              publishedAt: new Date(),
              createdBy: "romain@heaviside.fr",
            };
          } else if (collectionName === "mediaCategorizations") {
            enriched = {
              ...entry,
              userId: "romain@heaviside.fr",
              createdAt: new Date(),
              publishedAt: new Date(),
              createdBy: "romain@heaviside.fr",
            };
          }

          batch.set(docRef, enriched);
        }

        await batch.commit();
        console.log(`✅ Seeded ${entries.length} ${collectionName}`);
        resolve();
      })
      .on("error", reject);
  });
}

async function seed() {
  console.log("🌱 Seeding Firestore...");

  const collectionNames = Object.keys(collections);

  await Promise.all(collectionNames.map(clearCollection));

  for (const collectionName of collectionNames) {
    const { enrich } = collections[collectionName];
    await importFromCSV(collectionName, enrich);
  }

  console.log("🎉 Done.");
}

seed();
