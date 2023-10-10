const bcrypt = require('bcryptjs');
const User = require('../models/user');
exports.getLogin = (req, res, next) => {
  const isLoggedIn = req.session.isLoggedIn;
  let message = req.flash('error');
  if (message && message.length) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isLoggedIn: isLoggedIn,
    csrfToken: req.csrfToken(),
    errorMessage: message
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email }).then(user => {
    if (!user) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }
    bcrypt.compare(password, user.password).then(doMatch => {
      if (doMatch) {
        req.session.isLoggedIn = true;
        req.session.user = user;
        return req.session.save((err) => {
          console.log(err);
          res.redirect('/');
        });
      }
      return res.redirect('/login');
    }).catch(err => {
      console.log(err);
      res.redirect('/login')
    });
  });
}


exports.postLogout = (req, res, next) => {
  // provided by session package. 
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
}

exports.getSignUp = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'SignUp',
    isLoggedIn: false,
    csrfToken: req.csrfToken()
  });
}

exports.postSignUp = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ email: email }).then(userObj => {
    if (userObj) {
      return res.redirect('/signup');
    }
    return bcrypt.hash(password, 12).then(hashedPassword => {
      const createUser = new User({
        email,
        password: hashedPassword,
        cart: { items: [] }
      });
      return createUser.save();

    }).then(response => {
      res.redirect('/login');
    })
  }).catch(err => console.log(err));
}
