const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config');

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Invoice = require('./invoice.model')(sequelize, DataTypes);
db.Item = require('./item.model')(sequelize, DataTypes);

db.Invoice.hasMany(db.Item, { as: 'items', foreignKey: 'invoiceId' });
db.Item.belongsTo(db.Invoice, { foreignKey: 'invoiceId' });

module.exports = db;