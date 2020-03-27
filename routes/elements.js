const express = require('express');

const router = express.Router({ mergeParams: true });
const { check, validationResult } = require('express-validator');
const middleware = require('../middleware');
const Element = require('../models/element');

const escapeRegex = (string) => string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

router.get('/', async (req, res) => {
  try {
    let elements;
    if (req.query.search) {
      const search = new RegExp(escapeRegex(req.query.search), 'gi');
      elements = await Element.find({ name: search });
    } else {
      elements = await Element.find();
    }
    req.breadcrumbs('Elements');
    return res.render('elements', { elements });
  } catch (err) {
    req.flash('error', err.message);
    return res.redirect('back');
  }
});

router.post('/',
  middleware.isLoggedIn,
  check('element[name]').trim().escape(),
  check('element[link]', 'Invalid link').trim().matches(/^(https?:\/\/|^www).+(jpeg|jpg|png|gif)$/i),
  check('element[description]').trim().escape(),
  (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      const errMsg = validationErrors.errors.reduce((prev, curr) => 
                                                  prev.msg + curr.msg, 
                                                  { msg: 'Please correct the following errors ' }
                                                 );
      req.flash('error', errMsg);
      return res.redirect('/elements');
    }
    const newElement = new Element(req.body.element);
    [newElement.user.id, newElement.user.username] = [req.user._id, req.user.username];
    newElement.save((err) => {
      if (err) {
        req.flash('error', err);
        return res.render('back');
      }
      req.flash('success', 'New element added successfully');
      return res.redirect('/elements');
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
      }
      element.populate('comments', (err) => {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('/elements');
        }
        return res.render('elementDetails', {
          element,
          user: req.user || '',
        });
      });
    })
    .catch((err) => {
      req.flash('error', `Invalid element ID: ${err.message}`);
      res.redirect('/elements');
    });
});

module.exports = router;
