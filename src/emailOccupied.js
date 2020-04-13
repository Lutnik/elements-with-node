const User = require('../models/user');

module.exports = function emailOccupied (email, userId) {
  return User.find({ email: email, _id: { $ne: userId } })
    .then((result) => result.length > 0 ? true : false)
    .catch((err) => false);
}
