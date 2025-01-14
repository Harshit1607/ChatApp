import express from 'express';
import { changeGroupPhoto, createGroup, leaveGroup, makeAdmin, openGroup, setDescription } from '../Controllers/groupController.js';

const router = express.Router();

router.post('/open', openGroup);
router.post('/create', createGroup);
router.post('/profile', changeGroupPhoto)
router.post('/leave', leaveGroup);
router.post('/admin', makeAdmin);
router.post('/description', setDescription);


export default router