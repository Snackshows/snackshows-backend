export const aws_s3_config = {
	bucket: process.env.S3_BUCKET_NAME!,
	region: process.env.REGION!,
	access_key: process.env.ACCESS_KEY_ID!,
	secret_key: process.env.SECRET_ACCESS_KEY!,
};
