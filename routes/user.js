const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { check, validationResult } = require('express-validator');
const router = express.Router({ mergeParams: true });
const passport = require('passport');
const middleware = require('../middleware');
const User = require('../models/user');
const resetEmail = require('../views/email');

router.post('/login', 
            check('username').trim().escape(),
            check('path').escape(),
            (req, res, next) => {
  const path = req.body.path.replace(/&#x2F;/g, '/');
  passport.authenticate('local', (err, user) => {
    if (err) {
      req.flash('error', 'Login issues - please try again later');
      return res.redirect(path);
    }
    if (!user) {
      req.flash('error', 'Invalid username or password');
      return res.redirect(path);
    }
    req.logIn(user, (error) => {
      if (error) {
        return next(error);
      }
      req.flash('success', `You have successfully logged in, ${user.username}`);
      return res.redirect(
        path === '/logout' || path === '/user/register'
          ? '/'
          : path,
      );
    });
  })(req, res, next);
});

router.get('/register', (req, res) => {
  req.breadcrumbs('Register');
  res.render('register');
});

router.post('/register', 
            check('username', 'Username must have between 4 and 32 characters').trim().escape().isLength({ min: 4, max: 32 }),
            check('password', 'Password must have between 4 and 32 characters and include a number').trim().escape().isLength({ min: 4, max: 32 }).bail().matches(/\d/),
            check('email', 'Invalid email').isEmail(),
            (req, res) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    let errMsg = '';
    for (let error of validationErrors.errors) {
      errMsg += `${error.msg} `;
    }
    req.flash('error', errMsg);
    return res.redirect('/user/register'); 
  }
  const newUser = new User({
    username: req.body.username,
    description: req.body.description,
    email: req.body.email,
  });
  User.find({ email: newUser.email })
    .then((results) => {
      if (results.length > 0) {
        throw new Error('Email is already in use, please select another');
      } else {
        return User.register(newUser, req.body.password);
      }
    })
    .then(() => {
      passport.authenticate('local')(req, res, () => {
        req.flash('success', 'Thank you for registering! You can now add new elements and comments.');
        return res.redirect('/');
      });
    })
    .catch((err) => {
      req.flash('error', err.message);
      res.redirect('/user/register');
    });
});

router.get('/forgot', (req, res) => {
  req.breadcrumbs('Password reset');
  res.render('forgot');
});

router.post('/forgot', 
            check('username').trim().escape(),
            check('email').isEmail(),
            async (req, res) => {
  try {
    const user = req.body.username
      ? await User.findOne({ username: req.body.username }, 'username email')
      : await User.findOne({ email: req.body.email }, 'username email');
    if (!user) {
      throw new Error('User not found. Please provide a valid username OR email address');
    } else {
      const token = await crypto.randomBytes(32).toString('hex');

      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: 'tamia.beier@ethereal.email',
          pass: '562zQtke4dCpu2TKVU',
        },
      });
      await transporter.sendMail({
        from: 'Elements app',
        to: user.email,
        subject: 'Password reset email',
        html: resetEmail(req.headers.host, token),
      });
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now();
      User.findOneAndUpdate({ username: user.username },
        {
          resetPasswordToken: user.resetPasswordToken,
          resetPasswordExpires: user.resetPasswordExpires,
        },
        (err) => {
          if (err) {
            req.flash('error', err.message);
            return res.redirect('/');
          }
          req.flash('success', 'The email with a link has been sent. It will be active for one hour');
          return res.redirect('/');
        });
    }
  } catch (err) {
    req.flash('error', err.message);
    return res.redirect('/');
  }
});

router.get('/forgot/:token', async (req, res) => {
  try {
    const user = await User.findOne({ resetPasswordToken: req.params.token });
    if (!user) {
      throw new Error('The link is invalid, please reset the password again');
    } else if (Date.now() - user.resetPasswordExpires > 3600000) {
      throw new Error('The link has expired, please reset the password again');
    } else {
      req.breadcrumbs('Password update');
      return res.render('passReset', { user });
    }
  } catch (err) {
    req.flash('error', err.message);
    return res.redirect('/');
  }
});

router.post('/forgot/passwordUpdate', 
            check('username').trim().escape(),
            check('email').isEmail(),
            (req, res) => {
  if (req.body.password != req.body.newPasswordConfirm) {
    req.flash('error', 'Passwords do not match');
    return res.redirect('/');
  }
  User.findOne({ username: req.body.username })
    .then((currentUser) => currentUser.setPassword(req.body.password))
    .then((updatedUser) => {
      updatedUser.resetPasswordExpires = null;
      updatedUser.resetPasswordToken = null;
      return updatedUser.save(updatedUser);
    })
    .then(() => {
      passport.authenticate('local', (err, user) => {
        if (err || !user) {
          throw new Error('Login error');
        } else {
          req.logIn(user, (error) => {
            if (error) {
              throw new Error('Login error');
            } else {
              req.flash('success', 'Password updated successfully');
              return res.redirect('/');
            }
          });
        }
      })(req, res);
    })
    .catch((err) => {
      req.flash('error', err.message);
      res.redirect('/');
    });
});

router.get('/details', middleware.isLoggedIn, (req, res) => {
  req.breadcrumbs('User setup');
  res.render('user', { user: req.user });
});

router.post('/details', middleware.isLoggedIn, (req, res) => {
  User.find({ email: req.body.email })
    .then((results) => {
      if (results.length === 0
         || (results.length === 1 && results[0]._id.equals(req.user._id))) {
        User.findByIdAndUpdate(req.user._id,
          {
            description: req.body.description,
            email: req.body.email,
          },
          (err) => {
            if (err) {
              throw new Error('An error occured while saving the user');
            } else {
              req.flash('success', 'User details updated successfully');
              return res.redirect('/user/details');
            }
          });
      } else throw new Error('Email already in use, please select another');
    })
    .catch((err) => {
      req.flash('error', err.message);
      res.redirect('/user/details');
    });
});

router.post('/passwordUpdate', middleware.isLoggedIn, (req, res) => {
  User.findById(req.user._id)
    .then((user) => user.changePassword(req.body.currentPassword, req.body.newPassword))
    .then(() => {
      req.flash('success', 'Update successful!');
      return res.redirect('/user/details');
    })
    .catch((err) => {
      req.flash('error', err.message);
      res.redirect('/user/details');
    });
});

module.exports = router;
