import express from 'express';
import { sendAll } from '../Controllers/homeController.js';

const router = express.Router();

router.get('/', sendAll);

export default router