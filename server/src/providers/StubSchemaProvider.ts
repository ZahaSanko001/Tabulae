import type { SchemaSnapshot } from "../domain/schema";
import type { ISchemaProvider } from "./ISchemaProvider";

export class StubSchemaProvider implements ISchemaProvider {
  async getSchema(connectionString: string): Promise<SchemaSnapshot> {
    return {
      tables: [
        { schema: "dbo", 
          name: "Users", 
          columns: [
            { 
              name: "Id", 
              dataType: "int", 
              isNullable: false, 
              isPrimaryKey: true, 
              isForeignKey: false 
            }
          ] 
        },
        { schema: "dbo", 
          name: "Orders", 
          columns: [
            { 
              name: "UserId", 
              dataType: "int", 
              isNullable: false, 
              isPrimaryKey: false, 
              isForeignKey: true 
            }
          ] 
        }
      ],
      relationships: [
        { fromSchema: "dbo", fromTable: "Orders", 
          fromColumn: "UserId", 
          toSchema: "dbo",
          toTable: "Users", 
          toColumn: "Id" 
        }
      ],
    };
  }
}
