const express = require('express');
const middleware = require('../middleware');
const router = express.Router({ mergeParams: true });
const { check, validationResult } = require('express-validator');
const Comment = require('../models/comments');
const Element = require('../models/element');
const User = require('../models/user');


router.post('/comment', 
            middleware.isLoggedIn, 
            check('comment[text]').trim().escape(),
            check('comment[author]').trim().escape(),
            async (req, res) => {
console.log(req.body.comment);
  try {
    const newComment = new Comment(req.body.comment);
    const [addedComment, retrievedElement, retrievedUser] = await Promise.all([
      newComment.save(),
      Element.findById(req.params.id),
      User.findById(req.user._id),
    ]);
    retrievedElement.comments.push(addedComment);
    retrievedUser.comments.push(addedComment);
    await Promise.all([
      retrievedElement.save(),
      retrievedUser.save(),
    ]);
    req.flash('success', 'Comment added');
    return res.redirect(`/elements/${req.params.id}`);
  } catch (err) {
    req.flash('error', err.message);
    return res.redirect('back');
  }
});

router.post('/comment/:commentId/remove', middleware.isLoggedIn, async (req, res) => {
  try {
    const commentID = req.params.commentId;
    const [retrievedUser, retrievedElement, retrievedComment] = await Promise.all([
      User.findById(req.user._id),
      Element.findById(req.params.id),
      Comment.findByIdAndRemove(commentID),
    ]);
    if (retrievedUser.username === retrievedComment.author) {
      retrievedUser.comments = retrievedUser.comments.filter((com) => com._id !== commentID);
      retrievedElement.comments = retrievedElement.comments.filter((com) => com._id !== commentID);
      await Promise.all([
        retrievedUser.save(),
        retrievedElement.save(),
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
