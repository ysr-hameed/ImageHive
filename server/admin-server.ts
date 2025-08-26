import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db';
import { registerRoutes } from './routes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.ADMIN_PORT || "5004", 10);
const HOST = '0.0.0.0';

console.log(`🔧 Running Admin Server in ${process.env.NODE_ENV || 'development'} mode`);

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
  res.json({ status: 'OK', service: 'admin', timestamp: new Date().toISOString() });
});

// Admin routes only
registerRoutes(app);

// Initialize database and start server
async function startAdminServer() {
  try {
    console.log('🔧 Starting Admin Server initialization...');
    await initializeDatabase();
    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }

  app.listen(PORT, HOST, () => {
    console.log(`⚙️  Admin Server running on http://${HOST}:${PORT}`);
    console.log(`📧 Email service: ${process.env.GMAIL_USER ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`🗄️  Database: ${process.env.DATABASE_URL ? '✅ Connected' : '❌ Not configured'}`);
  });
}

startAdminServer().catch((error) => {
  console.error('Failed to start admin server:', error);
  process.exit(1);
});