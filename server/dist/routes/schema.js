"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const StubSchemaProvider_1 = require("../providers/StubSchemaProvider");
const ProviderFactory_1 = require("../providers/ProviderFactory");
const router = (0, express_1.Router)();
const provider = new StubSchemaProvider_1.StubSchemaProvider();
router.post("/introspect", async (req, res) => {
    const { connectionString, dbType } = req.body;
    try {
        const provider = (0, ProviderFactory_1.getProvider)(dbType);
        const snapshot = await provider.getSchema(connectionString);
        res.json(snapshot);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=schema.js.map