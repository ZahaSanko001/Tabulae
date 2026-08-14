import { SchemaSnapshot } from "../domain/schema";
export interface ISchemaProvider {
    getSchema(connectionString: string): Promise<SchemaSnapshot>;
}
//# sourceMappingURL=ISchemaProvider.d.ts.map