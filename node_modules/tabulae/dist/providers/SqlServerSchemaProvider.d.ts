import type { ISchemaProvider } from "./ISchemaProvider";
import type { SchemaSnapshot } from "../domain/schema";
export declare class SqlServerSchemaProvider implements ISchemaProvider {
    getSchema(connectionString: string): Promise<SchemaSnapshot>;
}
//# sourceMappingURL=SqlServerSchemaProvider.d.ts.map