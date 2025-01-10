import Group from '../models/groups.js'
import Chat from '../models/chats.js'
import User from'../models/user.js'

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

export const changeGroupPhoto = async (req, res) => {
  const { image, group } = req.body;

  try {
    if (!image || !group) {
      return res.status(400).json({ error: 'Image and id are required' });
    }

    // Assuming the image is already a base64 string from the frontend
    const groupChat = await Group.findOneAndUpdate(
      { _id: group },
      { $set: { profile: image } },
      { new: true }
    );

    if (!groupChat) {
      return res.status(404).json({ message: "Group doesn't exist" });
    }

    res.status(200).json({ groupChat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update photo' });
  }
};
