import User from '../models/user.js'
import Group from '../models/groups.js'
import chat from '../models/chats.js'


export const sendAll = async (req, res)=>{
  try {
    const allUsers = await User.find({})
    res.status(200).json({allUsers});
  } catch (error) {
    res.status(500).json({error: error});
  }
}

export const sendFriends = async (req, res) => {
  const {user} = req.body;
  try {
    const allFriends = await Group.find({ Users: { $in: [user._id] } });
    res.status(200).json({allFriends});
  } catch (error) {
    res.status(500).json({error: error});
  }
}