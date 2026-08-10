import { type Node, type Edge, MarkerType } from "reactflow";
import type { SchemaSnapshot } from "../types/schema";

export function toFlowGraph(snapshot: SchemaSnapshot): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = snapshot.tables.map((table) => ({
    id: table.name,
    type: "tableNode",
    position: { x: 0, y: 0 }, // overwritten by layoutGraph
    data: table,
  }));

  const edges: Edge[] = snapshot.relationships.map((rel, i) => ({
    id: `${rel.fromTable}-${rel.fromColumn}-${i}`,
    source: rel.fromTable,
    target: rel.toTable,
    type: "smoothstep",
    label: `${rel.fromColumn} → ${rel.toColumn}`,
    labelStyle: { fill: "#64748B", fontSize: 10, fontFamily: "monospace" },
    labelShowBg: false,
    style: { stroke: "#334155", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#334155", width: 16, height: 16 },
  }));

  return { nodes, edges };
}