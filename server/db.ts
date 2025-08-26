
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Ensure DATABASE_URL is required for PostgreSQL
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required for PostgreSQL connection");
}

const DATABASE_URL = process.env.DATABASE_URL;

console.log('Database URL configured: Yes (PostgreSQL)');

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
  imageAnalytics,
  folders,
  seoSettings,
  emailCampaigns,
  emailLogs
} = schema;

// Initialize database tables
export async function initializeDatabase() {
  try {
    console.log('Initializing PostgreSQL database tables...');

    try {
      // First, test the database connection
      console.log('Testing PostgreSQL connection...');
      await db.select().from(users).limit(1);
      console.log('PostgreSQL connection successful - tables already exist');
    } catch (dbError) {
      // If connection fails or tables don't exist, try to create them
      console.log('Tables may not exist, attempting to create them...');
      
      try {
        // Use Drizzle's push to create tables
        const { execSync } = await import('child_process');
        console.log('Creating PostgreSQL database tables...');
        execSync('npm run db:push --force', { stdio: 'inherit' });
        console.log('PostgreSQL database tables created successfully');
        
        // Verify tables were created
        await db.select().from(users).limit(1);
        console.log('PostgreSQL database schema synchronized and verified');
      } catch (createError) {
        console.error('Failed to create PostgreSQL tables:', createError);
        console.log('App will continue but database features may not work');
      }
    }
  } catch (error) {
    console.error('PostgreSQL database initialization error:', error);
    console.log('App will continue in limited mode');
  }
}
