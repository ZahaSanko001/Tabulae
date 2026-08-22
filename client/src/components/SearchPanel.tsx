// client/src/components/SearchPanel.tsx
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
    <div className="absolute top-4 left-4 z-10 w-72 bg-(--surface) border border-(--border) rounded-md shadow-lg font-mono text-xs">
      <div className="flex items-center border-b border-(--border) rounded-t-md bg-(--bg) px-2.5">
        <span className="text-(--accent) font-semibold mr-1.5">&gt;</span>
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search tables…"
          className="w-full bg-transparent py-2 text-(--text-h) outline-none"
        />
      </div>
      {matches.length > 0 && (
        <div className="max-h-48 overflow-y-auto">
          {matches.map((m) => (
            <button
              key={m.id}
              onClick={() => onFocus(m.id)}
              className={`w-full text-left px-2.5 py-1.5 hover:bg-(--border) transition-colors ${
                focusedId === m.id ? "text-(--accent)" : "text-(--text)"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}
      {focusedId && (
        <div className="border-t border-(--border) p-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-(--text)">
            <span>Depth</span>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => onHopDepthChange(n)}
                className={`w-5 h-5 rounded flex items-center justify-center ${
                  n === hopDepth ? "bg-(--accent) text-[#0B1120]" : "bg-(--border)"
                }`}
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