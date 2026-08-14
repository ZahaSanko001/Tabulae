import { useState, useCallback } from "react";
import type { SchemaSnapshot } from "../types/schema";

const TIMEOUT_MS = 15_000;
const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function useIntrospectSchema() {
  const [snapshot, setSnapshot] = useState<SchemaSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const introspect = useCallback(async (dbType: string, connectionString: string) => {
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(`${apiUrl}/api/schema/introspect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dbType, connectionString }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }

      const data: SchemaSnapshot = await res.json();
      if (data.tables.length === 0) {
        setError("Connected, but no tables were found in this schema.");
        setSnapshot(null);
      } else {
        setSnapshot(data);
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError("Connection timed out. Check the connection string and that the database is reachable.");
      } else {
        setError(err.message ?? "Something went wrong.");
      }
      setSnapshot(null);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, []);

  return { snapshot, loading, error, introspect };
}
