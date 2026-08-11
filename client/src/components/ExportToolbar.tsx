import { useState } from "react";
import type { Node } from "reactflow";
import type { SchemaSnapshot } from "../types/schema";
import { exportPng, exportSvg } from "../utils/exportImage";
import { downloadMermaid } from "../utils/exportMermaid";

export function ExportToolbar({ nodes, snapshot }: { nodes: Node[]; snapshot: SchemaSnapshot }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

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
    <div className="schema-export-menu">
      <button
        type="button"
        className="schema-export-menu__toggle"
        aria-label="Export options"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        ⋮
      </button>
      {open && (
        <div className="schema-export-menu__items">
          <button type="button" className={btnClass} disabled={busy !== null} onClick={() => { setOpen(false); void run("png", () => exportPng(nodes)); }}>
            {busy === "png" ? "Exporting…" : "PNG"}
          </button>
          <button type="button" className={btnClass} disabled={busy !== null} onClick={() => { setOpen(false); void run("svg", () => exportSvg(nodes)); }}>
            {busy === "svg" ? "Exporting…" : "SVG"}
          </button>
          <button type="button" className={btnClass} disabled={busy !== null} onClick={() => { setOpen(false); void run("mmd", () => downloadMermaid(snapshot)); }}>
            Mermaid
          </button>
        </div>
      )}
    </div>
  );
}
