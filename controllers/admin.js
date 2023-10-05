const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  // We have added sequelize user object to every reqest. 
  // createproduct is dynamic method created by sequelize because of association. It will create product with userid as foriegn key automatically. 
  req.user.createProduct({
    title,
    imageUrl,
    price,
    description
  }).then(response => {
    res.redirect('/')
  }).catch(err => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  // fetches products of this user where id is prodid. 
  // req.user is sequelize user object. 
  req.user.getProducts({ where: { id: prodId } }).then((rows) => {
    const product = rows[0];
    if (!product) {
      return res.redirect('/');
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product
    });
  }).catch(err => console.log(err))
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  Product.update({ title: updatedTitle, price: updatedPrice, imageUrl: updatedImageUrl, description: updatedDesc }, { where: { id: prodId } }).then(response => {
    res.redirect('/admin/products');
  }).catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
  req.user.getProducts().then((rows) => {
    res.render('admin/products', {
      prods: rows,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  }).catch(err => console.log(err))
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.destroy({ where: { id: prodId } }).then(response => res.redirect('/admin/products')).catch(err => console.log(err));
};
