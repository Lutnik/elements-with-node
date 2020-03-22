const express = require('express');
const router = express.Router({ mergeParams: true });
const middleware = require('../middleware');
const User = require('../models/user');

router.get('/user/details', middleware.isLoggedIn, (req, res) => {
  req.breadcrumbs('User setup');
  res.render('user', { user: req.user });
});

router.post('/user', middleware.isLoggedIn, (req, res) => {
  User.updateOne({ _id: req.user._id }, { description: req.body.description })
    .then(() => {
      req.user.description = req.body.description;
      req.flash('success', 'User details updated successfully');
      return res.render('user', { user: req.user });
    })
    .catch((err) => {
      req.flash('error', err.message);
	  res.render('user', { user: req.user });
    });
});

router.post('/user/passwordUpdate', middleware.isLoggedIn, (req, res) => {
  User.findById(req.user._id)
    .then((currentUser) => currentUser.changePassword(req.body.currentPassword, req.body.newPassword))
    .then(() => {
      console.log(`Zmieniamy hasło na ${req.body.newPassword}`);
      req.flash('success', 'Update successful!');
      return res.redirect('/user/details');
    })
    .catch((err) => {
      console.log(`Nie zmieniamy hasła bo ${err.message}`);
      req.flash('error', err.message);
      res.redirect('/user/details');
    });
});

module.exports = router;
