const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.findAll().then((products) => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  }).catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByPk(prodId).then((product) => {
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products'
    });
  }).catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  // Select * from products.
  Product.findAll().then((products) => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  }).catch(err => console.log(err))
};

// THis is the magic of association provided by sequelize.
// We get cart product of current user. 
// Get cart of current user and from that cart we get products for that cart. 
exports.getCart = (req, res, next) => {
  req.user.getCart().then(cart => {
    cart.getProducts().then(products => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
  }).catch(err => console.log(err));
  // Cart.getCart(cart => {
  //   Product.fetchAll(products => {
  //     const cartProducts = [];
  //     for (product of products) {
  //       const cartProductData = cart.products.find(
  //         prod => prod.id === product.id
  //       );
  //       if (cartProductData) {
  //         cartProducts.push({ productData: product, qty: cartProductData.qty });
  //       }
  //     }
  //     res.render('shop/cart', {
  //       path: '/cart',
  //       pageTitle: 'Your Cart',
  //       products: cartProducts
  //     });
  //   });
  // });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.getCart().then(cart => {
    const fetchedCart = cart;
    let newQuantity = 1;
    cart.getProducts({ where: { id: prodId } }).then(products => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }
      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }
      return Product.findByPk(prodId)
    }).then(product => {
      return fetchedCart.addProduct(product, { through: { quantity: newQuantity } })
    })
      .then(() => {
        res.redirect('/cart');
      })
  }).catch(err => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.getCart().then(cart => {
    const fetchedCart = cart;
    cart.getProducts({ where: { id: prodId } }).then(products => {
      const product = products[0];
      const oldQuantity = product.cartItem.quantity;
      if (oldQuantity === 1) {
        return fetchedCart.removeProduct(product);
      } else {
        return fetchedCart.addProduct(product, { through: { quantity: oldQuantity - 1 } });
      }
    }).then(() => {
      res.redirect('/cart');
    })
  }).catch(err => console.log(err))
};

exports.createOrder = (req, res, next) => {
  let fetchedCart;
  req.user.getCart().then(cart => {
    fetchedCart = cart;
    cart.getProducts().then(products => {
      req.user.createOrder().then(order => {
        order.addProducts(products.map((product) => {
          product.orderItem = { quantity: product.cartItem.quantity };
          return product;
        })).then(() => {
          fetchedCart.setProducts(null).then(() => {
            res.redirect('/orders');
          })
        })
      })
    })
  })
}

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
