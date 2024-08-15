import express from 'express';
import {
    createOrUpdateHomeImage,
    getHomeImage,
    deleteHomeImage,
    toggleHomeImageStatus
} from '../controllers/HomeImageController.js';  // Import your controller methods
import uploader from '../middleware/uploader.js'; // To handle file uploads

const router = express.Router();


router.post('/',uploader.array('images', 10), createOrUpdateHomeImage);  // Create
router.put('/:id',uploader.array('images', 10), createOrUpdateHomeImage);  // Update

// Route to get all HomeImages
router.get('/', getHomeImage);

// Route to delete a specific HomeImage by ID
router.delete('/:id', deleteHomeImage);

// Route to toggle active status of a specific HomeImage by ID
router.patch('/:id/status', toggleHomeImageStatus);

export default router;
