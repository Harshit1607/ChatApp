import express from 'express';
import { getLanguages } from '../Controllers/TranslationController.js';
const router = express.Router();

router.get('/', getLanguages)

export default router;