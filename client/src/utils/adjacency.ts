import type { SchemaSnapshot } from "../types/schema";

export function buildAdjacency(snapshot: SchemaSnapshot): Map<string, Set<string>> {
  const adjacency = new Map<string, Set<string>>();
  const add = (a: string, b: string) => {
    if (!adjacency.has(a)) adjacency.set(a, new Set());
    adjacency.get(a)!.add(b);
  };

  for (const rel of snapshot.relationships) {
    const from = `${rel.fromSchema}.${rel.fromTable}`;
    const to = `${rel.toSchema}.${rel.toTable}`;
    add(from, to);
    add(to, from);
  }

  return adjacency;
}