const nodeMailer = require('nodemailer');

let transporter = nodeMailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "kalpakprajapati15@gmail.com", // generated ethereal user
    pass: "AkG95gdF8xhYOLqc", // generated ethereal password
  },
});

const crypto = require('crypto');
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

exports.getReset = (req, res, next) => {
  const isLoggedIn = req.session.isLoggedIn;
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    isLoggedIn: isLoggedIn,
    csrfToken: req.csrfToken(),
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(16, ((err, buffer) => {
    if (err) {
      return res.redirect('/reset');
    }
    let userObj;
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email }).then(user => {
      if (!user) {
        return res.redirect('/reset');
      }
      userObj = user;
      user.resetToken = token;
      user.resetExpirationDate = Date.now() + 3600000;
      return user.save();
    }).then(response => {
      transporter.sendMail({
        from: 'kalpakprajapati15@gmail.com', // sender address
        to: `${userObj.email}`, // list of receivers
        subject: "Password reset link", // Subject line
        text: `
        <p> This mail is sent to you as you requested for password reset of you shop app. </p>
        <p> Please click <a href="http://localhost:3000/token/${token}">here</a> to reset your password</p>
        `, // plain text body
      }).then(res => console.log(res)).catch(err => console.log(err));
    }).catch(err => console.log(err));
  }))
}

exports.getResetToken = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token }).then(user => {
    if (!user) {
      // invalid token;
      return res.render('auth/reset-password', {
        path: '/reset',
        pageTitle: 'Confirm New Password',
        isLoggedIn: false,
        csrfToken: req.csrfToken(),
        errorMessage: 'Invalid url,please use correct url sent to your mail'
      });
    }
    if ((Date.now() - +user.resetExpirationDate) > 0) {
      // token expire 
      return res.render('auth/reset-password', {
        path: '/reset',
        pageTitle: 'Confirm New Password',
        isLoggedIn: false,
        csrfToken: req.csrfToken(),
        email: user.email,
        errorMessage: 'Link has expired, please generate a new link'
      });
    } else {
      res.render('auth/reset-password', {
        path: '/reset',
        pageTitle: 'Confirm New Password',
        isLoggedIn: false,
        csrfToken: req.csrfToken(),
        email: user.email,
        errorMessage: null
      });
    }
  })
}

exports.postNewPassword = (req, res, next) => {
  const password = req.body.password;
  const email = req.body.email;
  bcrypt.hash(password, 12).then(hashedPassword => {
    return User.updateOne({ email: email }, { $set: { password: hashedPassword, resetToken: '', resetExpirationDate: null } }).then(response => {
      res.redirect('/login');
    })
  }).catch(err => console.log(err));

}


