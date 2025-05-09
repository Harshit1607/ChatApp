import Group from '../models/groups.js'
import Chat from '../models/chats.js'
import User from'../models/user.js'
import { getIo } from '../Socket/socket.js';
import {getBucket} from '../config/firebaseAdmin.js';
import { v4 as uuidv4 } from "uuid";

export const openGroup = async (req, res) => {
  const { user, other, group } = req.body;
  try {
    if (group) {
      const groupChat = await Group.findById(group._id);
      return res.status(200).json({ groupChat });
    }

    const userArray = [];
    const userIds = [];
    const userElem = await User.findById(user._id, '_id name'); // Use findById for a single document
    const otherElem = await User.findById(other._id, '_id name'); // Use findById for a single document

    if (userElem) userArray.push(userElem); // Push the user object
    if (otherElem) userArray.push(otherElem); // Push the other user object
    userIds.push(user._id, other._id);

    const groupChat = new Group({ UserDetails: userArray, Users: userIds });
    await groupChat.save(); // Make sure to await save()
    const io = getIo();
    io.to(other._id).emit("NewGroupCreated", {groupChat});
    res.status(200).json({ groupChat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to open group' });
  }
};


export const createGroup = async (req, res) => {
  const { name, user, others } = req.body;
  try {
    const userArray = [];
    const userIds = [];
    const admins = [user._id];

    // Fetch and push the creator user
    const userElem = await User.findById(user._id, '_id name'); // Use findById for a single document
    if (userElem) userArray.push(userElem);
    userIds.push(user._id);

    // Fetch and push the other users
    await Promise.all(
      others.map(async (other) => {
        const otherElem = await User.findById(other._id, '_id name'); // Use findById for a single document
        if (otherElem) userArray.push(otherElem);
        userIds.push(other._id);
      })
    );

    const groupChat = new Group({
      name,
      UserDetails: userArray,
      Users: userIds,
      isGroup: true,
      Admin: admins,
    });
    await groupChat.save(); // Make sure to await save()

    const io = getIo();
    others.forEach(other=>{
      io.to(other._id).emit("NewGroupCreated", {groupChat});
    })

    res.status(200).json({ groupChat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to create group' });
  }
};


export const getGroup = async(group)=>{
  const GroupData = await Group.findById(group);
  return GroupData;
}

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

export const changeGroupPhoto = async (req, res) => {
  const { image, group } = req.body;

  try {
    if (!image || !group) {
      return res.status(400).json({ error: 'Image and id are required' });
    }

    let groupChat = await Group.findById(group);
    if (!groupChat) {
      return res.status(404).json({ error: "Group not found" });
    }

    const bucket = await getBucket();
    if (!bucket) {
      return res.status(500).json({ error: "Storage system not available" });
    }

    if (!image.startsWith('data:image')) {
      return res.status(400).json({ error: "Invalid image format" });
    }

    const base64Data = image.split(';base64,').pop();
    const buffer = Buffer.from(base64Data, 'base64');
    const filename = `profile_images/${group}-${uuidv4()}.png`;
    const file = bucket.file(filename);

    await file.save(buffer, {
      metadata: {
        contentType: 'image/png',
        cacheControl: 'public, max-age=31536000'
      },
      resumable: false
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: expiresAt
    });

    if (groupChat.profile) {
      await deleteOldProfilePhoto(bucket, groupChat.profile);
    }

    groupChat = await Group.findByIdAndUpdate(
      group,
      {
        $set: {
          profile: url,
          mediaExpiresAt: expiresAt,
          profileUpdatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ groupChat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update photo' });
  }
};


export const deleteGroupPhoto = async (req, res) => {
  const { group } = req.body;

  try {
    if (!group) {
      return res.status(400).json({ error: "Group id is required" });
    }

    let groupChat = await Group.findById(group);
    if (!groupChat) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (!groupChat.profile) {
      return res.status(400).json({ error: "No profile photo to delete" });
    }

    const bucket = await getBucket();
    if (!bucket) {
      return res.status(500).json({ error: "Storage system not available" });
    }

    await deleteOldProfilePhoto(bucket, groupChat.profile);

    groupChat = await Group.findByIdAndUpdate(
      group,
      {
        $set: {
          profile: "",
          mediaExpiresAt: null,
          profileUpdatedAt: new Date()
        }
      },
      { new: true }
    );

    res.status(200).json({ groupChat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
};


export const leaveGroup = async (req, res) =>{
  const {user, group, newUser} = req.body;
  try {
    const id = newUser ? newUser : user;
    console.log(id)
    const groupChat = await Group.findByIdAndUpdate(
      group,
      {
        $pull: {
          Users: id
        }
      },
      { new: true }
    );
    
    if (groupChat.Users.length === 0) {
      await Group.deleteOne({_id: group})
      return res.status(200).json({ groupChat: null  });
    }

    
    const users = groupChat.Users;
    const userDetails = groupChat.UserDetails;

    const io = getIo();
    groupChat.Users.map(each=>{
      if(each !== user){
        const sent = each.toString();
        io.to(sent).emit("UpdatedGroup", {group, users, userDetails})
      } 
    })
      newUser? io.to(newUser).emit("RemovedFromGroup", {group}) : null;
    
    // Save the updated groupChat document
    await groupChat.save();

    res.status(200).json({ groupChat });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to leave Group' });
  }
}

export const makeAdmin = async (req, res) =>{
  const {user, group, newUser} = req.body;
  try {
    const groupChat = await Group.findByIdAndUpdate(
      group,
      {
        $addToSet: { Admin: newUser }, // Add adminId to the Admin array if it doesn't exist
      },
      { new: true }
    );

    const admins = groupChat.Admin
    const io = getIo();
    groupChat.Users.map(each=>{
      if(each !== user){
        const sent = each.toString();
        io.to(sent).emit("NewAdmin", {group, admins})
      } 
    })
    res.status(200).json({ groupChat });

  } catch (error) {
    res.status(500).json({ error: 'Failed to update photo' });
  }
}

export const setDescription = async (req, res)=>{
  const {group, text, user} = req.body;
  try {
    const groupChat = await Group.findByIdAndUpdate(
      group,
      {
        description: text, // Add adminId to the Admin array if it doesn't exist
      },
      { new: true }
    );
    const io = getIo();
    const desc = groupChat.description;
    groupChat.Users.map(each=>{
      if(each !== user){
        const sent = each.toString();
        io.to(sent).emit("Description", {desc, id})
      } 
    })
    res.status(200).json({ desc, id });
  } catch (error) {
    
  }
}