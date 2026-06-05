import { createApp } from "./app.js";
import { bootstrapDb } from "./bootstrap.js";

const PORT = Number(process.env.PORT) || 3601;

await bootstrapDb();
const app = createApp();
app.listen(PORT, () => {
  console.log(`shop-api listening on port ${PORT}`);
});
