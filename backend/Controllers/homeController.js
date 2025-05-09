import User from '../models/user.js'
import Group from '../models/groups.js'
import Chat from '../models/chats.js'
import {getBucket} from '../config/firebaseAdmin.js';
import { v4 as uuidv4 } from "uuid";

export const sendAll = async (req, res)=>{
  try {
    const allUsers = await User.find({}, '_id name phone');

    res.status(200).json({allUsers});
  } catch (error) {
    res.status(500).json({error: error});
  }
}

export const sendFriends = async (req, res) => {
  const {user} = req.body;
  try {
    const allFriends = await Group.find({ Users: { $in: [user._id] } }).sort({ updatedAt: -1 }).select('_id name isGroup Users Admin description UserDetails');;
    res.status(200).json({allFriends});
  } catch (error) {
    res.status(500).json({error: error});
  }
}

export const sendBySearch = async (req, res) => {
  const {text} = req.body;
  try {
    const searchUsers = await User.find({name: {$regex: text, $options: 'i'}}, '_id name phone');
    res.status(200).json({searchUsers});
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to get users' });
  }
}

export const getProfile = async (req, res) => {
  const { id } = req.body;
  console.log("Requested ID:", id);

  try {
    let profileOwner = null;     // Either a User or Group document
    let profileType = null;      // "user" or "group"

    // Check if it's a User
    const user = await User.findById(id);
    if (user && user.profile) {
      profileOwner = user;
      profileType = "user";
    }

    // If not a User, check if it's a Group
    if (!profileOwner) {
      const group = await Group.findById(id);
      if (group && group.profile) {
        profileOwner = group;
        profileType = "group";
      }
    }

    if (!profileOwner) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const { profile, mediaExpiresAt } = profileOwner;

    if (!profile) {
      return res.status(404).json({ error: "Profile image not set" });
    }

    const bucket = await getBucket();
    if (!bucket) return res.status(500).json({ error: "Storage bucket unavailable" });

    const currentTime = Date.now();
    const expirationTime = new Date(mediaExpiresAt).getTime();

    // If expired or about to expire
    if (expirationTime < currentTime) {
      console.log("Profile signed URL expired. Regenerating...");

      const file = bucket.file(`profile_images/${profile}`); // profile = filename
      const newExpiresAt = Date.now() + 365 * 24 * 60 * 60 * 1000; // 1 year

      const [newUrl] = await file.getSignedUrl({
        action: 'read',
        expires: newExpiresAt
      });

      // Update profile URL and expiration
      profileOwner.profile = newUrl;
      profileOwner.mediaExpiresAt = new Date(newExpiresAt);
      await profileOwner.save();

      return res.status(200).json(newUrl);
    }

    // If not expired, return existing signed URL
    return res.status(200).json({ url: profile });

  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ error: "Failed to get profile" });
  }
};



export const findUser = async (id)=>{
  const newUser = await User.findById(id);
  return newUser;
}

export const getUser = async (req, res)=>{
  const {id} =req.body;
  try {
    const newUser = await findUser(id);
    res.status(200).json({newUser});
  } catch (error) {
    res.status(500).json({ error: 'Failed to Update' });
  }
}