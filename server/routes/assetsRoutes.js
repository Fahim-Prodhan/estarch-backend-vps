import express from 'express';
import { createAsset,updateAsset,getAllAssets } from "../controllers/assetsController.js"; 
const router = express.Router();

router.post('/create',createAsset)
router.get('/',getAllAssets)
router.put('/:id',updateAsset)

export default router;