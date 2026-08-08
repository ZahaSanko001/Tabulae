import { Router } from "express";
import { StubSchemaProvider } from "../providers/StubSchemaProvider";

const router = Router();
const provider = new StubSchemaProvider();

router.post("/introspect", async (req, res) => {
  const { connectionString } = req.body;
  const snapshot = await provider.getSchema(connectionString);
  res.json(snapshot);
});

export default router;