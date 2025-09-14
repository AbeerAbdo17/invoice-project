const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('invoices_db', 'root', '0000', {
  host: 'localhost',
  dialect: 'mysql'
});

module.exports = sequelize;