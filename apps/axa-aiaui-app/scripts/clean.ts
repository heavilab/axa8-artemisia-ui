import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.join(__dirname, "data/businessRules.csv");
const cleanedCsvPath = path.join(__dirname, "data/businessRules_cleaned.csv");

function kebabCase(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .toLowerCase();
}

function cleanCSV() {
  const raw = fs.readFileSync(csvPath, "utf8");
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
  fs.writeFileSync(cleanedCsvPath, cleaned.join("\n"), "utf8");
  console.log("businessRules_cleaned.csv created!");
}

cleanCSV();
