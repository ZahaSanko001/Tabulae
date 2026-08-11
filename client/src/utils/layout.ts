// client/src/utils/layout.ts
import dagre from "dagre";
import type { Node, Edge } from "reactflow";

const NODE_WIDTH = 220;
const ROW_HEIGHT = 24;
const HEADER_HEIGHT = 40;

export interface LayoutAnchor {
  id: string;
  position: { x: number; y: number };
}

export function layoutGraph(
  nodes: Node[],
  edges: Edge[],
  expandedIds: Set<string>,
  anchor?: LayoutAnchor,
): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "LR", nodesep: 60, ranksep: 120 });
  g.setDefaultEdgeLabel(() => ({}));

  const nodeHeights = new Map<string, number>();

  nodes.forEach((node) => {
    const isExpanded = expandedIds.has(node.id);
    const pkCount = node.data.columns?.filter((c: any) => c.isPrimaryKey).length ?? 1;
    const rowCount = isExpanded ? node.data.columns.length : Math.max(pkCount, 1);
    const height = HEADER_HEIGHT + rowCount * ROW_HEIGHT;
    nodeHeights.set(node.id, height);
    g.setNode(node.id, { width: NODE_WIDTH, height });
  });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  dagre.layout(g);

  const laidOutNodes = nodes.map((node) => {
    const { x, y } = g.node(node.id);
    const height = nodeHeights.get(node.id) ?? HEADER_HEIGHT;
    return { ...node, position: { x: x - NODE_WIDTH / 2, y: y - height / 2 } };
  });

  if (!anchor) {
    return laidOutNodes;
  }

  const laidOutAnchor = laidOutNodes.find((node) => node.id === anchor.id);
  if (!laidOutAnchor) {
    return laidOutNodes;
  }

  const offset = {
    x: anchor.position.x - laidOutAnchor.position.x,
    y: anchor.position.y - laidOutAnchor.position.y,
  };

  return laidOutNodes.map((node) => ({
    ...node,
    position: {
      x: node.position.x + offset.x,
      y: node.position.y + offset.y,
    },
  }));
}
