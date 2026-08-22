// client/src/components/SchemaCanvas.tsx
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import ReactFlow, { Background, BackgroundVariant, Controls, MiniMap, MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import type { SchemaSnapshot } from "../types/schema";
import { toFlowGraph } from "../utils/toFlowGraph";
import { layoutGraph, type LayoutAnchor } from "../utils/layout";
import { buildAdjacency, getSubgraph } from "../utils/adjacency";
import { TableNodeComponent } from "./TableNode";
import { SearchPanel } from "./SearchPanel";
import { ExportToolbar } from "./ExportToolbar";

const nodeTypes = { tableNode: TableNodeComponent };

export function SchemaCanvas({ snapshot }: { snapshot: SchemaSnapshot }) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [layoutAnchor, setLayoutAnchor] = useState<LayoutAnchor>();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [hopDepth, setHopDepth] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const positionsRef = useRef(new Map<string, { x: number; y: number }>());

  const adjacency = useMemo(() => buildAdjacency(snapshot), [snapshot]);

  const tableOptions = useMemo(
    () => snapshot.tables.map((t) => ({ id: `${t.schema}.${t.name}`, label: t.name })),
    [snapshot],
  );

  const toggleExpanded = useCallback((id: string) => {
    const currentPosition = positionsRef.current.get(id);
    if (currentPosition) setLayoutAnchor({ id, position: currentPosition });
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleFocus = useCallback((id: string | null) => {
    setFocusedId(id);
    setLayoutAnchor(undefined);
  }, []);

  const { nodes, edges } = useMemo(() => {
    const { nodes: rawNodes, edges: rawEdges } = toFlowGraph(snapshot);

    const allowedIds = focusedId ? getSubgraph(adjacency, focusedId, hopDepth) : null;
    const filteredNodes = allowedIds ? rawNodes.filter((n) => allowedIds.has(n.id)) : rawNodes;
    const filteredEdges = allowedIds
      ? rawEdges.filter((e) => allowedIds.has(e.source) && allowedIds.has(e.target))
      : rawEdges;

    const matchQuery = query.trim().toLowerCase();
    const neighbors = hoveredId ? adjacency.get(hoveredId) : undefined;

    const nodesWithState = filteredNodes.map((n) => {
      const searchMiss = matchQuery.length > 0 && !n.data.name.toLowerCase().includes(matchQuery);
      const hoverMiss = hoveredId != null && n.id !== hoveredId && !neighbors?.has(n.id);
      const dimmed = matchQuery.length > 0 ? searchMiss : hoverMiss;
      return {
        ...n,
        data: { ...n.data, expanded: expandedIds.has(n.id), onToggle: () => toggleExpanded(n.id), dimmed },
      };
    });

    const edgesWithState = filteredEdges.map((e) => {
      const isActive = hoveredId != null && (e.source === hoveredId || e.target === hoveredId);
      const isDimmed = hoveredId != null && !isActive;
      return {
        ...e,
        style: { ...e.style, stroke: isActive ? "#F59E0B" : "#334155", strokeWidth: isActive ? 2 : 1.5, opacity: isDimmed ? 0.15 : 1 },
        labelStyle: { ...e.labelStyle, opacity: isActive ? 1 : 0 },
        markerEnd: { type: MarkerType.ArrowClosed, color: isActive ? "#F59E0B" : "#334155", width: 16, height: 16 },
        zIndex: isActive ? 1 : 0,
      };
    });

    return {
      nodes: layoutGraph(nodesWithState, edgesWithState, expandedIds, layoutAnchor),
      edges: edgesWithState,
    };
  }, [snapshot, expandedIds, layoutAnchor, toggleExpanded, hoveredId, adjacency, query, focusedId, hopDepth]);

  useEffect(() => {
    for (const node of nodes) positionsRef.current.set(node.id, node.position);
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
    <div ref={canvasRef} className="terminal-window schema-canvas-window">
      <div className="terminal-window__titlebar">
        <span className="terminal-window__dot terminal-window__dot--red" />
        <span className="terminal-window__dot terminal-window__dot--amber" />
        <span className="terminal-window__dot terminal-window__dot--green" />
        <span className="terminal-window__title">
          tabulae — {snapshot.tables.length} table{snapshot.tables.length === 1 ? "" : "s"}
        </span>
        <div className="terminal-window__titlebar-controls">
          <button
            type="button"
            className="schema-canvas__fullscreen-button"
            onClick={() => void toggleFullscreen()}
          >
            {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          </button>
          <ExportToolbar nodes={nodes} snapshot={snapshot} />
        </div>
      </div>

      <div className="terminal-window__canvas-body relative">
        <SearchPanel
          tableOptions={tableOptions}
          query={query}
          onQueryChange={setQuery}
          focusedId={focusedId}
          onFocus={handleFocus}
          hopDepth={hopDepth}
          onHopDepthChange={setHopDepth}
        />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          proOptions={{ hideAttribution: true }}
          onNodeMouseEnter={(_, node) => setHoveredId(node.id)}
          onNodeMouseLeave={() => setHoveredId(null)}
          onInit={(instance) => instance.fitView()}
          fitView
        >
          <Background color="#1E293B" gap={24} size={1} variant={BackgroundVariant.Dots} />
          <Controls />
          <MiniMap pannable zoomable />
        </ReactFlow>
      </div>
    </div>
  );
}