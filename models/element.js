const mongoose = require("mongoose");

const elementSchema = new mongoose.Schema({
  name: String,
  link: String,
  description: String,
  user: {
	  id: {
		  type: mongoose.Schema.Types.ObjectId,
		  ref: 'User',
  	  },
	  username: String,
  },
  comments: [{
	type: mongoose.Schema.Types.ObjectId,
	ref: 'Comment',
  }],
});

module.exports = mongoose.model('Element', elementSchema);