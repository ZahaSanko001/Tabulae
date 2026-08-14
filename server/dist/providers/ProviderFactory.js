"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProvider = getProvider;
const PostgresSchemaProvider_1 = require("./PostgresSchemaProvider");
const SqlServerSchemaProvider_1 = require("./SqlServerSchemaProvider"); // stub for now
function getProvider(dbType) {
    switch (dbType) {
        case "postgres": return new PostgresSchemaProvider_1.PostgresSchemaProvider();
        case "sqlserver": return new SqlServerSchemaProvider_1.SqlServerSchemaProvider();
        default: throw new Error(`Unsupported db type: ${dbType}`);
    }
}
//# sourceMappingURL=ProviderFactory.js.map