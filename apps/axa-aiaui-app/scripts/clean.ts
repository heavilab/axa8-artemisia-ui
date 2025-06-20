import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Business Rules paths
const businessRulesPath = path.join(__dirname, "data/businessRules.csv");
const cleanedBusinessRulesPath = path.join(
  __dirname,
  "data/businessRules_cleaned.csv"
);

// Node Mappings paths
const nodeMappingsPath = path.join(__dirname, "data/nodeMappings.csv");
const cleanedNodeMappingsPath = path.join(
  __dirname,
  "data/nodeMappings_cleaned.csv"
);

function kebabCase(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .toLowerCase();
}

// Function to convert snake_case to camelCase
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

function cleanBusinessRules() {
  const raw = fs.readFileSync(businessRulesPath, "utf8");
  const lines = raw.split("\n");
  if (lines.length < 2) return;
  const header = lines[0].split(",");
  const dataSourceIdx = header.indexOf("dataSource");
  const matchTypeIdx = header.indexOf("matchType");
  const cleaned = [header.join(",")];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = lines[i].split(",");
    if (dataSourceIdx !== -1 && cols[dataSourceIdx]) {
      cols[dataSourceIdx] = cols[dataSourceIdx].toLowerCase();
    }
    if (matchTypeIdx !== -1 && cols[matchTypeIdx]) {
      cols[matchTypeIdx] = kebabCase(cols[matchTypeIdx]);
    }
    cleaned.push(cols.join(","));
  }
  fs.writeFileSync(cleanedBusinessRulesPath, cleaned.join("\n"), "utf8");
  console.log("businessRules_cleaned.csv created!");
}

function cleanNodeMappings() {
  try {
    // Read the CSV file
    const csvContent = fs.readFileSync(nodeMappingsPath, "utf-8");
    const lines = csvContent.split("\n");

    if (lines.length === 0) {
      console.log("Empty nodeMappings CSV file");
      return;
    }

    // Parse header
    const header = lines[0].split(",");

    // Find the index of the id and user_id columns to remove them
    const idIndex = header.findIndex((col) => col === "id");
    const userIdIndex = header.findIndex((col) => col === "user_id");

    // Filter and transform header (remove id and user_id columns)
    const cleanedHeader = header
      .filter((_, index) => index !== idIndex && index !== userIdIndex)
      .map((col) => toCamelCase(col));

    // Process data rows
    const cleanedRows = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(",");

      // Check if dataset_id matches nm_1_1743612956
      const datasetIdIndex = header.findIndex((col) => col === "dataset_id");
      if (datasetIdIndex >= 0 && values[datasetIdIndex] === "nm_1_1743612956") {
        // Remove id and user_id columns
        const cleanedValues = values.filter(
          (_, index) => index !== idIndex && index !== userIdIndex
        );
        cleanedRows.push(cleanedValues.join(","));
      }
    }

    // Write cleaned data to new file
    const outputContent = [cleanedHeader.join(","), ...cleanedRows].join("\n");
    fs.writeFileSync(cleanedNodeMappingsPath, outputContent, "utf-8");

    console.log(`nodeMappings_cleaned.csv created!`);
    console.log(`Original rows: ${lines.length - 1}`);
    console.log(`Filtered rows: ${cleanedRows.length}`);
    console.log(`Columns: ${cleanedHeader.length}`);
  } catch (error) {
    console.error("Error cleaning nodeMappings data:", error);
  }
}

function cleanAll() {
  console.log("Cleaning business rules...");
  cleanBusinessRules();

  console.log("Cleaning node mappings...");
  cleanNodeMappings();

  console.log("All cleaning completed!");
}

cleanAll();
