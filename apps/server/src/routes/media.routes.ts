import { Router } from 'express';
import {
	checkUploadStatus,
	deleteAObject,
	getMediaFiles,
	listAllObjects,
	uploadFileToS3,
	uploadProfileImage,
	viewUrl,
} from '../controllers/media.controllers';

const router = Router();

// Product routes

// Get presigned URL for upload
router.route('/upload-url').post(uploadFileToS3);

// Check upload status
router.route('/files').get(getMediaFiles);
router.route('/files/:mediaId').get(getMediaFiles);
// router.route('/files').get(listAllObjects);
router.get('/upload-status/:fileName', checkUploadStatus);

router.route('/view').get(viewUrl);

router.route('/').get(listAllObjects).delete(deleteAObject);

router.route('/profile-pic').post(uploadProfileImage);
// .get(getProfileImage)
// .put(updateProfileImage);

export default router;
