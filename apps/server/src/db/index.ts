import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema/index';
import { Pool } from 'pg';

// type DbMode = 'dev' | 'prod';

// const mode: DbMode = process.env.DATABASE_URL!.includes('localhost')
// 	? 'dev'
// 	: 'prod';

// const ssl =
// 	mode === 'dev'
// 		? {
// 				rejectUnauthorized: false,
// 			}
// 		: true;

const pool = new Pool({
	connectionString: process.env.DATABASE_URL!,
	
});

export const db = drizzle(pool, { schema });

export { pool };
