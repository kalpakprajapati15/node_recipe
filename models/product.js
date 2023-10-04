
const Cart = require('./cart');

const db = require('../util/database');


module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    // getProductsFromFile(products => {
    //   if (this.id) {
    //     const existingProductIndex = products.findIndex(
    //       prod => prod.id === this.id
    //     );
    //     const updatedProducts = [...products];
    //     updatedProducts[existingProductIndex] = this;
    //     fs.writeFile(p, JSON.stringify(updatedProducts), err => {
    //       console.log(err);
    //     });
    //   } else {
    //     this.id = Math.random().toString();
    //     products.push(this);
    //     fs.writeFile(p, JSON.stringify(products), err => {
    //       console.log(err);
    //     });
    //   }
    // });
    if (!this.id) {

      return db.execute("Insert into products (title, price, description, imageUrl) Values (?,?,?,?)", [this.title, this.price, this.description, this.imageUrl]);
    } else {
      return db.execute("UPDATE products SET title = ?, price = ?, description = ?, imageUrl = ? where id = ?", [this.title, this.price, this.description, this.imageUrl, this.id])
    }
  }

  static deleteById(id) {

    db.execute("DELETE FROM products WHERE (id = ?)", [id])
    // getProductsFromFile(products => {
    //   const product = products.find(prod => prod.id === id);
    //   const updatedProducts = products.filter(prod => prod.id !== id);
    //   fs.writeFile(p, JSON.stringify(updatedProducts), err => {
    //     if (!err) {
    //       Cart.deleteProduct(id, product.price);
    //     }
    //   });
    // });
  }

  static fetchAll() {
    return db.execute('SELECT * FROM products');
  }

  static findById(id) {
    return db.execute('select * from products where (id = ?)', [id]);
  }
};
