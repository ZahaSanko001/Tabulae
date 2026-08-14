import { ISchemaProvider } from "./ISchemaProvider";
import { PostgresSchemaProvider } from "./PostgresSchemaProvider";
import { SqlServerSchemaProvider } from "./SqlServerSchemaProvider"; // stub for now

export type DbType = "postgres" | "sqlserver";

export function getProvider(dbType: DbType): ISchemaProvider {
  switch (dbType) {
    case "postgres": return new PostgresSchemaProvider();
    case "sqlserver": return new SqlServerSchemaProvider();
    default: throw new Error(`Unsupported db type: ${dbType}`);
  }
}