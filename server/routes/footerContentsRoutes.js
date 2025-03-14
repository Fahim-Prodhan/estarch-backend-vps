import express from 'express'

import { createOrUpdateFooterContent,getFooterContent } from '../controllers/footerContentsController.js';

const router = express.Router();

router.get("/", getFooterContent);
router.put("/", createOrUpdateFooterContent);

export default router;