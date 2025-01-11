import express from 'express';
import { changeGroupPhoto, createGroup, leaveGroup, makeAdmin, openGroup } from '../Controllers/groupController.js';

const router = express.Router();

router.post('/open', openGroup);
router.post('/create', createGroup);
router.post('/profile', changeGroupPhoto)
router.post('/leave', leaveGroup);
router.post('/admin', makeAdmin);


export default router