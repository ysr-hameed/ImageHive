import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Initialize database tables
export async function initializeDatabase() {
  try {
    console.log('Initializing database tables...');
    
    // Create tables if they don't exist using Drizzle push
    const { execSync } = await import('child_process');
    execSync('npm run db:push --force', { stdio: 'inherit' });
    
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    // Don't throw - app should still start even if db init fails
  }
}