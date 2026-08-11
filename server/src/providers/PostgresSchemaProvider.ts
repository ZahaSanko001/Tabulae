import { Pool } from "pg";
import { ISchemaProvider } from "./ISchemaProvider";
import { SchemaSnapshot, TableNode, ColumnInfo, ForeignKeyEdge } from "../domain/schema";

export class PostgresSchemaProvider implements ISchemaProvider {
  async getSchema(connectionString: string): Promise<SchemaSnapshot> {
    const pool = new Pool({ connectionString, options: "-c default_transaction_read_only=on" });

    try {
      const columnsResult = await pool.query(`
        SELECT table_schema, table_name, column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY table_schema, table_name, ordinal_position;
      `);

      const pkResult = await pool.query(`
        SELECT tc.table_schema, tc.table_name, kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'PRIMARY KEY';
      `);

      const fkResult = await pool.query(`
        SELECT
          tc.table_schema AS from_schema,
          tc.table_name AS from_table,
          kcu.column_name AS from_column,
          ccu.table_schema AS to_schema,
          ccu.table_name AS to_table,
          ccu.column_name AS to_column
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_catalog = kcu.constraint_catalog
          AND tc.constraint_schema = kcu.constraint_schema
          AND tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
          AND tc.table_name = kcu.table_name
        JOIN information_schema.constraint_column_usage ccu
          ON tc.constraint_catalog = ccu.constraint_catalog
          AND tc.constraint_schema = ccu.constraint_schema
          AND tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY';
      `);

      const pkSet = new Set(pkResult.rows.map(r => `${r.table_schema}.${r.table_name}.${r.column_name}`));
      const fkColSet = new Set(fkResult.rows.map(r => `${r.from_schema}.${r.from_table}.${r.from_column}`));

      const tableMap = new Map<string, TableNode>();
      for (const row of columnsResult.rows) {
        const key = `${row.table_schema}.${row.table_name}`;
        if (!tableMap.has(key)) {
          tableMap.set(key, { schema: row.table_schema, name: row.table_name, columns: [] });
        }
        const column: ColumnInfo = {
          name: row.column_name,
          dataType: row.data_type,
          isNullable: row.is_nullable === "YES",
          isPrimaryKey: pkSet.has(`${row.table_schema}.${row.table_name}.${row.column_name}`),
          isForeignKey: fkColSet.has(`${row.table_schema}.${row.table_name}.${row.column_name}`),
        };
        tableMap.get(key)!.columns.push(column);
      }

      const relationships: ForeignKeyEdge[] = fkResult.rows.map(r => ({
        fromSchema: r.from_schema,
        fromTable: r.from_table,
        fromColumn: r.from_column,
        toSchema: r.to_schema,
        toTable: r.to_table,
        toColumn: r.to_column,
      }));

      return { tables: Array.from(tableMap.values()), relationships };
    } finally {
      await pool.end();
    }
  }
}
