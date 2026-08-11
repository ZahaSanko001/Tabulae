// client/src/components/SchemaCanvas.tsx
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import ReactFlow, { Background, BackgroundVariant, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";
import type { SchemaSnapshot } from "../types/schema";
import { toFlowGraph } from "../utils/toFlowGraph";
import { layoutGraph, type LayoutAnchor } from "../utils/layout";
import { TableNodeComponent } from "./TableNode";

const nodeTypes = { tableNode: TableNodeComponent };

export function SchemaCanvas({ snapshot }: { snapshot: SchemaSnapshot }) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [layoutAnchor, setLayoutAnchor] = useState<LayoutAnchor>();
  const positionsRef = useRef(new Map<string, { x: number; y: number }>());

  const toggleExpanded = useCallback((id: string) => {
    const currentPosition = positionsRef.current.get(id);
    if (currentPosition) {
      setLayoutAnchor({ id, position: currentPosition });
    }

    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const { nodes, edges } = useMemo(() => {
    const { nodes: rawNodes, edges } = toFlowGraph(snapshot);
    const nodesWithState = rawNodes.map((n) => ({
      ...n,
      data: { ...n.data, expanded: expandedIds.has(n.id), onToggle: () => toggleExpanded(n.id) },
    }));
    return {
      nodes: layoutGraph(nodesWithState, edges, expandedIds, layoutAnchor),
      edges,
    };
  }, [snapshot, expandedIds, layoutAnchor, toggleExpanded]);

  useEffect(() => {
    for (const node of nodes) {
      positionsRef.current.set(node.id, node.position);
    }
  }, [nodes]);

  return (
    <div className="schema-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={(instance) => instance.fitView()}
      >
        <Background color="#1E293B" gap={24} size={1} variant={BackgroundVariant.Dots} />
        <Controls />
        <MiniMap pannable zoomable />
      </ReactFlow>
    </div>
  );
}
