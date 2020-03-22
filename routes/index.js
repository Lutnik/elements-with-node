const express = require('express');

const router = express.Router({ mergeParams: true });
const passport = require('passport');

const User = require('../models/user');

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/register', (req, res) => {
  req.breadcrumbs('Register');
  res.render('register');
});

router.post('/register', (req, res) => {
  const newUser = new User({
    username: req.body.username,
    description: req.body.description,
  });
  User.register(newUser, req.body.password)
    .then(() => {
      passport.authenticate('local')(req, res, () => {
        req.flash('success', 'Thank you for registering! You can now add new elements and comments.');
        res.redirect(req.body.path);
      });
    })
    .catch((err) => {
      req.flash('error', err);
      res.redirect('/');
    });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err) {
      req.flash('error', 'Login issues - please try again later');
      return res.redirect(req.body.path);
    }
    if (!user) {
      req.flash('error', 'Invalid username or password');
      return res.redirect(req.body.path);
    }
    req.logIn(user, (error) => {
      if (error) {
        return next(error);
      }
      req.flash('success', `You have successfully logged in, ${user.username}`);
      return res.redirect(req.body.path === '/logout' ? '/' : req.body.path);
    });
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'You have successfully logged out');
  res.redirect('/');
});

router.get('*', (req, res) => {
  req.flash('error', 'Ooops! Wrong path!');
  res.redirect('/');
});

module.exports = router;
