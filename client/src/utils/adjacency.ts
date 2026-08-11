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


export function getSubgraph(adjacency: Map<string, Set<string>>, rootId: string, hops: number): Set<string> {
  const visited = new Set<string>([rootId]);
  let frontier = new Set<string>([rootId]);

  for (let i = 0; i < hops; i++) {
    const next = new Set<string>();
    for (const id of frontier) {
      for (const neighbor of adjacency.get(id) ?? []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          next.add(neighbor);
        }
      }
    }
    frontier = next;
    if (frontier.size === 0) break;
  }

  return visited;
}