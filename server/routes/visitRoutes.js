import express from 'express';
import { getLast15DaysVisits } from '../controllers/visitController.js';

const router = express.Router();

router.get('/visits/last15days', getLast15DaysVisits);

export default router;
