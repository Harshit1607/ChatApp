import User from '../models/user.js'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken';
import { redisClient } from '../redis.js';
import {getBucket} from '../config/firebaseAdmin.js';
import { v4 as uuidv4 } from "uuid";
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
  await redisClient.set(`user:${user}:status`, 'online'); 
  await redisClient.set(`user:${user}:last_seen`, time);
}

export const markUserOffline = async (user) =>{
  const currentTime = new Date();
  const time = formatDateTime(currentTime)
  await redisClient.set(`user:${user}:status`, 'offline'); 
  await redisClient.set(`user:${user}:last_seen`, time);
}

export const checkUserOnline = async (user) =>{
  const status = await redisClient.get(`user:${user}:status`); 
  const lastSeen =await redisClient.get(`user:${user}:last_seen`);
  return {status, lastSeen}
}


// Utility function to extract filename from GCS URL
const extractFilenameFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return decodeURIComponent(urlObj.pathname.split('/').pop());
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
};

// Utility function to delete old profile photo
const deleteOldProfilePhoto = async (bucket, oldPhotoUrl) => {
  if (!oldPhotoUrl) return;
  
  try {
    const filename = `profile_images/${extractFilenameFromUrl(oldPhotoUrl)}`;
    const file = bucket.file(filename);
    const [exists] = await file.exists();
    
    if (exists) {
      await file.delete();
      console.log('Old profile photo deleted successfully');
    }
  } catch (error) {
    console.error('Error deleting old profile photo:', error);
    // Don't throw error here as this is a cleanup operation
  }
};

export const changePhoto = async (req, res) => {
  try {
    const { image, user: userId } = req.body;

    // Input validation
    if (!image) {
      return res.status(400).json({ error: "Image data is required" });
    }
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Find user first to verify existence
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get Firebase bucket
    const bucket = await getBucket();
    if (!bucket) {
      return res.status(500).json({ error: "Storage system not available" });
    }

    // Validate image data
    if (!image.startsWith('data:image')) {
      return res.status(400).json({ error: "Invalid image format" });
    }

    // Extract base64 data
    const base64Data = image.split(';base64,').pop();
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate unique filename
    const filename = `profile_images/${userId}-${uuidv4()}.png`;
    const file = bucket.file(filename);

    // Upload new image
    await file.save(buffer, {
      metadata: {
        contentType: 'image/png',
        cacheControl: 'public, max-age=31536000' // Cache for 1 year
      },
      resumable: false
    });

    // Generate signed URL with longer expiration
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Delete old profile photo if exists
    if (user.profile) {
      await deleteOldProfilePhoto(bucket, user.profile);
    }

    // Update user profile in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          profile: url,
          profileUpdatedAt: new Date()
        } 
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Profile photo updated successfully",
      user: updatedUser,
      imageUrl: url
    });

  } catch (error) {
    console.error("Profile photo update error:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    // Return appropriate error message based on error type
    const errorMessage = error.code === 'LIMIT_FILE_SIZE' 
      ? "Image file is too large" 
      : "Failed to update profile photo";

    res.status(500).json({
      error: errorMessage,
      details: error.message
    });
  }
};

export const deletePhoto = async (req, res) => {
  try {
    const { user: userId } = req.body;

    // Input validation
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user has a profile photo
    if (!user.profile) {
      return res.status(400).json({ error: "No profile photo to delete" });
    }

    // Get Firebase bucket
    const bucket = await getBucket();
    if (!bucket) {
      return res.status(500).json({ error: "Storage system not available" });
    }

    // Delete photo from storage
    await deleteOldProfilePhoto(bucket, user.profile);

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          profile: "",
          profileUpdatedAt: new Date()
        } 
      },
      { new: true }
    );

    res.status(200).json({
      message: "Profile photo deleted successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("Profile photo deletion error:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    res.status(500).json({
      error: "Failed to delete profile photo",
      details: error.message
    });
  }
};


export const setAbout = async (req, res)=>{
  const {user, text} = req.body;
  try {
    const newUser = await User.findByIdAndUpdate(
      user,
      {
        about: text, // Add adminId to the Admin array if it doesn't exist
      },
      { new: true }
    );
    const desc = newUser.about;
    res.status(200).json({ desc });
  } catch (error) {
    res.status(500).json({ error: 'Failed to Update' });
  }
}