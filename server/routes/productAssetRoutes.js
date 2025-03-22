import express from 'express';
import { createProductAsset,updateProductAsset,getAllProductAssets } from "../controllers/productAssetController.js"; 
const router = express.Router();

router.post('/create',createProductAsset)
router.get('/',getAllProductAssets)
router.put('/:id',updateProductAsset)

export default router;