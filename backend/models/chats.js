import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  message: {type: String, required: true},
  sentBy: {type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: []},
  viewedBy: {type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: []},
})

const chatSchema = new mongoose.Schema({
  message: {messageSchema},
  Users: {type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: []},
  Groups: {type: [mongoose.Schema.Types.ObjectId], ref: 'Group'}
}, { timestamps: true })

export default  mongoose.model('Chat', chatSchema);