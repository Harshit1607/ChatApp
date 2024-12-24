import Group from '../models/groups.js'
import Chat from '../models/chats.js'

export const getChats = async (req,res)=>{
  const {group} = req.body;
  try {
    const chats = await Chat.find({Group: group._id}).sort({ createdAt: 1 });;
    res.status(200).json({chats});
  } catch (error) {
    console.log(error)
    res.status(500).json({error: "Unable to load chats"});
  }
}

export const newChat = async (req, res) => {
  const { text, user, group } = req.body;

  try {
    // Validate the input
    if (!text || !user?._id || !group?._id) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // Create the chat object
    const chatData = {
      message: {
        message: text,
        sentBy: user._id,
      },
      Users: group.Users || [], // Ensure Users is an array
      Group: group._id,
    };

    // Save the new chat
    const newChat = new Chat(chatData);
    await newChat.save();

    // Fetch updated chats for the group
    const chats = await Chat.find({ Group: group._id }).sort({ createdAt: 1 });

    // Respond with chats
    res.status(200).json({ chats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to load chats" });
  }
};
