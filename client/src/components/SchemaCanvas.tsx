// client/src/components/SchemaCanvas.tsx
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import ReactFlow, { Background, BackgroundVariant, Controls, MarkerType, MiniMap } from "reactflow";
import "reactflow/dist/style.css";
import type { SchemaSnapshot } from "../types/schema";
import { toFlowGraph } from "../utils/toFlowGraph";
import { layoutGraph, type LayoutAnchor } from "../utils/layout";
import { TableNodeComponent } from "./TableNode";
import { buildAdjacency } from "../utils/adjacency";

const nodeTypes = { tableNode: TableNodeComponent };

export function SchemaCanvas({ snapshot }: { snapshot: SchemaSnapshot }) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [layoutAnchor, setLayoutAnchor] = useState<LayoutAnchor>();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const positionsRef = useRef(new Map<string, { x: number; y: number }>());
  const adjacency = useMemo(() => buildAdjacency(snapshot), [snapshot]);

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
    const { nodes: rawNodes, edges: rawEdges } = toFlowGraph(snapshot);
    const neighbors = hoveredId ? adjacency.get(hoveredId) : undefined;

    const nodesWithState = rawNodes.map((n) => {
      const dimmed = hoveredId != null && n.id !== hoveredId && !neighbors?.has(n.id);
      return {
        ...n,
        data: {
          ...n.data,
          expanded: expandedIds.has(n.id),
          onToggle: () => toggleExpanded(n.id),
          dimmed,
        },
      };
    });

    const edgesWithState = rawEdges.map((e) => {
      const isActive = hoveredId != null && (e.source === hoveredId || e.target === hoveredId);
      const isDimmed = hoveredId != null && !isActive;
      return {
        ...e,
        style: {
          ...e.style,
          stroke: isActive ? "#F59E0B" : "#334155",
          strokeWidth: isActive ? 2 : 1.5,
          opacity: isDimmed ? 0.15 : 1,
        },
        labelStyle: { ...e.labelStyle, opacity: isActive ? 1 : 0 },
        markerEnd: { type: MarkerType.ArrowClosed, color: isActive ? "#F59E0B" : "#334155", width: 16, height: 16 },
        zIndex: isActive ? 1 : 0,
      };
    });

    return {
      nodes: layoutGraph(nodesWithState, edgesWithState, expandedIds, layoutAnchor),
      edges: edgesWithState,
    };
    
  }, [snapshot, expandedIds, layoutAnchor, toggleExpanded, hoveredId, adjacency]);

  useEffect(() => {
    for (const node of nodes) {
      positionsRef.current.set(node.id, node.position);
    }
  }, [nodes]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === canvasRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!canvasRef.current) return;

    if (document.fullscreenElement === canvasRef.current) {
      await document.exitFullscreen();
    } else {
      await canvasRef.current.requestFullscreen();
    }
  };

  return (
    <div ref={canvasRef} className="schema-canvas">
      <div className="schema-canvas__toolbar">
        <button
          type="button"
          className="schema-canvas__fullscreen-button"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        </button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeMouseEnter={(_, node) => setHoveredId(node.id)}
        onNodeMouseLeave={() => setHoveredId(null)}
        onInit={(instance) => instance.fitView()}
      >
        <Background color="#1E293B" gap={24} size={1} variant={BackgroundVariant.Dots} />
        <Controls />
        <MiniMap pannable zoomable />
      </ReactFlow>
    </div>
  );
}
