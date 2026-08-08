import cors = require("cors");
import express = require("express");
import schemaRouter from "./routes/schema";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use("/api/schema", schemaRouter);

app.listen(port, () => {
  console.log(`Schema API listening on http://localhost:${port}`);
});
