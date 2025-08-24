import express from "express";
import { registerRoutes } from "./routes";
import { setupAuth } from "./replitAuth";
import { setupVite, serveStatic } from "./vite";

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for secure cookies in production
app.set('trust proxy', 1);

// Setup authentication
setupAuth(app);

// Setup routes
registerRoutes(app);

// Setup Vite or static serving
if (process.env.NODE_ENV === "development") {
  setupVite(app);
} else {
  serveStatic(app);
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});