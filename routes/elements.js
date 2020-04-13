const express = require('express');
const cloudinary = require('cloudinary');
const multer = require('multer');

const router = express.Router({ mergeParams: true });
const { check } = require('express-validator');
const middleware = require('../middleware');
const Element = require('../models/element');
const Comment = require('../models/comment');

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

// CLOUDINARY CONFIG
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_USER,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.get('/', async (req, res) => {
  try {
    const resultsPerPage = req.query.resultsPerPage < 12 || req.query.resultsPerPage > 24
      ? 12
      : parseInt(req.query.resultsPerPage) || 12;
    const page = req.query.page || 1;
    let elements = [];
    let totalNum = 0;
    const searchVal = req.query.search;
    if (req.query.search) {
      const search = new RegExp(escapeRegex(req.query.search), 'gi');
      elements = await Element.find({ name: search },
        '_id name link',
        {
          skip: (resultsPerPage * page) - resultsPerPage,
          limit: resultsPerPage,
          sort: { _id: -1 },
        });
      totalNum = await Element.countDocuments({ name: search });
    } else {
      elements = await Element.find({ },
        '_id name link',
        {
          skip: (resultsPerPage * page) - resultsPerPage,
          limit: resultsPerPage,
          sort: { _id: -1 },
        });
      totalNum = await Element.countDocuments();
    }
    req.breadcrumbs('Elements');
    return res.render('elements', {
      elements,
      page,
      pages: Math.ceil(totalNum / resultsPerPage) || 1,
      numOfResults: totalNum,
      searchVal,
      resultsPerPage,
      tags: req.user ? req.user.tags : '',
    });
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
      cloudinary.uploader.upload(req.file.path, (result) => {
        const newElement = new Element(req.body.element);
        [newElement.link, newElement.user.id, newElement.user.username] = [result.secure_url, req.user._id, req.user.username];
        newElement.save((err) => {
          if (err) {
            req.flash('error', err.message);
            return res.render('back');
          }
          req.flash('success', 'New picture added successfully');
          return res.redirect('/elements');
        });
      });
    } catch (error) {
      req.flash('error', error.message);
      res.redirect('back');
    }
  }, (err, req, res) => {
    req.flash('error', 'Picture upload error');
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
        req.flash('error', 'Invalid pciture ID');
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
      req.flash('error', 'Invalid picture ID or no image found');
      res.redirect('/elements');
    });
});

router.post('/:id/remove', async (req, res) => {
  try {
    await Promise.all([
      Comment.deleteMany({ elementID: req.params.id }),
      Element.deleteOne({ _id: req.params.id })
      ]);
    req.flash('success', 'Element removed');
    res.redirect('/elements');
  } catch (err) {
    req.flash('error', 'Element couldn\'t be removed');
    res.redirect('back');
  }


    
    //const newelement = await Element.find({ 'user.id': req.params.id }); //deleteOne
    //console.log(newelement);
    
  // remove all comments
  // remove element from 
});

module.exports = router;
