const express = require('express');
const router = express.Router();
const db = require('../models');
const { Invoice, Item, Sequelize } = db;

router.post('/', async (req, res) => {
  const { invoiceNumber, clientName, date, items } = req.body;
  try {
    const invoice = await Invoice.create({ invoiceNumber, clientName, date });
    const formattedItems = items.map(item => ({
      ...item,
      invoiceId: invoice.id,
    }));
    await Item.bulkCreate(formattedItems);
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const { search } = req.query;
  const where = search
    ? {
        [Sequelize.Op.or]: [
          { invoiceNumber: { [Sequelize.Op.like]: `%${search}%` } },
          { clientName: { [Sequelize.Op.like]: `%${search}%` } }
        ]
      }
    : {};

  const invoices = await Invoice.findAll({
    where,
    include: [{ model: Item, as: 'items' }],
    order: [['createdAt', 'DESC']],
  });

  res.json(invoices);
});

module.exports = router;