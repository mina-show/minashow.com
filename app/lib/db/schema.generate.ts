/**
 * AUTO-GENERATES app/lib/db/schema.ts
 *
 * Consolidates all schema files from app/lib/db/schemas/ into a single export.
 * Run via: task generate:db
 */
import { glob } from "glob";
import { writeFileSync } from "fs";
import path from "path";

const schemaDir = path.resolve(import.meta.dir, "schemas");
const outFile = path.resolve(import.meta.dir, "schema.ts");

const files = (await glob(`${schemaDir}/*.ts`)).sort();

if (files.length === 0) {
  writeFileSync(
    outFile,
    `// No schema files found in app/lib/db/schemas/\n// Add *.ts files there and run task generate:db\nexport {};\n`
  );
  console.log("⚠️  No schema files found — wrote empty schema.ts");
} else {
  const exports = files
    .map((f) => {
      const name = path.basename(f, ".ts");
      return `export * from "./schemas/${name}";`;
    })
    .join("\n");

  writeFileSync(outFile, `// AUTO-GENERATED — do not edit\n${exports}\n`);
  console.log(`✅ Generated schema.ts from ${files.length} schema file(s)`);
}
