import { ISchemaProvider } from "./ISchemaProvider";
import { MySqlSchemaProvider } from "./MySqlSchemaProvider";
import { PostgresSchemaProvider } from "./PostgresSchemaProvider";
import { SqlServerSchemaProvider } from "./SqlServerSchemaProvider"; // stub for now
import { SqliteSchemaProvider } from "./SqliteSchemaProvider";

export type DbType = "postgres" | "sqlserver" | "mysql" | "sqlite";

export function getProvider(dbType: DbType): ISchemaProvider {
  switch (dbType) {
    case "postgres": return new PostgresSchemaProvider();
    case "sqlserver": return new SqlServerSchemaProvider();
    case "mysql": return new MySqlSchemaProvider();
    case "sqlite": return new SqliteSchemaProvider();
    default: throw new Error(`Unsupported db type: ${dbType}`);
  }
}
