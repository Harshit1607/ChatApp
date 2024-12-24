import Group from '../models/groups.js'
import chat from '../models/chats.js'

export const openGroup = async(req,res)=>{
  
  const {user, other, group} = req.body;
  try {
    
    if(group){
      const groupChat = await Group.findById(group._id);
      return res.status(200).json({groupChat});
    }
    const userArray = [];
    userArray.push(user._id); userArray.push(other._id)
    const groupChat = new Group({name: other.name, Users: userArray});
    groupChat.save();
    res.status(200).json({groupChat});
  } catch (error) {
    console.log(error)
    res.status(500).json({error: "Unable to open group"});
  } 
}