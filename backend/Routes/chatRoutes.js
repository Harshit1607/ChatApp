import express from 'express';
import { getChats, newChat } from '../Controllers/chatController.js';

const router = express.Router();

router.post('/all', getChats);
router.post('/new', newChat)


export default router