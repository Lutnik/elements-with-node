const express = require('express');
const cloudinary = require('cloudinary');
const multer = require('multer');

const router = express.Router({ mergeParams: true });
const { check, validationResult } = require('express-validator');
const middleware = require('../middleware');
const Element = require('../models/element');

const escapeRegex = (string) => string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

const upload = multer({
  storage: multer.diskStorage({
    filename(req, file, cb) {
      cb(null, Date.now() + file.originalname);
    },
  }),
  fileFilter: (req, file, cb) => (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)
    ? cb(new Error('Only image files are allowed (jpg, gif or png)'), false)
    : cb(null, true)),
});

//CLOUDINARY CONFIG
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_USER, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: 'rCY0g3OswtzC-BrOI7n-BwZOsZ8',
});

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
  upload.single('image'),
  check('element[description]').trim().escape(),
  (req, res) => {
    try {
      cloudinary.uploader.upload(req.file.path, function(result) {
        const newElement = new Element(req.body.element);
        [newElement.link, newElement.user.id, newElement.user.username] = [result.secure_url, req.user._id, req.user.username];
        newElement.save((err) => {
          if (err) {
            req.flash('error', err.message);
            return res.render('back');
          }
          req.flash('success', 'New element added successfully');
          return res.redirect('/elements');
        });
      });
    } catch (error) {
      req.flash('error', errpr.message);
      res.redirect('back');
    }  
}, function errorHandler(err, req, res, next){
  req.flash('error', err.message);
  res.redirect('back');
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
