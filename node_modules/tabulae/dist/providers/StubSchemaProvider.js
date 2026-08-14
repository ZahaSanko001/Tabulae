"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StubSchemaProvider = void 0;
class StubSchemaProvider {
    async getSchema(connectionString) {
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
exports.StubSchemaProvider = StubSchemaProvider;
//# sourceMappingURL=StubSchemaProvider.js.map