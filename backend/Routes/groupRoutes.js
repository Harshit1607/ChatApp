import express from 'express';
import { changeGroupPhoto, createGroup, openGroup } from '../Controllers/groupController.js';

const router = express.Router();

router.post('/open', openGroup);
router.post('/create', createGroup);
router.post('/profile', changeGroupPhoto)


export default router