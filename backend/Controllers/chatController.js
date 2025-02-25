import Group from '../models/groups.js'
import Chat from '../models/chats.js'
import { getIo } from '../Socket/socket.js';
import { getBucket } from '../config/firebaseAdmin.js';
import { v4 as uuidv4 } from "uuid";

export const getChats = async (req,res)=>{
  const {group, user} = req.body;
  try {
    await Chat.updateMany(
      { Group: group._id }, // Match the group
      { $addToSet: { 'message.viewedBy': user._id } } // Add user to `viewedBy` only if not already present
    );
    const chats = await Chat.find({Group: group._id}).sort({ createdAt: -1 });
    res.status(200).json({chats});
  } catch (error) {
    console.log(error)
    res.status(500).json({error: "Unable to load chats"});
  }
}

const mediaChat = async (image, userId)=>{
  // Get Firebase bucket
  const bucket = await getBucket();
  if (!bucket) {
    throw new Error("Storage system not available");
  }

  // Validate image data
  if (!image.startsWith('data:image')) {
    throw new Error("Invalid image format");
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
  return url;
}

export const newChat = async (req, res) => {
  const { text, user, group, isMedia } = req.body;

  try {
    const newChat = await createNewChat({ text, user, group, isMedia });
    res.status(200).json({ newChat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to load chats" });
  }
};

export const createNewChat = async ({ text, user, group, isMedia }) => {
  // Validate the input
  if (!text || !user || !group) {
    throw new Error("Invalid input data");
  }

  const GroupData = await Group.findById(group)

  let chatData;
  // Create the chat object

  if(isMedia){
    text = await mediaChat(text, user);
  }
  chatData = {
    message: {
      message: text,
      sentBy: user,
      viewedBy: user
    },
    Users: GroupData.Users || [], // Ensure Users is an array
    Group: group,
    isMedia: isMedia,
  };

  // Save the new chat
  const newChat = new Chat(chatData);
  await newChat.save();

  return newChat;
};


export const getLatestChat = async ({ group }) => {
  try {
    const message = await Chat.findOne({ Group: group })
      .sort({ createdAt: -1 })
      .exec(); // Use exec() for better debugging with Promises
    return message;
  } catch (error) {
    console.error("Error in getLatestChat:", error);
    throw error;
  }
};

export const viewChat = async ({ group, user }) => {
  try {
    if (!group || !user) {
      throw new Error("Group ID or User ID is missing.");
    }

    // Update chats
    await Chat.updateMany(
      {
        Group: group,
        'message.viewedBy': { $ne: user }
      },
      {
        $addToSet: { 'message.viewedBy': user }
      }
    );

    // Fetch updated chats
    const updatedChats = await Chat.find({
      Group: group,
      'message.viewedBy': user
    });

    return updatedChats; // Ensure this is an array
  } catch (error) {
    console.error("Error in viewing chats:", error);
    throw error;
  }
};

export const deleteForMe = async (req, res)=>{
  const {chat, user} = req.body;
  try {
    await Chat.updateOne(
      {_id: chat },
      { $pull: { Users: user } }
    );

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json(error);
  }
}

export const deleteForAll = async (req, res)=>{
  const {chat, user} = req.body;
  try {
    const deleteChat = await Chat.findById(chat);
    const extraUsers = deleteChat.Users;
    await Chat.deleteOne({ _id: chat });
    const io = getIo();
    extraUsers.forEach(other=>{
      if(user !== other){
        io.to(other.toString()).emit("DeleteChat", {chat});
      }
    })
    res.status(200).json({chat});
  } catch (error) {
    res.status(500).json(error);
  }
}