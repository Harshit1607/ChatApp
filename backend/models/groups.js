import mongoose from 'mongoose'

const groupSchema = new mongoose.Schema({
  name: {type : String, required: true},
  Users: {type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: []},
}, { timestamps: true })

export default  mongoose.model('Group', groupSchema);