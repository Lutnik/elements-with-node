const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  description: String,
  email: { type: String, },//unique: true },
  isAdmin: { type: Boolean, default: false },
  comments: [{
	type: mongoose.Schema.Types.ObjectId,
	ref: 'Comment',
  }],
  resetPasswordToken: String,
  resetPasswordExpires: Number,
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);