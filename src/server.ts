import type { Server } from "node:http";
import app from "./app.js";
import { prisma } from "./lib/prisma.js";

const PORT = Number(process.env.PORT) || 8080;

let server: Server | null = null;
let isShuttingDown = false;

async function shutdown(exitCode: number) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  try {
    const currentServer = server;

    if (currentServer) {
      await new Promise<void>((resolve, reject) => {
        currentServer.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          console.log("HTTP server closed");
          resolve();
        });
      });
    }

    await prisma.$disconnect();
    console.log("SQL Database disconnected");
  } catch (error) {
    console.error("Failed during shutdown", error);
    process.exit(1);
  }

  process.exit(exitCode);
}

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Connected to SQL Database");

    server = app.listen(PORT, () => {
      console.log(`Server is running at port: ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    await shutdown(1);
  }
}

process.once("uncaughtException", (error) => {
  console.error("Uncaught exception", error);
  void shutdown(1);
});

process.once("unhandledRejection", (reason) => {
  console.error("Unhandled rejection", reason);
  void shutdown(1);
});

process.once("SIGINT", () => {
  console.log("Received SIGINT");
  void shutdown(0);
});

process.once("SIGTERM", () => {
  console.log("Received SIGTERM");
  void shutdown(0);
});

void startServer();
