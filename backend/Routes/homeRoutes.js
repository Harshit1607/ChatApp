import express from 'express';
import { getProfile, sendAll, sendBySearch, sendFriends } from '../Controllers/homeController.js';

const router = express.Router();

router.get('/', sendAll);
router.post('/f', sendFriends);
router.post('/search', sendBySearch);
router.post('/getprofile', getProfile);

export default router