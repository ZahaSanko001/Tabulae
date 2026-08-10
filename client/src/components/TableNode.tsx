// client/src/components/TableNode.tsx
import { useState } from "react";
import { Handle, Position } from "reactflow";
import type { TableNode as TableNodeType } from "../types/schema";

export function TableNodeComponent({ data }: { data: TableNodeType & { expanded: boolean; onToggle: () => void } }) {
  const [expanded, setExpanded] = useState(false);
  const pkColumns = data.columns.filter((c) => c.isPrimaryKey);
  const visibleColumns = data.expanded ? data.columns : pkColumns;

  return (
    <div
      className="rounded-md bg-[#111827] text-[#E2E8F0] text-xs shadow-lg min-w-50 font-mono
                 border border-[#1E293B] border-l-[3px] border-l-amber-500 cursor-pointer
                 hover:border-l-amber-400 transition-colors"
      onClick={data.onToggle}
    >
      <div className="px-2.5 py-1.5 font-semibold text-[#F1F5F9] flex items-center justify-between">
        <span>{data.name}</span>
        <span className="text-[#475569] text-[10px]">{data.columns.length}</span>
      </div>
      <div className="border-t border-[#1E293B]">
        {visibleColumns.map((col) => (
          <div
            key={col.name}
            className="flex justify-between px-2.5 py-1 border-b border-[#1E293B]/60 last:border-0"
          >
            <span className={col.isPrimaryKey ? "text-amber-400" : col.isForeignKey ? "text-sky-400" : "text-[#94A3B8]"}>
              {col.isPrimaryKey ? "● " : col.isForeignKey ? "↳ " : ""}
              {col.name}
            </span>
            <span className="text-[#475569]">{col.dataType}</span>
          </div>
        ))}
        {!expanded && data.columns.length > pkColumns.length && (
          <div className="px-2.5 py-1 text-[#475569] text-[10px]">
            +{data.columns.length - pkColumns.length} more…
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left} style={{ background: "#334155" }} />
      <Handle type="source" position={Position.Right} style={{ background: "#334155" }} />
    </div>
  );
}