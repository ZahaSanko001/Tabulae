import { ISchemaProvider } from "./ISchemaProvider";
export type DbType = "postgres" | "sqlserver" | "mysql" | "sqlite";
export declare function getProvider(dbType: DbType): ISchemaProvider;
//# sourceMappingURL=ProviderFactory.d.ts.map