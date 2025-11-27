import 'dotenv/config';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export async function runMigrations() {
  let migrationPool: Pool | null = null;
  
  try {
    console.log('🔄 Running migrations...');
    migrationPool = new Pool();
    const migrationDb = drizzle(migrationPool, { schema });
    
    await migrate(migrationDb, { 
      migrationsFolder: './src/db/migrations/meta',
      migrationsTable: 'drizzle_migrations'
    });
    
    console.log('✅ Migrations complete.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (migrationPool) {
      await migrationPool.end();
    }
  }
}
