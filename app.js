const path = require('path');

const password = require('./util/password');
const MONGODB_URI = "mongodb+srv://kalpakprajapati:" + `${encodeURIComponent(password.password)}` + "@cluster0.pzrjjcl.mongodb.net/shop";
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const csrf = require('csurf');
const app = express();
const flash = require('connect-flash');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const mongoDbSessionStore = require('connect-mongodb-session')(session);
// Configuring mongodb session store . 
const store = new mongoDbSessionStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});
const csrfProtection = csrf();

const errorController = require('./controllers/error');
const User = require('./models/user');


app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => { // will be called on each file upload, and tell where to store
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + "-" + file.originalname); // file name to be stored. 
  }
})
// using multer middleware to extract file data.  
// dest tells multer to convert buffer data back to file and store at the specified path.
app.use(multer({
  storage: fileStorage, fileFilter: (req, file, cb) => {
    const allowsMime = ['image/png', 'image/jpg', 'image/jpeg']
    if (allowsMime.includes(file.mimetype)) {
      cb(null, true)// accept file
    } else {
      cb(null, false)// reject file
    }
  }
}).single('imageUrl'));
app.use(express.static(path.join(__dirname, 'public')));
// tell express to static load images. 
app.use('/images', express.static(path.join(__dirname, 'images')));

// Initialize session middleware. Secret key is used as a hash key. 
app.use(session({
  secret: 'Kapfaf',
  saveUninitialized: false,
  resave: false,
  store: store // to save session in mongodb
}));

// adding csrf protection;
app.use(csrfProtection);
app.use(flash());

// need to do this as session stores key value object, not actual mongodb user object. 
app.use(function (req, res, next) {
  if (req.session && req.session.user) {
    User.findById(req.session.user._id).then(user => {
      req.user = user;
      next();
    })
  } else {
    next();
  }
});

// as we need isloggedin and scrf token in every views, we are setting it here in a middle ware so it will be available in all views. 
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn;
  res.csrfToken = req.csrfToken();
  next();
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    MONGODB_URI
  )
  .then(result => {
    // User.findOne().then(user => {
    //   if (!user) {
    //     const user = new User({
    //       name: 'kalpak',
    //       email: 'kalpak.prajapati@',
    //       cart: {
    //         items: []
    //       }
    //     });
    //     user.save();
    //   }
    // });
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
