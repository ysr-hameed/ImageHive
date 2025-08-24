import express from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { initializeDatabase } from "./db";

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for secure cookies in production
app.set('trust proxy', 1);

// Setup routes
registerRoutes(app);

// Setup Vite or static serving
if (process.env.NODE_ENV === "development") {
  const httpServer = createServer(app);
  setupVite(app, httpServer);
} else {
  serveStatic(app);
}

// Initialize database and start server
async function startServer() {
  await initializeDatabase();
  
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);