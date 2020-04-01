const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  description: String,
  email: { type: String },
  isAdmin: { type: Boolean, default: false },
  comments: [{
    id: String,
    element: String,
  }],
  resetPasswordToken: String,
  resetPasswordExpires: Number,
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
