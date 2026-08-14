import { Router } from "express";
import { StubSchemaProvider } from "../providers/StubSchemaProvider";
import { getProvider } from "../providers/ProviderFactory";

const router = Router();
const provider = new StubSchemaProvider();

router.post("/introspect", async (req, res) => {
  const { connectionString, dbType } = req.body;
  try {
    const provider = getProvider(dbType);
    const snapshot = await provider.getSchema(connectionString);
    res.json(snapshot);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;