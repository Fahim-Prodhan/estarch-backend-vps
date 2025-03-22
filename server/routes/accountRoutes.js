import express from 'express';
import { createMainAccount,getAllInvestors,getMainAccountByUserId,getMainAccount,getSingleInvestor,calculateInvestedBalance } from '../controllers/accountController.js';


const router = express.Router();

router.post('/main-account', createMainAccount)
router.get('/main-account', getMainAccount)
router.get('/main-account/:id', getMainAccountByUserId)
router.get('/investors', getAllInvestors )
router.get('/investor/:userId', getSingleInvestor )
router.get('/calculate-invested-balance', calculateInvestedBalance )

export default router;