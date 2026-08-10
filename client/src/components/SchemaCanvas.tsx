// client/src/components/SchemaCanvas.tsx
import { useMemo, useState, useCallback } from "react";
import ReactFlow, { Background, BackgroundVariant, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";
import type { SchemaSnapshot } from "../types/schema";
import { toFlowGraph } from "../utils/toFlowGraph";
import { layoutGraph } from "../utils/layout";
import { TableNodeComponent } from "./TableNode";

const nodeTypes = { tableNode: TableNodeComponent };

export function SchemaCanvas({ snapshot }: { snapshot: SchemaSnapshot }) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = useCallback((id: string) => {
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
    return { nodes: layoutGraph(nodesWithState, edges, expandedIds), edges };
  }, [snapshot, expandedIds, toggleExpanded]);

  return (
    <div className="schema-canvas">
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
        <Background color="#1E293B" gap={24} size={1} variant={BackgroundVariant.Dots} />
        <Controls />
        <MiniMap pannable zoomable />
      </ReactFlow>
    </div>
  );
}