import type { SchemaSnapshot } from "../domain/schema";
import type { ISchemaProvider } from "./ISchemaProvider";
export declare class StubSchemaProvider implements ISchemaProvider {
    getSchema(connectionString: string): Promise<SchemaSnapshot>;
}
//# sourceMappingURL=StubSchemaProvider.d.ts.map