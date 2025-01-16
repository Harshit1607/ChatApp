import express from 'express';
import { changePhoto, deletePhoto, login, setAbout, signup } from '../Controllers/userController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/profile', changePhoto);
router.post('/deleteprofile', deletePhoto);
router.post('/about', setAbout);


export default router;
