const express = require('express');
const middleware = require('../middleware');
const router = express.Router({ mergeParams: true });

const Comment = require('../models/comments');
const Element = require('../models/element');
const User = require('../models/user');



router.post('/comment', middleware.isLoggedIn, (req, res) => {
  async function handleNewComment(elementID, newComment) {
    try {
      const [addedComment, retrievedElement, retrievedUser] = await Promise.all([
        newComment.save(),
        Element.findById(elementID),
        User.findById(req.user._id),
      ]);
      retrievedElement.comments.push(addedComment);
      retrievedUser.comments.push(addedComment);
      const [ret1, ret2] = await Promise.all([
        retrievedElement.save(),
        retrievedUser.save(),
      ]);
      return 'Success';
    } catch (err) {
      return err;
    }
  }

  handleNewComment(req.params.id, new Comment(req.body.comment))
    .then((result) => {
      if (result === 'Success') {
        req.flash('success', 'Comment added');
        res.redirect(`/elements/${req.params.id}`);
	  } else {
        req.flash('error', result);
        res.redirect('back');
	  }
    });
});

router.post('/comment/:commentId/remove', middleware.isLoggedIn, (req, res) => {
  async function handleCommentRemoval(elementID, commentID, userID) {
    try {
      const [retrievedUser, retrievedElement, retrievedComment] = await Promise.all([
        User.findById(userID),
        Element.findById(elementID),
        Comment.findByIdAndRemove(commentID),
      ]);

      if (retrievedUser.username === retrievedComment.author) {
        retrievedUser.comments = retrievedUser.comments.filter((com) => com._id !== commentID);
        retrievedElement.comments = retrievedElement.comments.filter((com) => com._id !== commentID);
        const [ret1, ret2] = await Promise.all([
          retrievedUser.save(),
          retrievedElement.save(),
        ]);
        return 'Success';
      }
      return 'Authorisation error';
    } catch (err) {
      return err;
    }
  }

  handleCommentRemoval(req.params.id, req.params.commentId, req.user._id)
    .then((result) => {
      if (result === 'Success') {
        req.flash('success', 'Comment has been removed');
        res.redirect(`/elements/${req.params.id}`);
	  } else {
        req.flash('error', result);
        res.render('index', { message: result, breadcrumbs: req.breadcrumbs() });
	  } 
    });
});

module.exports = router;
