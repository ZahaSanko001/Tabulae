import sql = require("mssql");
import type { ISchemaProvider } from "./ISchemaProvider";
import type {
  ColumnInfo,
  ForeignKeyEdge,
  SchemaSnapshot,
  TableNode,
} from "../domain/schema";

export class SqlServerSchemaProvider implements ISchemaProvider {
  async getSchema(connectionString: string): Promise<SchemaSnapshot> {
    const pool = await new sql.ConnectionPool(connectionString).connect();

    try {
      const columnsResult = await pool.request().query(`
        SELECT
          c.TABLE_SCHEMA AS table_schema,
          c.TABLE_NAME AS table_name,
          c.COLUMN_NAME AS column_name,
          c.DATA_TYPE AS data_type,
          c.IS_NULLABLE AS is_nullable
        FROM INFORMATION_SCHEMA.COLUMNS c
        INNER JOIN INFORMATION_SCHEMA.TABLES t
          ON t.TABLE_SCHEMA = c.TABLE_SCHEMA
          AND t.TABLE_NAME = c.TABLE_NAME
        WHERE t.TABLE_TYPE = 'BASE TABLE'
          AND c.TABLE_SCHEMA NOT IN ('sys', 'INFORMATION_SCHEMA')
        ORDER BY c.TABLE_SCHEMA, c.TABLE_NAME, c.ORDINAL_POSITION;
      `);

      const primaryKeysResult = await pool.request().query(`
        SELECT
          tc.TABLE_SCHEMA AS table_schema,
          tc.TABLE_NAME AS table_name,
          kcu.COLUMN_NAME AS column_name
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
        INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
          ON kcu.CONSTRAINT_SCHEMA = tc.CONSTRAINT_SCHEMA
          AND kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
          AND kcu.TABLE_SCHEMA = tc.TABLE_SCHEMA
          AND kcu.TABLE_NAME = tc.TABLE_NAME
        WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY';
      `);

      const foreignKeysResult = await pool.request().query(`
        SELECT
          SCHEMA_NAME(parent_table.schema_id) AS from_schema,
          parent_table.name AS from_table,
          parent_column.name AS from_column,
          SCHEMA_NAME(referenced_table.schema_id) AS to_schema,
          referenced_table.name AS to_table,
          referenced_column.name AS to_column
        FROM sys.foreign_key_columns fkc
        INNER JOIN sys.tables parent_table
          ON parent_table.object_id = fkc.parent_object_id
        INNER JOIN sys.columns parent_column
          ON parent_column.object_id = fkc.parent_object_id
          AND parent_column.column_id = fkc.parent_column_id
        INNER JOIN sys.tables referenced_table
          ON referenced_table.object_id = fkc.referenced_object_id
        INNER JOIN sys.columns referenced_column
          ON referenced_column.object_id = fkc.referenced_object_id
          AND referenced_column.column_id = fkc.referenced_column_id
        WHERE parent_table.is_ms_shipped = 0
          AND referenced_table.is_ms_shipped = 0;
      `);

      const primaryKeySet = new Set(
        primaryKeysResult.recordset.map(
          (row) => `${row.table_schema}.${row.table_name}.${row.column_name}`,
        ),
      );
      const foreignKeyColumnSet = new Set(
        foreignKeysResult.recordset.map(
          (row) => `${row.from_schema}.${row.from_table}.${row.from_column}`,
        ),
      );

      const tableMap = new Map<string, TableNode>();

      for (const row of columnsResult.recordset) {
        const tableKey = `${row.table_schema}.${row.table_name}`;
        if (!tableMap.has(tableKey)) {
          tableMap.set(tableKey, {
            schema: row.table_schema,
            name: row.table_name,
            columns: [],
          });
        }

        const column: ColumnInfo = {
          name: row.column_name,
          dataType: row.data_type,
          isNullable: row.is_nullable === "YES",
          isPrimaryKey: primaryKeySet.has(
            `${row.table_schema}.${row.table_name}.${row.column_name}`,
          ),
          isForeignKey: foreignKeyColumnSet.has(
            `${row.table_schema}.${row.table_name}.${row.column_name}`,
          ),
        };

        tableMap.get(tableKey)!.columns.push(column);
      }

      const relationships: ForeignKeyEdge[] = foreignKeysResult.recordset.map(
        (row) => ({
          fromTable: row.from_table,
          fromColumn: row.from_column,
          toTable: row.to_table,
          toColumn: row.to_column,
        }),
      );

      return {
        tables: Array.from(tableMap.values()),
        relationships,
      };
    } finally {
      await pool.close();
    }
  }
}
