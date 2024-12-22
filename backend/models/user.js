import mongoose from 'mongoose'



const userSchema = new mongoose.Schema({
  name: {type : String, required: true},
  phone: {type : Number, required: true},
  email: {type : String, required: true},
  password: {type: String, required: true},
  Groups: {type: [mongoose.Schema.Types.ObjectId], ref: 'Group', default: []}
}, { timestamps: true })

export default  mongoose.model('User', userSchema);