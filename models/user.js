const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  description: String,
  comments: [{
	type: mongoose.Schema.Types.ObjectId,
	ref: 'Comment',
  }],
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);