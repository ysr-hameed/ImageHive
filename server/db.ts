import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Use a default DATABASE_URL if not provided
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/imagevault';

console.log('Database URL configured:', DATABASE_URL ? 'Yes' : 'No');

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Initialize database tables
export async function initializeDatabase() {
  try {
    console.log('Initializing database tables...');
    
    // Skip database push in development if DATABASE_URL is not properly configured
    if (process.env.DATABASE_URL) {
      const { execSync } = await import('child_process');
      execSync('npm run db:push --force', { stdio: 'inherit' });
      console.log('Database tables initialized successfully');
    } else {
      console.log('Skipping database initialization - DATABASE_URL not configured');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    // Don't throw - app should still start even if db init fails
  }
}