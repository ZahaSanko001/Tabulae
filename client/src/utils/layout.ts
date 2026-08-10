// client/src/utils/layout.ts
import dagre from "dagre";
import type { Node, Edge } from "reactflow";

const NODE_WIDTH = 220;
const ROW_HEIGHT = 24;
const HEADER_HEIGHT = 40;

// client/src/utils/layout.ts
export function layoutGraph(nodes: Node[], edges: Edge[], expandedIds: Set<string>): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "LR", nodesep: 60, ranksep: 120 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    const isExpanded = expandedIds.has(node.id);
    const pkCount = node.data.columns?.filter((c: any) => c.isPrimaryKey).length ?? 1;
    const rowCount = isExpanded ? node.data.columns.length : Math.max(pkCount, 1);
    const height = HEADER_HEIGHT + rowCount * ROW_HEIGHT;
    g.setNode(node.id, { width: NODE_WIDTH, height });
  });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  dagre.layout(g);

  return nodes.map((node) => {
    const { x, y } = g.node(node.id);
    return { ...node, position: { x: x - NODE_WIDTH / 2, y: y - 40 } };
  });
}