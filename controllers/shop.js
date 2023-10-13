const Product = require('../models/product');
const Order = require('../models/order');
const fs = require('fs');
const path = require('path');
const pdfkit = require('pdfkit');

exports.getProducts = (req, res, next) => {
  const isLoggedIn = req.session.isLoggedIn;
// we can add pagination with skip((page no-1)* item per page);
// then we can limit item per page with limit(item per page)
  Product.find()
    .then(products => {
      console.log(products);
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        isLoggedIn,
        csrfToken: req.csrfToken() // generating a csrf token which will be used in views. 
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  const isLoggedIn = req.session.isLoggedIn;

  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
        isLoggedIn,
        csrfToken: req.csrfToken()
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  const isLoggedIn = req.session.isLoggedIn;

  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        isLoggedIn,
        csrfToken: req.csrfToken()
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  const isLoggedIn = req.session.isLoggedIn;

  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
        isLoggedIn,
        csrfToken: req.csrfToken()
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          name: req.user.name,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  const isLoggedIn = req.session.isLoggedIn;

  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
        isLoggedIn,
        csrfToken: req.csrfToken()
      });
    })
    .catch(err => console.log(err));
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  const invoiceName = 'invoice-' + orderId + '.pdf';
  const invoicePath = path.join('data', 'invoice', invoiceName);
  const doc = new pdfkit();
  Order.findOne({ _id: orderId }).then(order => {
    doc.text(`Your order number is ${orderId}`);
    order.products.forEach((element, index) => {
      doc.text(`${index}. Product title is : ${element.product.title}. Product title is ${element.product.price}. Product quantity is ${element.quantity}`)
    });
    const writeStrean = doc.pipe(fs.createWriteStream(invoicePath));
    writeStrean.on('finish', () => {
      const file = fs.createReadStream(invoicePath) // creates a file stream.
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-disposition', 'attachment; filename = "' + invoiceName + '"')
      file.pipe(res); // streams data to client, without loading it in memory. Huge advantage for large files. 
    })
    doc.end();
  });


}
