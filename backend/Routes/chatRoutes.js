import express from 'express';
import { deleteForAll, deleteForMe, getChats, newChat } from '../Controllers/chatController.js';

const router = express.Router();

router.post('/all', getChats);
router.post('/new', newChat);
router.post('/delete', deleteForMe);
router.post('/deleteAll', deleteForAll);

export default router