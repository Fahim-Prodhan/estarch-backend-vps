import express from 'express'

import { createOrUpdateFooterContent,getFooterContent } from '../controllers/footerContentsController.js';
import visitMiddleware from '../middleware/visitMiddleware.js';

const router = express.Router();

router.get("/",visitMiddleware , getFooterContent);
router.put("/", createOrUpdateFooterContent);

export default router;