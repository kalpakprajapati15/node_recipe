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
const password = require('./util/password');

const mongoose = require('mongoose');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const User = require('./models/user');

// adding dummy user in each http request. 
// Do call next to continue with the particular request. 
app.use((req, res, next) => {
    User.findById("6523c9df3bcd072d0d0ece19").then(user => {
        req.user = user;
        next();
    }).catch(err => console.log(err));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect("mongodb+srv://kalpakprajapati:" + `${encodeURIComponent(password.password)}` + "@cluster0.pzrjjcl.mongodb.net/shop?retryWrites=true&w=majority").then(response => {
    User.findById('6523c9df3bcd072d0d0ece19').then(response => {
        if (response) {
            return Promise.resolve(true);
        }
        const user = new User({
            name: 'Kalpak',
            email: 'kalpak.prajapati@gmail.com',
            cart: {
                items: []
            }
        });
        return user.save();
    }).then(response => {
        app.listen(3000);
    });
}).catch(err => console.log(err));

