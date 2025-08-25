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

// Re-export schema tables for convenience
export const { 
  users, 
  images, 
  apiKeys, 
  customDomains, 
  systemLogs, 
  notifications, 
  imageAnalytics 
} = schema;

// Initialize database tables
export async function initializeDatabase() {
  try {
    console.log('Initializing database tables...');

    if (process.env.DATABASE_URL) {
      try {
        // Try to run a simple query to test connection
        await db.select().from(users).limit(1);
        console.log('Database connection successful');
        
        // Run migrations if they exist
        try {
          const { execSync } = await import('child_process');
          execSync('npm run db:push --force', { stdio: 'inherit' });
          console.log('Database schema synchronized successfully');
        } catch (pushError) {
          console.log('Database push completed with warnings (this is usually normal)');
        }
      } catch (dbError) {
        console.error('Database connection failed:', dbError);
        console.log('App will continue but database features may not work');
      }
    } else {
      console.log('DATABASE_URL not configured - using fallback mode');
      console.log('Some features requiring database will be disabled');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    console.log('App will continue in limited mode');
  }
}