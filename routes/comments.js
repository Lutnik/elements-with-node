const express = require('express');
const { check } = require('express-validator');
const middleware = require('../middleware');
const Comment = require('../models/comment');
const Element = require('../models/element');
const User = require('../models/user');

const router = express.Router({ mergeParams: true });

// Add new comment
router.post('/comment',
  middleware.isLoggedIn,
  check('comment[text]').trim().escape(),
  check('comment[author]').trim().escape(),
  async (req, res) => {
    try {
      const newComment = new Comment(req.body.comment);
      newComment.elementID = req.params.id;
      const [addedComment, retElement, retUser] = await Promise.all([
        newComment.save(),
        Element.findById(req.params.id),
        User.findById(req.user._id),
      ]);
      retElement.comments.push(addedComment);
      retUser.comments.push({ id: addedComment._id, element: retElement._id });
      await Promise.all([
        retUser.save(),
        retElement.save(),
      ]);
      req.flash('success', 'Comment added');
      return res.redirect(`/elements/${req.params.id}`);
    } catch (err) {
      req.flash('error', err.message);
      return res.redirect('back');
    }
  });

// Remove specific comment
router.post('/comment/:commentId/remove', middleware.isLoggedIn, async (req, res) => {
  try {
    const commentID = req.params.commentId;
    const [retUser, retElement, retComment] = await Promise.all([
      User.findById(req.user._id),
      Element.findById(req.params.id),
      Comment.findByIdAndRemove(commentID),
    ]);
    if (retUser.username === retComment.author) {
      retUser.comments = retUser.comments.filter((com) => !(com.id === commentID));
      retElement.comments = retElement.comments.filter((com) => !(com._id.toString() === commentID));
      await Promise.all([
        retUser.save(),
        retElement.save(),
      ]);
      req.flash('success', 'Comment has been removed');
      return res.redirect(`/elements/${req.params.id}`);
    }
    throw new Error('Authorisation error');
  } catch (err) {
    req.flash('error', err.message);
    return res.redirect('back');
  }
});

module.exports = router;
