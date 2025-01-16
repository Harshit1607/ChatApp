import express from 'express';
import { getProfile, getUser, sendAll, sendBySearch, sendFriends } from '../Controllers/homeController.js';

const router = express.Router();

router.get('/', sendAll);
router.post('/f', sendFriends);
router.post('/search', sendBySearch);
router.post('/getprofile', getProfile);
router.post('/getUser', getUser);

export default router