import express from 'express';
import { deleteForMe, getChats, newChat } from '../Controllers/chatController.js';

const router = express.Router();

router.post('/all', getChats);
router.post('/new', newChat);
router.post('/delete', deleteForMe);


export default router