import express from 'express';
import { getLanguages, translateText } from '../Controllers/TranslationController.js';
const router = express.Router();

router.get('/', getLanguages);
router.post('/text', translateText);

export default router;