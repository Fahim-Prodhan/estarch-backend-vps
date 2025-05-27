import express from 'express';
import {
  getSalesmen,
  createSalesman,
  updateSalesman,
  deleteSalesman,
  getTop3AndTotals
} from '../controllers/salesmanController.js';

const router = express.Router();

router.get('/', getSalesmen);
router.post('/', createSalesman);
router.put('/:id', updateSalesman);
router.delete('/:id', deleteSalesman);
router.get('/summary/top3', getTop3AndTotals);

export default router;
