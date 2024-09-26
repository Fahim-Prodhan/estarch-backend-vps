import express from 'express';
import {
  createShowroomOrderHold,
  getAllShowroomOrderHolds,
  getShowroomOrderHoldById,
  updateShowroomOrderHold,
  deleteShowroomOrderHold,
  getOrdersByUser
} from '../controllers/showRoomOrderHoldController.js'; // Adjust path as necessary

const router = express.Router();

// Route to create a new showroom order hold
router.post('/', createShowroomOrderHold);

// Route to get all showroom order holds
router.get('/', getAllShowroomOrderHolds);

// Route to get a specific showroom order hold by ID
router.get('/:id', getShowroomOrderHoldById);

// Route to update a showroom order hold by ID
router.put('/:id', updateShowroomOrderHold);

// Route to delete a showroom order hold by ID
router.delete('/:id', deleteShowroomOrderHold);
router.get('/user/:userId', getOrdersByUser);

export default router;
