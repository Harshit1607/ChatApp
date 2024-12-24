import User from '../models/user.js'

export const sendAll = async (req, res)=>{
  try {
    const allUsers = await User.find({})
    res.status(200).json({allUsers});
  } catch (error) {
    res.status(500).json({error: error});
  }
}