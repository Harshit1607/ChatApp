import express from 'express';
import { sendAll, sendFriends } from '../Controllers/homeController.js';

const router = express.Router();

router.get('/', sendAll);
router.post('/f', sendFriends);

export default router