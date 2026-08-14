import { ISchemaProvider } from "./ISchemaProvider";
import { SchemaSnapshot } from "../domain/schema";
export declare class PostgresSchemaProvider implements ISchemaProvider {
    getSchema(connectionString: string): Promise<SchemaSnapshot>;
}
//# sourceMappingURL=PostgresSchemaProvider.d.ts.map