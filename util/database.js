const Sequelize = require('sequelize');

const sqlPassword = require('./password')

const sequelize = new Sequelize.Sequelize('node-complete', 'root', sqlPassword.password, { dialect: 'mysql', host: 'localhost' });

module.exports = sequelize;