const express = require('express');

const router = express.Router({ mergeParams: true });

const User = require('../models/user');

function isLoggedIn(req, res, next) {
  return req.isAuthenticated() ? next() : res.redirect('/login');
}

router.get('/user/details', isLoggedIn, (req, res) => {
  req.breadcrumbs('User setup');
  res.render('user', { user: req.user, breadcrumbs: req.breadcrumbs() });
});

router.post('/user', isLoggedIn, (req, res) => {
  User.updateOne({ _id: req.user._id }, { description: req.body.description })
    .then(() => {
      req.user.description = req.body.description;
      res.render('user', {
        user: req.user,
        message: 'Update successful!',
        breadcrumbs: req.breadcrumbs(),
      });
    })
    .catch((err) => res.render('user', {
      user: req.user,
      message: err.message,
      breadcrumbs: req.breadcrumbs(),
    }));
});

router.post('/user/passwordUpdate', isLoggedIn, (req, res) => {
  User.findById(req.user._id)
    .then((currentUser) => currentUser.changePassword(req.body.currentPassword, req.body.newPassword))
    .then(() => res.render('user', {
      user: req.user,
      message: 'Update successful!',
      breadcrumbs: req.breadcrumbs(),
    }))
    .catch((err) => res.render('user', {
      user: req.user,
      message: err.message,
      breadcrumbs: req.breadcrumbs(),
    }));
});

module.exports = router;
