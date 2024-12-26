import express from 'express';
import { sendAll, sendBySearch, sendFriends } from '../Controllers/homeController.js';

const router = express.Router();

router.get('/', sendAll);
router.post('/f', sendFriends);
router.post('/search', sendBySearch);

export default router