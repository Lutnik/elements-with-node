const express = require('express');

const router = express.Router({ mergeParams: true });

const Element = require('../models/element');

function isLoggedIn(req, res, next) {
  return req.isAuthenticated() ? next() : res.redirect('/login');
}

router.get('/', (req, res) => {
  req.breadcrumbs('Elements');
  Element.find((err, elements) => (err
    ? res.render('index', { message: err })
    : res.render('elements', { elements, breadcrumbs: req.breadcrumbs() })));
});

router.post('/', isLoggedIn, (req, res) => {
  const temp = new Element(req.body.element);
  [temp.user.id, temp.user.username] = [req.user._id, req.user.username];
  temp.save((err) => {
    if (err) {
      res.render('index', { message: err });
    }
  });
  res.redirect('/elements');
});

router.get('/:id', (req, res) => {
  req.breadcrumbs().push(
    { name: 'Elements', url: '/elements' },
    { name: 'Details', url: `/elements/${req.params.id}` },
  );
  const elementID = req.params.id;
  Element.findById(elementID)
    .populate('comments')
    .exec((err, element) => {
      if (err) {
        res.render('index', { message: err });
      } else {
        res.render('elementDetails', {
          element,
          breadcrumbs: req.breadcrumbs(),
          user: req.user || '',
        });
      }
    });
});

module.exports = router;
