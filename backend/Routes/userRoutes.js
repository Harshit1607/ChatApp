import express from 'express';
import { changePhoto, deletePhoto, login, signup } from '../Controllers/userController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login)
router.post('/profile', changePhoto)
router.post('/deleteprofile', deletePhoto)

export default router;
