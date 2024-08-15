import express from 'express';
import {
    createOrUpdateVideo,
    getVideos,
    deleteVideo,
    toggleVideoStatus
} from '../controllers/videoController.js'; // Adjust the path as needed

const router = express.Router();
router.put('/:id', createOrUpdateVideo);

router.post('/', createOrUpdateVideo);
router.get('/', getVideos);
router.delete('/:id', deleteVideo);
router.patch('/:id/status', toggleVideoStatus);

export default router;
