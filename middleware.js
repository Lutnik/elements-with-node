
const middlewareObj = {
  isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      req.flash('error', 'You must be logged in to proceed');
      res.redirect('back');
    }
  },
};

module.exports = middlewareObj;
