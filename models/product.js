const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// ref is used to refer to another model (table)
const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: String,
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Product', productSchema);

// const getDb = require('../util/database').getDb;
// const mongoDb = require('mongodb');
// class Product {
//   constructor(title, price, description, imageUrl, id, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id;
//     this.userId = userId;
//   }

//   save() {
//     const db = getDb();
//     if (this._id) {
//       return db.collection('products').updateOne({ _id: new mongoDb.ObjectId(this._id) }, { $set: this })
//     } else {
//       return db.collection('products').insertOne(this).then(res => {
//         console.log(res);
//       }).catch(err => console.log(err))
//     }
//   }

//   static fetchAll() {
//     const db = getDb();
//     return db.collection('products').find().toArray().then(res => {
//       return res;
//     }).catch(err => console.log(err))
//   }

//   // mongodb stores id in objectid format, so pass id in query as same format. 
//   static getById(id) {
//     const db = getDb();
//     return db.collection('products').findOne({ _id: new mongoDb.ObjectId(id) }).then(response => response).catch(err => console.log(err));
//   }

//   static deleteById(id) {
//     const db = getDb();
//     return db.collection('products').deleteOne({ _id: new mongoDb.ObjectId(id) }).then(response => response).catch(err => console.log(err));
//   }
// }

// module.exports = Product;