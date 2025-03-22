import express from 'express';
import {
    getCarosul,
    createOrUpdateCarosul,
    deleteCarosul,
    toggleCarosulStatus
} from '../controllers/carosulController.js';
import uploader from '../middleware/uploader.js';

const router = express.Router();

// POST route to create a new carousel or update an existing one
router.post('/', uploader.array('images', 10), createOrUpdateCarosul); // Up to 10 images

// PUT route to update an existing carousel
router.put('/:id', uploader.array('images', 10), createOrUpdateCarosul);

// GET route to retrieve all carousels
router.get('/', getCarosul);

// DELETE route to remove a carousel
router.delete('/:id', deleteCarosul);

// PATCH route to toggle the active status of a carousel
router.patch('/:id', toggleCarosulStatus);

export default router;
