const express = require('express');

const router = express.Router({ mergeParams: true });

router.get('/', (req, res) => {
  res.render('index');
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
