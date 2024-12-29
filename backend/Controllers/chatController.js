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
  if (!text || !user?._id || !group?._id) {
    throw new Error("Invalid input data");
  }

  // Create the chat object
  const chatData = {
    message: {
      message: text,
      sentBy: user._id,
      viewedBy: user._id
    },
    Users: group.Users || [], // Ensure Users is an array
    Group: group._id,
  };

  // Save the new chat
  const newChat = new Chat(chatData);
  await newChat.save();

  return newChat;
};


export const getLatestChat = async ({ group }) => {
  try {
    const message = await Chat.findOne({ Group: group._id })
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
    // Ensure group and user IDs are provided
    if (!group?._id || !user?._id) {
      throw new Error("Group ID or User ID is missing.");
    }

    // Attempt to update the chats
    const viewedChats = await Chat.updateMany(
      { 
        Group: group._id,           // Match the group
        'message.viewedBy': { $ne: user._id }   // Ensure user ID is not already in `viewedBy`
      },
      { 
        $addToSet: { 'message.$[].viewedBy': user._id }  // Add user ID to `viewedBy`
      }
    );

    // Return null if no chats are found (matchedCount is 0)
    if (viewedChats.matchedCount === 0) {
      return null;
    }

    // Return the result of the update operation
    return viewedChats;
  } catch (error) {
    console.error("Error in viewing chats:", error);
    throw error;
  }
};
