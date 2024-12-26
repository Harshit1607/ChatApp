import express from 'express';
import { createGroup, openGroup } from '../Controllers/groupController.js';

const router = express.Router();

router.post('/open', openGroup);
router.post('/create', createGroup);


export default router