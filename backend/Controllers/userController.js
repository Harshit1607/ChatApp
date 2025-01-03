import User from '../models/user.js'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken';
import { redisClient } from '../redis.js';

dotenv.config();
const jwt_secret = process.env.JWT_SECRET

export const signup = async (req, res) =>{
  const {name, phone, email, pass} = req.body;
  try {
    const existingUser = await User.findOne({email});
    if(existingUser){
      return res.status(200).json({message: "User already exists"})
    }
    const hashedpass = await bcrypt.hash(pass, 10);
    const user = new User({name, email, phone, password: hashedpass});
    await user.save();
    const token = jwt.sign({email: user.email, id: user._id}, jwt_secret, { expiresIn: '1h' })
    return res.json({user, token, message: 'signed up'})
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to sign up' });
  }
}

export const login = async (req, res) =>{
  const {phone, pass} = req.body;
  try {
    const user = await User.findOne({phone});
    if(!user){
      return res.status(200).json({message: "User doesn't exists"})
    }
    const isPassCorrect = await bcrypt.compare(pass, user.password);
    if(!isPassCorrect){
       return res.status(200).json({message: "Password Incorrect"})
    }
    const token =  jwt.sign({email: user.email, id: user._id}, jwt_secret, { expiresIn: '1h' })

    res.json({user, token, message: 'logged in'})
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to Login' });
  }
}

const formatDateTime = (date) => {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const amPm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convert to 12-hour format, handle 0 as 12

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);

  return `${hours}:${minutes} ${amPm} ${month}/${day}/${year}`;
};

export const markUserOnline = async (user) =>{
  const currentTime = new Date();
  const time = formatDateTime(currentTime)
  await redisClient.set(`user:${user._id}:status`, 'online'); 
  await redisClient.set(`user:${user._id}:last_seen`, time);
}

export const markUserOffline = async (user) =>{
  const currentTime = new Date();
  const time = formatDateTime(currentTime)
  await redisClient.set(`user:${user}:status`, 'offline'); 
  await redisClient.set(`user:${user}:last_seen`, time);
}

export const checkUserOnline = async (user) =>{
  const status = await redisClient.get(`user:${user._id}:status`); 
  const lastSeen =await redisClient.get(`user:${user._id}:last_seen`);
  return {status, lastSeen}
}