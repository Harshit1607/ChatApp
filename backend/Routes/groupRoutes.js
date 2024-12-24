import express from 'express';
import { openGroup } from '../Controllers/groupController.js';

const router = express.Router();

router.post('/open', openGroup);


export default router