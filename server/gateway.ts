
import express from 'express';
import cors from 'cors';
import { createServer } from "http";
import { setupVite, serveStatic } from "./vite";
import { initializeDatabase } from "./db";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);
const HOST = '0.0.0.0'; // Use 0.0.0.0 for proper access in Replit preview
const STATUS = process.env.STATUS || 'development';
const isProduction = STATUS === 'production';

// Service ports
const AUTH_PORT = process.env.AUTH_PORT || "5001";
const UPLOAD_PORT = process.env.UPLOAD_PORT || "5002";
const IMAGES_PORT = process.env.IMAGES_PORT || "5003";
const ADMIN_PORT = process.env.ADMIN_PORT || "5004";

console.log(`🔧 Running API Gateway in ${STATUS} mode`);

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Trust proxy for secure cookies in production
app.set('trust proxy', 1);

// Health check for gateway
app.get('/health', (req, res) => {
  res.json({ 
    service: 'gateway', 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      auth: `http://localhost:${AUTH_PORT}`,
      upload: `http://localhost:${UPLOAD_PORT}`,
      images: `http://localhost:${IMAGES_PORT}`,
      admin: `http://localhost:${ADMIN_PORT}`
    }
  });
});

// Proxy middleware
const createProxy = (targetPort: string) => {
  return async (req: express.Request, res: express.Response) => {
    try {
      const targetUrl = `http://localhost:${targetPort}${req.originalUrl}`;
      
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: {
          'Content-Type': req.headers['content-type'] || 'application/json',
          'Authorization': req.headers.authorization || '',
          ...req.headers as Record<string, string>
        },
        body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
      });

      const data = await response.text();
      
      res.status(response.status);
      res.set(Object.fromEntries(response.headers.entries()));
      
      try {
        res.json(JSON.parse(data));
      } catch {
        res.send(data);
      }
    } catch (error) {
      console.error(`Proxy error for ${req.originalUrl}:`, error);
      res.status(503).json({ error: 'Service unavailable' });
    }
  };
};

// Route to services
app.use('/api/v1/auth', createProxy(AUTH_PORT));
app.use('/api/v1/images/upload', createProxy(UPLOAD_PORT));
app.use('/api/v1/images', createProxy(IMAGES_PORT));
app.use('/api/v1/public/images', createProxy(IMAGES_PORT));
app.use('/api/v1/admin', createProxy(ADMIN_PORT));

// API health status
app.get("/api/v1/status", async (req, res) => {
  try {
    let dbStatus = "not configured";
    if (process.env.DATABASE_URL) {
      try {
        await initializeDatabase();
        dbStatus = "connected";
      } catch {
        dbStatus = "error";
      }
    }

    res.json({
      api: "online",
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({ error: "Status check failed" });
  }
});

// Setup Vite or static serving
if (!isProduction) {
  const httpServer = createServer(app);
  setupVite(app, httpServer);
} else {
  serveStatic(app);
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Gateway error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: !isProduction ? err.message : 'Something went wrong'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

async function startGateway() {
  try {
    console.log('🔧 Starting API Gateway...');
    await initializeDatabase();
    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed, but continuing:', error);
  }

  app.listen(PORT, HOST, () => {
    console.log(`🚀 API Gateway running on http://${HOST}:${PORT}`);
    console.log(`🔗 Routing to microservices:`);
    console.log(`   🔐 Auth: http://localhost:${AUTH_PORT}`);
    console.log(`   📤 Upload: http://localhost:${UPLOAD_PORT}`);
    console.log(`   🖼️  Images: http://localhost:${IMAGES_PORT}`);
    console.log(`   ⚙️  Admin: http://localhost:${ADMIN_PORT}`);
  });
}

startGateway().catch((error) => {
  console.error('Failed to start gateway:', error);
  process.exit(1);
});
