const User = require('../models/user');
exports.getLogin = (req, res, next) => {
  const isLoggedIn = req.session.isLoggedIn;
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isLoggedIn: isLoggedIn
  });
};

exports.postLogin = (req, res, next) => {
  User.findById('6523c9df3bcd072d0d0ece19')
    .then(user => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      // to ensure redirect happens after session is saved. 
      req.session.save((err) => {
        console.log(err);
        res.redirect('/');
      });
    })
    .catch(err => console.log(err));
}


exports.postLogout = (req, res, next) => {
  // provided by session package. 
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  })
}
