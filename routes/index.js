const express = require('express');

const router = express.Router({ mergeParams: true });
const passport = require('passport');

const User = require('../models/user');

router.get('/', (req, res) => {
  res.render('index', { breadcrumbs: req.breadcrumbs() });
});

// AUTH ROUTES

router.get('/register', (req, res) => {
  req.breadcrumbs('Register');
  res.render('register', { breadcrumbs: req.breadcrumbs() });
});

router.post('/register', (req, res) => {
  const newUser = new User({
    username: req.body.username,
    description: req.body.description,
  });
  User.register(newUser, req.body.password)
    .then(() => {
      passport.authenticate('local')(req, res, () => {
        res.redirect('/elements');
      });
    })
    .catch((err) => {
      console.log(err);
      res.render('index', { message: err, breadcrumbs: req.breadcrumbs() });
    });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err) {
      return res.render('index', {
        message: 'Login error',
        breadcrumbs: req.breadcrumbs(),
      });
    }
    if (!user) {
      return res.render('index', {
        message: 'Username / password error',
        breadcrumbs: req.breadcrumbs(),
      });
    }
    req.logIn(user, (error) => {
      if (error) {
        return next(error);
      }
      return res.redirect(req.body.path === '/logout' ? '/' : req.body.path);
    });
  })(req, res, next);
});

router.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy(() => res.render('index', {
    message: 'You have successfully logged out',
    breadcrumbs: req.breadcrumbs(),
    currentUser: req.user,
  }));
});

router.get('*', (req, res) => {
  res.render('index', {
    message: 'Ooops! Wrong path!',
    breadcrumbs: req.breadcrumbs(),
  });
});

module.exports = router;
