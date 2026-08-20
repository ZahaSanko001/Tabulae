import { ISchemaProvider } from "./ISchemaProvider";
import { MySqlSchemaProvider } from "./MySqlSchemaProvider";
import { PostgresSchemaProvider } from "./PostgresSchemaProvider";
import { SqlServerSchemaProvider } from "./SqlServerSchemaProvider"; // stub for now

export type DbType = "postgres" | "sqlserver" | "mysql";

export function getProvider(dbType: DbType): ISchemaProvider {
  switch (dbType) {
    case "postgres": return new PostgresSchemaProvider();
    case "sqlserver": return new SqlServerSchemaProvider();
    case "mysql": return new MySqlSchemaProvider();
    default: throw new Error(`Unsupported db type: ${dbType}`);
  }
}