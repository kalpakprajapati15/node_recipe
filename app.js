const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

const app = express();
const mongoConnect = require('./util/database').mongoConnect;

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const User = require('./models/user');

// adding dummy user in each http request. 
// Do call next to continue with the particular request. 
app.use((req, res, next) => {
    User.findById("651faacaa05ff227377c24d0").then(user => {
        req.user = user;
        next();
    }).catch(err => console.log(err));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoConnect(() => {
    app.listen(3000)
})

