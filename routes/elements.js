const express = require('express');
const router = express.Router({ mergeParams: true });
const middleware = require('../middleware');
const Element = require('../models/element');

router.get('/', (req, res) => {
  req.breadcrumbs('Elements');
  Element.find((err, elements) => {
    if(err) {
      req.flash('error', err);
      res.redirect('back');
	} else {
      res.render('elements', { elements });
    }
  });
});

router.post('/', middleware.isLoggedIn, (req, res) => {
  const temp = new Element(req.body.element);
  [temp.user.id, temp.user.username] = [req.user._id, req.user.username];
  temp.save((err) => {
    if (err) {
      req.flash('error', err)
      res.render('back');
    } else {
      req.flash('success', "New element added successfully");
      res.redirect('/elements');
	}
  });
});

router.get('/:id', (req, res) => {
  req.breadcrumbs().push(
    { name: 'Elements', url: '/elements' },
    { name: 'Details', url: `/elements/${req.params.id}` },
  );
  Element.findById(req.params.id)
	.then((element) => {
      if (!element) {
        req.flash('error', 'Invalid element ID');
        return res.redirect('/elements');
      } else {
        element.populate('comments', (err, user) => {
          if (err) {
            req.flash('error', err.message);
            res.redirect('/elements');
          } else {
            res.render('elementDetails', {
                element,
                user: req.user || '',
            });
          }
        });
	  }
    })
    .catch(err => {
      req.flash('error', 'Invalid element ID');
      res.redirect('/elements');
    });
});

module.exports = router;
