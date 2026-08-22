// client/src/components/TableNode.tsx
import { Handle, Position } from "reactflow";
import type { TableNode as TableNodeType } from "../types/schema";

export function TableNodeComponent({ data }: { data: TableNodeType & { expanded: boolean; onToggle: () => void; dimmed?: boolean } }) {
  const pkColumns = data.columns.filter((c) => c.isPrimaryKey);
  const visibleColumns = data.expanded ? data.columns : pkColumns;

  return (
    <div
      className={`rounded-md bg-(--surface) text-(--text-h) text-xs shadow-lg min-w-50 font-mono
                 border border-(--border) border-l-[3px] border-l-(--accent) cursor-pointer
                 hover:border-l-(--secondary) transition-all duration-150
                 ${data.dimmed ? "opacity-25" : "opacity-100"}`}
      onClick={data.onToggle}
    >
      <div className="px-2.5 py-1.5 font-semibold text-(--text-h) flex items-center justify-between">
        <span>{data.name}</span>
        <span className="text-(--text) text-[10px]">{data.columns.length}</span>
      </div>
      <div className="border-t border-(--border)">
        {visibleColumns.map((col) => (
          <div
            key={col.name}
            className="flex justify-between px-2.5 py-1 border-b border-(--border)/60 last:border-0"
          >
            <span className={col.isPrimaryKey ? "text-(--accent)" : col.isForeignKey ? "text-(--secondary)" : "text-(--text)"}>
              {col.isPrimaryKey ? "● " : col.isForeignKey ? "↳ " : ""}
              {col.name}
            </span>
            <span className="text-(--text) opacity-70">{col.dataType}</span>
          </div>
        ))}
        {!data.expanded && data.columns.length > pkColumns.length && (
          <div className="px-2.5 py-1 text-(--text) opacity-70 text-[10px]">
            +{data.columns.length - pkColumns.length} more…
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left} style={{ background: "#334155" }} />
      <Handle type="source" position={Position.Right} style={{ background: "#334155" }} />
    </div>
  );
}