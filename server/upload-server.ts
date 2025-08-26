` tags.

<replit_final_file>
import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db';
import { registerRoutes } from './routes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.UPLOAD_PORT || "5002", 10);
const HOST = '0.0.0.0';

console.log(`🔧 Running Upload Server in ${process.env.NODE_ENV || 'development'} mode`);

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
  res.json({ status: 'OK', service: 'upload', timestamp: new Date().toISOString() });
});

// Upload routes only
registerRoutes(app);

// Initialize database and start server
async function startUploadServer() {
  try {
    console.log('🔧 Starting Upload Server initialization...');
    await initializeDatabase();
    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }

  app.listen(PORT, HOST, () => {
    console.log(`📤 Upload Server running on http://${HOST}:${PORT}`);
    console.log(`☁️  Backblaze: ${process.env.BACKBLAZE_APPLICATION_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`🗄️  Database: ${process.env.DATABASE_URL ? '✅ Connected' : '❌ Not configured'}`);
  });
}

startUploadServer().catch((error) => {
  console.error('Failed to start upload server:', error);
  process.exit(1);
});