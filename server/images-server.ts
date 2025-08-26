import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db';
import { registerRoutes } from './routes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.IMAGES_PORT || "5003", 10);
const HOST = '0.0.0.0';

console.log(`🔧 Running Images Server in ${process.env.NODE_ENV || 'development'} mode`);

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'images', timestamp: new Date().toISOString() });
});

// Images routes only
registerRoutes(app);

// Initialize database and start server
async function startImagesServer() {
  try {
    console.log('🔧 Starting Images Server initialization...');
    await initializeDatabase();
    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }

  app.listen(PORT, HOST, () => {
    console.log(`🖼️  Images Server running on http://${HOST}:${PORT}`);
    console.log(`🗄️  Database: ${process.env.DATABASE_URL ? '✅ Connected' : '❌ Not configured'}`);
  });
}

startImagesServer().catch((error) => {
  console.error('Failed to start images server:', error);
  process.exit(1);
});