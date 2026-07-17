import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET_DIRS = ["src", "data", "public", "docs", "android"];
const BAD_PATTERNS = ["�", "\\uFFFD", "Ø", "Ù", "Ã", "ï¿½", "????"];

type ReportEntry = {
  file: string;
  field: string;
  snippet: string;
  occurrences: number;
};

function isTextFile(filePath: string) {
  return [".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".txt", ".html", ".css", ".xml", ".yml", ".yaml"].includes(path.extname(filePath).toLowerCase());
}

function walk(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (entry.isFile() && isTextFile(fullPath)) {
      files.push(fullPath);
    }
  }
  return files;
}

const reports: ReportEntry[] = [];

for (const dir of TARGET_DIRS) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) continue;
  for (const file of walk(abs)) {
    const text = fs.readFileSync(file, "utf8");
    for (const pattern of BAD_PATTERNS) {
      let index = text.indexOf(pattern);
      while (index >= 0) {
        const start = Math.max(0, index - 24);
        const end = Math.min(text.length, index + pattern.length + 24);
        reports.push({
          file: path.relative(ROOT, file),
          field: pattern,
          snippet: text.slice(start, end).replace(/\s+/g, " "),
          occurrences: 1,
        });
        index = text.indexOf(pattern, index + pattern.length);
      }
    }
  }
}

const grouped = new Map<string, ReportEntry>();
for (const entry of reports) {
  const key = `${entry.file}:${entry.field}:${entry.snippet}`;
  const current = grouped.get(key);
  if (current) current.occurrences += 1;
  else grouped.set(key, { ...entry });
}

const output = [...grouped.values()].sort((a, b) => a.file.localeCompare(b.file));
for (const entry of output) {
  console.log(`${entry.file} | ${entry.field} | ${entry.occurrences} | ${entry.snippet}`);
}

console.log(`TOTAL ${output.length}`);
