// const Sequelize = require('sequelize');

// const sequelize = require('../util/database');

// const Order = sequelize.define('order', {
//   id:{
//     type: Sequelize.INTEGER,
//     autoIncrement: true,
//     allowNull: false,
//     primaryKey: true
//   }
// })

// module.exports = Order;

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  items: [{ productId: { type: mongoose.Types.ObjectId, ref: 'Product' }, quantity: Number }],
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;