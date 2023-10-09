const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Product = require('./product');

const Order = require('./order');

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    cart: {
        items: [{ productId: { type: mongoose.Types.ObjectId, ref: 'Product' }, quantity: Number }]
    }
});

// dont use arrow function so that this refers to instance of user. 
UserSchema.methods.addToCart = function (product) {
    const cartProductIndex = this.cart.items.findIndex(oval => oval.productId.equals(product._id));
    let newQuantity = 1;
    let updatedCart = { items: [] };
    if (cartProductIndex > -1) {
        updatedCart.items = [...this.cart.items];
        updatedCart.items[cartProductIndex].quantity++;
    } else {
        updatedCart.items = [...this.cart.items, { productId: product._id, quantity: newQuantity }];
    }
    this.cart = updatedCart;
    return this.save();
}

UserSchema.methods.getCart = function () {
    const products = this.cart.items.map(oval => oval.productId);
    return Product.find({ _id: { $in: products } }).then(products => {
        return products.map((oval, index) => {
            oval.quantity = this.cart.items[index].quantity;
            return oval;
        })
    })
}

UserSchema.methods.removeFromCart = function (productId) {
    const cartProductIndex = this.cart.items.findIndex(oval => oval.productId.toString() === productId);
    let updatedCart = { items: [...this.cart.items] };
    if (updatedCart.items[cartProductIndex].quantity === 1) {
        updatedCart.items.splice(cartProductIndex, 1);
    } else {
        updatedCart.items[cartProductIndex].quantity--
    }
    this.cart = updatedCart;
    return this.save();

}

UserSchema.methods.postOrder = function () {
    const order = { items: [], userId: this._id };
    return this.getCart().then(cartProducts => {
        cartProducts.forEach(element => {
            order.items.push({ productId: element._id, quantity: element.quantity });
        });
        const orderObj = new Order(order);
        return orderObj.save().then(saveRes => {
            this.cart = { items: [] };
            return this.save();
        });
    })
}

UserSchema.methods.getOrders = function () {
    return Order.find({ userId: this._id }).populate('items.productId');
}

const User = mongoose.model('User', UserSchema);


module.exports = User;

// class User {
//     constructor(id, userName, email, cart) {
//         this._id = id;
//         this.userName = userName;
//         this.email = email;
//         this.cart = cart ? cart : { items: [] }
//     }

//     save() {
//         const db = getDb();
//         return db.collection('users').insertOne(this);
//     }

//     addToCart(product) {
//         const cartProductIndex = this.cart.items.findIndex(oval => oval.productId.equals(product._id));
//         let newQuantity = 1;
//         let updatedCart = { items: [] };
//         if (cartProductIndex > -1) {
//             updatedCart.items = [...this.cart.items];
//             updatedCart.items[cartProductIndex].quantity++;
//         } else {
//             updatedCart.items = [...this.cart.items, { productId: product._id, quantity: newQuantity }];
//         }
//         const db = getDb();
//         return db.collection('users').updateOne({ _id: new mongoDb.ObjectId(this._id) }, { $set: { cart: updatedCart } });
//     }

//     removeFromCart(productId) {
//         const db = getDb();
//         const cartProductIndex = this.cart.items.findIndex(oval => oval.productId.equals(productId));
//         let updatedCart = { items: [...this.cart.items] };
//         if (updatedCart.items[cartProductIndex].quantity === 1) {
//             updatedCart.items.splice(cartProductIndex, 1);
//         } else {
//             updatedCart.items[cartProductIndex].quantity--
//         }
//         return db.collection('users').updateOne({ _id: new mongoDb.ObjectId(this._id) }, { $set: { cart: updatedCart } })

//     }

//     getCart() {
//         const db = getDb();
//         const products = this.cart.items.map(oval => oval.productId);
//         return db.collection('products').find({ _id: { $in: products } }).toArray().then(products => {
//             return products.map((oval, index) => {
//                 oval.quantity = this.cart.items[index].quantity;
//                 return oval;
//             })
//         });
//     }

//     postOrder() {
//         const db = getDb();
//         return this.getCart().then(products => {
//             const orders = { items: products, userId: this._id };
//             // Add orders
//             return db.collection('orders').insertOne(orders).then(orderResponse => {
//                 this.cart = { items: [] };
//                 // Empty the cart.
//                 return db.collection('users').updateOne({ _id: new mongoDb.ObjectId(this._id) }, { $set: { cart: this.cart } });
//             }).catch(err => console.log(err))
//         })

//     }

//     getOrders() {
//         const db = getDb();
//         return db.collection('orders').find({ userId: this._id }).toArray().then(orders => {
//             return orders;
//         }).catch(err => console.log(err));
//     }

//     static findById(id) {
//         const db = getDb();
//         return db.collection('users').findOne({ _id: new mongoDb.ObjectId(id) });
//     }
// }
