const getDb = require('../util/database').getDb;
const mongoDb = require('mongodb');

class User {
    constructor(id, userName, email, cart) {
        this._id = id;
        this.userName = userName;
        this.email = email;
        this.cart = cart ? cart : { items: [] }
    }

    save() {
        const db = getDb();
        return db.collection('users').insertOne(this);
    }

    addToCart(product) {
        const cartProductIndex = this.cart.items.findIndex(oval => oval.productId.equals(product._id));
        let newQuantity = 1;
        let updatedCart = { items: [] };
        if (cartProductIndex > -1) {
            updatedCart.items = [...this.cart.items];
            updatedCart.items[cartProductIndex].quantity++;
        } else {
            updatedCart.items = [...this.cart.items, { productId: product._id, quantity: newQuantity }];
        }
        const db = getDb();
        return db.collection('users').updateOne({ _id: new mongoDb.ObjectId(this._id) }, { $set: { cart: updatedCart } });
    }

    removeFromCart(productId) {
        const db = getDb();
        const cartProductIndex = this.cart.items.findIndex(oval => oval.productId.equals(productId));
        let updatedCart = { items: [...this.cart.items] };
        if (updatedCart.items[cartProductIndex].quantity === 1) {
            updatedCart.items.splice(cartProductIndex, 1);
        } else {
            updatedCart.items[cartProductIndex].quantity--
        }
        return db.collection('users').updateOne({ _id: new mongoDb.ObjectId(this._id) }, { $set: { cart: updatedCart } })

    }

    getCart() {
        const db = getDb();
        const products = this.cart.items.map(oval => oval.productId);
        return db.collection('products').find({ _id: { $in: products } }).toArray().then(products => {
            return products.map((oval, index) => {
                oval.quantity = this.cart.items[index].quantity;
                return oval;
            })
        });
    }

    postOrder() {
        const db = getDb();
        return this.getCart().then(products => {
            const orders = { items: products, userId: this._id };
            // Add orders
            return db.collection('orders').insertOne(orders).then(orderResponse => {
                this.cart = { items: [] };
                // Empty the cart.
                return db.collection('users').updateOne({ _id: new mongoDb.ObjectId(this._id) }, { $set: { cart: this.cart } });
            }).catch(err => console.log(err))
        })

    }

    getOrders() {
        const db = getDb();
        return db.collection('orders').find({ userId: this._id }).toArray().then(orders => {
            return orders;
        }).catch(err => console.log(err));
    }

    static findById(id) {
        const db = getDb();
        return db.collection('users').findOne({ _id: new mongoDb.ObjectId(id) });
    }
}

module.exports = User;