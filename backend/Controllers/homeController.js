import User from '../models/user.js'
import Group from '../models/groups.js'
import Chat from '../models/chats.js'

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

  try {
    let profile;
    // Check User collection
    const user = await User.findById(id);
    if (user && user.profile) {
      console.log(profile)
      profile = user.profile;
    }

    // Check Group collection if no user profile found
    if (!profile) {
      const group = await Group.findById(id);
      if (group && group.profile) {
        profile = group.profile;
      }
    }

    

    // Respond with the profile or a 404 if not found
    if (profile) {
      return res.status(200).json(profile);
    } else {
      return res.status(404).json({ error: "Profile not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get profile" });
  }
};

export const getUser = async (req, res)=>{
  const {id} =req.body;
  try {
    const newUser = await User.findById(id)
    res.status(200).json({newUser});
  } catch (error) {
    res.status(500).json({ error: 'Failed to Update' });
  }
}