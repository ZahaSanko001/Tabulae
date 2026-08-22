"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProvider = getProvider;
const MySqlSchemaProvider_1 = require("./MySqlSchemaProvider");
const PostgresSchemaProvider_1 = require("./PostgresSchemaProvider");
const SqlServerSchemaProvider_1 = require("./SqlServerSchemaProvider"); // stub for now
const SqliteSchemaProvider_1 = require("./SqliteSchemaProvider");
function getProvider(dbType) {
    switch (dbType) {
        case "postgres": return new PostgresSchemaProvider_1.PostgresSchemaProvider();
        case "sqlserver": return new SqlServerSchemaProvider_1.SqlServerSchemaProvider();
        case "mysql": return new MySqlSchemaProvider_1.MySqlSchemaProvider();
        case "sqlite": return new SqliteSchemaProvider_1.SqliteSchemaProvider();
        default: throw new Error(`Unsupported db type: ${dbType}`);
    }
}
//# sourceMappingURL=ProviderFactory.js.map