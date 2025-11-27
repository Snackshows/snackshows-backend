import {
	DeleteObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
	ListObjectsV2Command,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { aws_s3_config } from '../config/aws-sdk-s3.config';

const s3Client = new S3Client({
	region: aws_s3_config.region,
	credentials: {
		accessKeyId: aws_s3_config.access_key,
		secretAccessKey: aws_s3_config.secret_key,
	},
});

export const uploadToS3 = async ({
	fileName,
	contentType,
	rootFolder,
}: {
	fileName: string;
	contentType: string;
	rootFolder: string;
}) => {
	// const newFileName = `pic_${Date.now().toString()}`;
	//generate a unique Name
	const uniqueFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.]/g, '_')}`;

	const command = new PutObjectCommand({
		Bucket: aws_s3_config.bucket,
		Key: `${rootFolder}/${uniqueFileName}`,
		ContentType: contentType,
	});

	const uploadUrl = await getSignedUrl(s3Client, command, {
		expiresIn: 3600,
	});

	const publicS3Url = `https://${aws_s3_config.bucket}.s3.${aws_s3_config.region}.amazonaws.com/${rootFolder}/${uniqueFileName}`;

	return {
		uploadUrl,
		fileName: uniqueFileName,
		publicS3Url,
		key: `${rootFolder}/${uniqueFileName}`,
	};
};

export const getObjectMetaData = async ({ fileName }: { fileName: string }) => {
	const command = new HeadObjectCommand({
		Bucket: aws_s3_config.bucket,
		Key: `products/${fileName}`,
	});

	const result = await s3Client.send(command);
	console.log(result);
	return result;
};

export const getObjectUrl = async ({ key }: { key: string }) => {
	const command = new GetObjectCommand({
		Bucket: aws_s3_config.bucket,
		Key: key,
	});

	console.log(command);

	const url = await getSignedUrl(s3Client, command);
	return url;
};

export const listObjects = async () => {
	const command = new ListObjectsV2Command({
		Bucket: aws_s3_config.bucket,
	});

	const result = await s3Client.send(command);

	return result;
};

export const deleteObject = async ({ key }: { key: string }) => {
	const command = new DeleteObjectCommand({
		Bucket: aws_s3_config.bucket,
		Key: key,
	});

	const result = await s3Client.send(command);

	return result;
};
