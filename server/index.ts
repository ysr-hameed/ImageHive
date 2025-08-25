import express from 'express';
import cors from 'cors';
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { initializeDatabase } from "./db";
import dotenv from 'dotenv';
import adminRoutes from './admin'; // Import admin routes

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);
const STATUS = process.env.STATUS || 'development';
const isProduction = STATUS === 'production';

console.log(`🔧 Running in ${STATUS} mode`);

// Middleware
app.use(cors({
  origin: true, // Allow all origins for development and API access
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Trust proxy for secure cookies in production
app.set('trust proxy', 1);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Setup routes
registerRoutes(app);

// Admin routes
app.use("/api/v1/admin", adminRoutes);

// Setup Vite or static serving
if (!isProduction) {
  const httpServer = createServer(app);
  setupVite(app, httpServer);
} else {
  serveStatic(app);
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: !isProduction ? err.message : 'Something went wrong'
  });
});

// 404 handler for API routes only (Vite handles client routes)
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
  } catch (error) {
    console.error('Database initialization failed, but continuing:', error);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`📧 Email service: ${process.env.GMAIL_USER ? 'Configured' : 'Not configured'}`);
    console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
    console.log(`☁️  Backblaze: ${process.env.BACKBLAZE_KEY_ID && process.env.BACKBLAZE_APPLICATION_KEY && process.env.BACKBLAZE_BUCKET_ID ? 'Configured' : 'Not configured'}`);
    
    if (!process.env.DATABASE_URL) {
      console.log('⚠️  Warning: DATABASE_URL not set. Some features may not work.');
    }
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});