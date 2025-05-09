import mongoose from 'mongoose'

const groupSchema = new mongoose.Schema({
  isGroup: {type: Boolean, default: false},
  name: {type : String, default: ""},
  Users: {type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: []},
  Admin: {type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  UserDetails:{type: Object, default:[]},
  profile: {type: String},
  description: {type: String, maxlength: 200},
  mediaExpiresAt: { type: Date },
}, { timestamps: true })

export default  mongoose.model('Group', groupSchema);