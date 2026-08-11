import { useState } from "react";
import type { Node } from "reactflow";
import type { SchemaSnapshot } from "../types/schema";
import { exportPng, exportSvg } from "../utils/exportImage";
import { downloadMermaid } from "../utils/exportMermaid";

export function ExportToolbar({ nodes, snapshot }: { nodes: Node[]; snapshot: SchemaSnapshot }) {
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (key: string, fn: () => Promise<void> | void) => {
    setBusy(key);
    try {
      await fn();
    } catch (err) {
      console.error(`Export failed (${key}):`, err);
    } finally {
      setBusy(null);
    }
  };

  const btnClass =
    "px-2.5 py-1.5 rounded bg-[#111827] border border-[#1E293B] text-[#94A3B8] hover:text-amber-400 hover:border-amber-500 transition-colors disabled:opacity-40 disabled:cursor-wait";

  return (
    <div className="absolute top-4 right-4 z-10 flex gap-2 font-mono text-xs">
      <button className={btnClass} disabled={busy !== null} onClick={() => run("png", () => exportPng(nodes))}>
        {busy === "png" ? "Exporting…" : "PNG"}
      </button>
      <button className={btnClass} disabled={busy !== null} onClick={() => run("svg", () => exportSvg(nodes))}>
        {busy === "svg" ? "Exporting…" : "SVG"}
      </button>
      <button className={btnClass} disabled={busy !== null} onClick={() => run("mmd", () => downloadMermaid(snapshot))}>
        Mermaid
      </button>
    </div>
  );
}