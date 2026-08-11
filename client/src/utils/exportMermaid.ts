import type { SchemaSnapshot } from "../types/schema";

function sanitize(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, "_");
}

export function toMermaidErDiagram(snapshot: SchemaSnapshot): string {
  const lines: string[] = ["erDiagram"];

  for (const table of snapshot.tables) {
    const id = sanitize(`${table.schema}_${table.name}`);
    lines.push(`  ${id} {`);
    for (const col of table.columns) {
      const type = col.dataType.replace(/\s+/g, "_");
      const flags = [col.isPrimaryKey ? "PK" : "", col.isForeignKey ? "FK" : ""].filter(Boolean).join(",");
      lines.push(`    ${type} ${col.name}${flags ? ` "${flags}"` : ""}`);
    }
    lines.push("  }");
  }

  for (const rel of snapshot.relationships) {
    const from = sanitize(`${rel.fromSchema}_${rel.fromTable}`);
    const to = sanitize(`${rel.toSchema}_${rel.toTable}`);
    lines.push(`  ${from} ||--o{ ${to} : "${rel.fromColumn}"`);
  }

  return lines.join("\n");
}

export function downloadMermaid(snapshot: SchemaSnapshot, filename = "schema.mmd") {
  const content = toMermaidErDiagram(snapshot);
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}