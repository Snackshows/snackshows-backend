import { relations } from 'drizzle-orm';
import {
	boolean,
	pgEnum,
	pgTable,
	text,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core';
import { ulid } from 'ulid';


export const paymentGatewayEnum = pgEnum('payment_gateway', [
	'stripe',
	'razorpay',
	'phonepe',
	'paytm',
]);

export const GatewayConfigs = pgTable('gateway_configs', {
	id: varchar('id')
		.primaryKey()
		.notNull()
		.$defaultFn(() => ulid()),
	
	gateway: paymentGatewayEnum(), // 'stripe' | 'razorpay' | etc
	apiKey: text('api_key').notNull().unique(),
	apiSecret: text('api_secret').notNull().unique(),
	apiUrl: varchar('api_url'),
	isDefault: boolean('is_default').notNull().default(false),
	isTestMode: boolean('is_test_mode').notNull().default(false),
	active: boolean('active').notNull().default(true),
	createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

export const GatewayConfigsRelations = relations(GatewayConfigs, ({ one }) => ({
	
}));
