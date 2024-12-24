import Group from '../models/groups.js'
import Chat from '../models/chats.js'
import User from'../models/user.js'

export const openGroup = async(req,res)=>{
  
  const {user, other, group} = req.body;
  try {
    
    if(group){
      const groupChat = await Group.findById(group._id);
      return res.status(200).json({groupChat});
    }
    const userArray = [];
    const userIds = [];
    let userelem = await User.findById(user._id);
    userArray.push(userelem);
    userIds.push(user._id);
    userIds.push(other._id);
    userelem = await User.findById(other._id);
    userArray.push(userelem);
    const groupChat = new Group({UserDetails: userArray, Users: userIds});
    groupChat.save();
    res.status(200).json({groupChat});
  } catch (error) {
    console.log(error)
    res.status(500).json({error: "Unable to open group"});
  } 
}