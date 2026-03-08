import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Singleton pattern for connection pool to prevent exhausting connections
let dbInstance: ReturnType<typeof drizzle> | null = null;
let poolInstance: Pool | null = null;

function getDb() {
  if (!dbInstance || !poolInstance) {
    poolInstance = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      max: 20, // Maximum pool size
      idleTimeoutMillis: 30000, // Close idle connections after 30s
      connectionTimeoutMillis: 2000, // Timeout for acquiring connection
    });
    dbInstance = drizzle(poolInstance, { schema });
  }
  return dbInstance;
}

export const db = getDb();

