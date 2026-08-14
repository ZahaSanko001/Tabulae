#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const schema_1 = __importDefault(require("./routes/schema"));
const open_1 = __importDefault(require("open"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/api/schema", schema_1.default);
// Serve the built React app
const publicDir = path_1.default.join(__dirname, "..", "public");
app.use(express_1.default.static(publicDir));
// SPA fallback — any non-API route serves index.html so client-side routing works
app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path_1.default.join(publicDir, "index.html"));
});
const PORT = 3000;
app.listen(PORT, "127.0.0.1", () => {
    const url = `http://localhost:${PORT}`;
    console.log(`Tabulae running at ${url}`);
    (0, open_1.default)(url).catch(() => {
        console.log("Couldn't open your browser automatically — visit the URL above.");
    });
});
//# sourceMappingURL=index.js.map