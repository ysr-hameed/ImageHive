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
        // First, test the database connection
        console.log('Testing database connection...');
        await db.select().from(users).limit(1);
        console.log('Database connection successful - tables already exist');
      } catch (dbError) {
        // If connection fails or tables don't exist, try to create them
        console.log('Tables may not exist, attempting to create them...');
        
        try {
          // Use Drizzle's push to create tables
          const { execSync } = await import('child_process');
          console.log('Creating database tables...');
          execSync('npm run db:push --force', { stdio: 'inherit' });
          console.log('Database tables created successfully');
          
          // Verify tables were created
          await db.select().from(users).limit(1);
          console.log('Database schema synchronized and verified');
        } catch (createError) {
          console.error('Failed to create tables:', createError);
          console.log('App will continue but database features may not work');
        }
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