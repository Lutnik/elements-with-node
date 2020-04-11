const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  description: String,
  email: String,
  isAdmin: { type: Boolean, default: false },
  tags: [String],
  language: String,
  favourites: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Element',
  }],
  comments: [{
    id: String,
    element: String,
  }],
  resetPasswordToken: String,
  resetPasswordExpires: Number,
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
