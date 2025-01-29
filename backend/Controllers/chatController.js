import Group from '../models/groups.js'
import Chat from '../models/chats.js'

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

export const newChat = async (req, res) => {
  const { text, user, group } = req.body;

  try {
    const newChat = await createNewChat({ text, user, group });
    res.status(200).json({ newChat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to load chats" });
  }
};

export const createNewChat = async ({ text, user, group }) => {
  // Validate the input
  if (!text || !user || !group) {
    throw new Error("Invalid input data");
  }

  const GroupData = await Group.findById(group)
  // Create the chat object
  const chatData = {
    message: {
      message: text,
      sentBy: user,
      viewedBy: user
    },
    Users: GroupData.Users || [], // Ensure Users is an array
    Group: group,
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