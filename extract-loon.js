import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const thisFile = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(thisFile);
const repoRoot = fs.existsSync(path.join(scriptDir, "README.md"))
  ? scriptDir
  : path.resolve(scriptDir, "..");
const readmePath = path.join(repoRoot, "README.md");
const outputPath = path.join(repoRoot, "loon-rules.json");

const readme = fs.readFileSync(readmePath, "utf8");

const pattern = /\|\s*\d+\s*\|\s*\[\[Loon\]\s*([^\]]+)\]\(([^)]+)\)/g;
const seen = new Set();
const items = [];

let match;
while ((match = pattern.exec(readme)) !== null) {
  const name = match[1].trim();
  const url = match[2].trim();
  const key = `${name}|${url}`;
  if (seen.has(key)) continue;
  seen.add(key);
  items.push({ name, url });
}

fs.writeFileSync(outputPath, JSON.stringify(items, null, 2) + "\n", "utf8");

console.log(`Extracted ${items.length} Loon entries to ${path.basename(outputPath)}`);
