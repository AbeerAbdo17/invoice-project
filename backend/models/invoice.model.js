module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define('Invoice', {
    invoiceNumber: DataTypes.STRING,
    clientName: DataTypes.STRING,
    date: DataTypes.STRING
  });
  return Invoice;
};