import express from 'express';
import cors from 'cors';
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { initializeDatabase } from "./db";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);
const HOST = '0.0.0.0';
const STATUS = process.env.NODE_ENV || 'development';
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
    console.log('🔧 Starting server initialization...');
    await initializeDatabase();
    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed, but continuing:', error);
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on http://${HOST}:${PORT}`);
    // Determine if email and backblaze are configured for logging
    const emailConfigured = process.env.GMAIL_USER && process.env.GMAIL_PASS && process.env.GMAIL_HOST && process.env.GMAIL_PORT;
    const backblazeConfigured = process.env.BACKBLAZE_KEY_ID && process.env.BACKBLAZE_APPLICATION_KEY && process.env.BACKBLAZE_BUCKET_ID;
    const isDatabaseConfigured = process.env.DATABASE_URL;

    console.log('📧 Email service:', emailConfigured ? '✅ Configured' : '❌ Not configured');
    console.log('🗄️  PostgreSQL Database:', isDatabaseConfigured ? '✅ Connected' : '❌ Not configured');
    console.log('☁️  Backblaze:', process.env.BACKBLAZE_APPLICATION_KEY_ID ? '✅ Configured' : '❌ Not configured');

    // Log system information
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
      memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      uptime: Math.round(process.uptime()) + 's'
    };

    console.log('💻 System Info:', JSON.stringify(systemInfo, null, 2));
    console.log('🎉 Server startup completed successfully!');

    // Set up process error handlers
    process.on('uncaughtException', (error) => {
      console.error('🚨 Uncaught Exception:', error);
      console.error('Stack:', error.stack);
      // Don't exit, just log the error
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('🚨 Unhandled Rejection at:', promise);
      console.error('Reason:', reason);
    });

    // Log memory usage periodically
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const formatMB = (bytes: number) => Math.round(bytes / 1024 / 1024) + 'MB';

      console.log('💾 Memory Usage:', {
        rss: formatMB(memUsage.rss),
        heapTotal: formatMB(memUsage.heapTotal),
        heapUsed: formatMB(memUsage.heapUsed),
        external: formatMB(memUsage.external)
      });
    }, 60000); // Log every minute
  });

  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`❌ Port ${PORT} is already in use`);
      process.exit(1);
    } else {
      console.log(`❌ Server error: ${error.message}`);
      process.exit(1);
    }
  });

  process.on('SIGTERM', () => {
    console.log('👋 Received SIGTERM, shutting down gracefully');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('👋 Received SIGINT, shutting down gracefully');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});