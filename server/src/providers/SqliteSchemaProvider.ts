import { DatabaseSync } from "node:sqlite";
import type { ISchemaProvider } from "./ISchemaProvider";
import type { ColumnInfo, ForeignKeyEdge, SchemaSnapshot, TableNode } from "../domain/schema";

export class SqliteSchemaProvider implements ISchemaProvider {
  async getSchema(filePath: string): Promise<SchemaSnapshot> {
    const db = new DatabaseSync(filePath, { readOnly: true });

    try {
      const tables = db
        .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%';`)
        .all() as { name: string }[];

      const tableMap = new Map<string, TableNode>();
      const relationships: ForeignKeyEdge[] = [];

      for (const { name: tableName } of tables) {
        const columnRows = db.prepare(`PRAGMA table_info(${tableName});`).all() as any[];
        const columns: ColumnInfo[] = columnRows.map((c) => ({
          name: c.name,
          dataType: c.type || "unknown",
          isNullable: c.notnull === 0 && c.pk === 0,
          isPrimaryKey: c.pk > 0,
          isForeignKey: false,
        }));

        const fkRows = db.prepare(`PRAGMA foreign_key_list(${tableName});`).all() as any[];
        for (const fk of fkRows) {
          const col = columns.find((c) => c.name === fk.from);
          if (col) col.isForeignKey = true;
          relationships.push({
            fromSchema: "main",
            fromTable: tableName,
            fromColumn: fk.from,
            toSchema: "main",
            toTable: fk.table,
            toColumn: fk.to,
          });
        }

        tableMap.set(tableName, { schema: "main", name: tableName, columns });
      }

      return { tables: Array.from(tableMap.values()), relationships };
    } finally {
      db.close();
    }
  }
}
