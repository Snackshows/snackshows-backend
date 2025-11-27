import crypto from 'crypto';
export function generateApiKeyPair() {
	return {
		key: `pk_${crypto.randomBytes(16).toString('hex')}`,
		secret: `sk_${crypto.randomBytes(32).toString('hex')}`,
	};
}

// export async function createApiKey({ storeId, label, scopes, platform }: { storeId: number; label: string; scopes: string; platform: string }) {
// 	const { key, secret } = generateApiKeyPair();
// 	const secretHash = await bcrypt.hash(secret, 12);

// 	await db.insert(apiKeys).values({
// 		store_id: storeId,
// 		key,
// 		secret_hash: secretHash,
// 		scopes,
// 		label,
// 		platform,
// 	});

// 	return { key, secret }; // show only once
// }
