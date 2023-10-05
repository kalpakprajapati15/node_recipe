const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

const app = express();

const sequelize = require('./util/database');

const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

// Defining relations
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// adding dummy user in each http request. 
// Do call next to continue with the particular request. 
app.use((req, res, next) => {
    User.findByPk(1).then(user => {
        req.user = user;
        next();
    }).catch(err => console.log(err));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// using force in dev mode
// Create dummy user if not present. 
// create dummy cart for current user if not present.
sequelize.sync().then(res => {
    User.findByPk(1).then(user => {
        let userPromise = Promise.resolve(user);
        if (!user) {
            userPromise = User.create({ name: 'Kalpak', email: 'kalpak.prajapati@bacancy.com' })
        }
        return userPromise;
    }).then(user => {
        let cartPromise = user.getCart();
        return cartPromise.then(cart => {
            if (!cart) {
                return user.createCart();
            }
            return cart;
        })
    }).then(response => app.listen(3000));
}).catch(err => console.log(err));

