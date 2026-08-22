import mysql from "mysql2/promise";
import { ISchemaProvider } from "./ISchemaProvider";
import { SchemaSnapshot, TableNode, ColumnInfo, ForeignKeyEdge } from "../domain/schema";

export class MySqlSchemaProvider implements ISchemaProvider {
  async getSchema(connectionString: string): Promise<SchemaSnapshot> {
    const connection = await mysql.createConnection(connectionString);

    try {
      await connection.query("SET SESSION TRANSACTION READ ONLY");

      const [columnsRows] = await connection.query(`
        SELECT TABLE_SCHEMA AS table_schema, TABLE_NAME AS table_name,
               COLUMN_NAME AS column_name, DATA_TYPE AS data_type, IS_NULLABLE AS is_nullable
        FROM information_schema.columns
        WHERE TABLE_SCHEMA = DATABASE()
        ORDER BY TABLE_SCHEMA, TABLE_NAME, ORDINAL_POSITION;
      `);

      const [pkRows] = await connection.query(`
        SELECT TABLE_SCHEMA AS table_schema, TABLE_NAME AS table_name, COLUMN_NAME AS column_name
        FROM information_schema.key_column_usage
        WHERE TABLE_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'PRIMARY';
      `);

      const [fkRows] = await connection.query(`
        SELECT
          TABLE_SCHEMA AS table_schema,
          TABLE_NAME AS from_table, COLUMN_NAME AS from_column,
          REFERENCED_TABLE_NAME AS to_table, REFERENCED_COLUMN_NAME AS to_column
        FROM information_schema.key_column_usage
        WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL;
      `);

      const columns = columnsRows as any[];
      const pks = pkRows as any[];
      const fks = fkRows as any[];

      const pkSet = new Set(pks.map((r) => `${r.table_schema}.${r.table_name}.${r.column_name}`));
      const fkColSet = new Set(fks.map((r) => `${r.table_schema}.${r.from_table}.${r.from_column}`));

      const tableMap = new Map<string, TableNode>();
      for (const row of columns) {
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

      const relationships: ForeignKeyEdge[] = fks.map((r) => ({
        fromSchema: r.table_schema,
        fromTable: r.from_table,
        fromColumn: r.from_column,
        toSchema: r.table_schema,
        toTable: r.to_table,
        toColumn: r.to_column,
      }));

      return { tables: Array.from(tableMap.values()), relationships };
    } finally {
      await connection.end();
    }
  }
}
