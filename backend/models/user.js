import mongoose from 'mongoose'



const userSchema = new mongoose.Schema({
  name: {type : String, required: true},
  phone: {type : Number, required: true},
  email: {type : String, required: true},
  password: {type: String, required: true},
  about: {type: String, default: "I Love Spiderman"},
  profile: {type: String,},
  Groups: {type: [mongoose.Schema.Types.ObjectId], ref: 'Group', default: []}
}, { timestamps: true })

export default  mongoose.model('User', userSchema);