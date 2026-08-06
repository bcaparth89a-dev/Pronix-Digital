import http from "node:http";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./db/mongoose.js";
import { logger } from "./utils/logger.js";

const server = http.createServer(app);

async function bootstrap() {
  await connectDatabase();

  server.listen(env.PORT, () => {
    logger.info(`Pronix API running on port ${env.PORT}`);
  });
}

async function shutdown(signal) {
  logger.info(`${signal} received. Closing server.`);

  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

bootstrap().catch((error) => {
  logger.error("Failed to start server", error);
  process.exit(1);
});
