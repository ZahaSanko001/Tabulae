import { useMemo } from "react";

interface TableOption {
  id: string;
  label: string;
}

interface SearchPanelProps {
  tableOptions: TableOption[];
  query: string;
  onQueryChange: (q: string) => void;
  focusedId: string | null;
  onFocus: (id: string | null) => void;
  hopDepth: number;
  onHopDepthChange: (n: number) => void;
}

export function SearchPanel({
  tableOptions, query, onQueryChange, focusedId, onFocus, hopDepth, onHopDepthChange,
}: SearchPanelProps) {
  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return tableOptions.filter((t) => t.label.toLowerCase().includes(q)).slice(0, 8);
  }, [query, tableOptions]);

  return (
    <div className="absolute top-4 left-4 z-10 w-72 bg-[#111827] border border-[#1E293B] rounded-md shadow-lg font-mono text-xs">
      <input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search tables…"
        className="w-full bg-[#0B1120] border-b border-[#1E293B] rounded-t-md px-2.5 py-2 text-[#E2E8F0] outline-none focus:border-amber-500"
      />
      {matches.length > 0 && (
        <div className="max-h-48 overflow-y-auto">
          {matches.map((m) => (
            <button
              key={m.id}
              onClick={() => onFocus(m.id)}
              className={`w-full text-left px-2.5 py-1.5 hover:bg-[#1E293B] transition-colors ${
                focusedId === m.id ? "text-amber-400" : "text-[#94A3B8]"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}
      {focusedId && (
        <div className="border-t border-[#1E293B] p-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#94A3B8]">
            <span>Depth</span>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => onHopDepthChange(n)}
                className={`w-5 h-5 rounded ${n === hopDepth ? "bg-amber-500 text-[#0B1120]" : "bg-[#1E293B]"}`}
              >
                {n}
              </button>
            ))}
          </div>
          <button onClick={() => onFocus(null)} className="text-red-400 hover:text-red-300">
            Clear
          </button>
        </div>
      )}
    </div>
  );
}