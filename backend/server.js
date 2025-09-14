const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes, Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const SECRET_KEY = 'your-secret-key';

app.use(cors());
app.use(bodyParser.json());

const sequelize = new Sequelize('invoices_db', 'root', '0000', {
  host: 'localhost',
  dialect: 'mysql',
  dialectOptions: { charset: 'utf8mb4' },
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  }
});

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING(191), unique: true, allowNull: false },
  email: { type: DataTypes.STRING(191), unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false }
});


const Invoice = sequelize.define('Invoice', {
  invoiceNumber: DataTypes.STRING,
  clientName: DataTypes.STRING,
  date: DataTypes.STRING,
  userId: DataTypes.INTEGER,
});

const Item = sequelize.define('Item', {
  name: DataTypes.STRING,
  quantity: DataTypes.INTEGER,
  price: DataTypes.FLOAT,
});

Invoice.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Invoice, { foreignKey: 'userId' });
Invoice.hasMany(Item, { foreignKey: 'invoiceId', onDelete: 'CASCADE' });
Item.belongsTo(Invoice, { foreignKey: 'invoiceId' });

sequelize.sync({ force: true });


// 🛡️ التحقق من التوكن
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// register
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // تحقق من وجود اسم مستخدم أو بريد إلكتروني مسبقًا
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'اسم المستخدم أو البريد الإلكتروني مستخدم مسبقًا' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hashedPassword });

    res.json({ success: true, message: 'تم إنشاء المستخدم بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// login
app.post('/api/login', async (req, res) => {
  const { loginId, password } = req.body; // loginId = username or email
  try {
    const user = await User.findOne({
      where: {
        [Op.or]: [{ username: loginId }, { email: loginId }]
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'المستخدم غير موجود' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'كلمة المرور غير صحيحة' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ success: true, token, username: user.username });
  } catch (error) {
    res.status(500).json({ success: false, message: 'فشل في تسجيل الدخول', error: error.message });
  }
});


// retrive invoice
app.get('/api/invoices', authenticateToken, async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      include: [{ model: Item }]
    });
    res.json(invoices);
  } catch (error) {
    console.error("🔥 خطأ في /api/invoices:", error);
    res.status(500).json({ message: error.message });
  }
});

// create or update
app.post('/api/invoices', authenticateToken, async (req, res) => {
  try {
    const { invoiceNumber, clientName, date, items } = req.body;

    if (!clientName || clientName.trim() === '') {
      return res.status(400).json({ success: false, message: 'الرجاء إدخال اسم العميل' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'الرجاء إدخال الأصناف' });
    }

    let invoice = await Invoice.findOne({ where: { invoiceNumber, userId: req.user.id } });

    if (invoice) {
      await invoice.update({ clientName, date });
      await Item.destroy({ where: { invoiceId: invoice.id } });
    } else {
      invoice = await Invoice.create({ invoiceNumber, clientName, date, userId: req.user.id });
    }

    for (const item of items) {
      await Item.create({ ...item, invoiceId: invoice.id });
    }

    res.json({ success: true, invoiceId: invoice.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// view invoice 
app.get('/api/invoices/:invoiceNumber', authenticateToken, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      where: {
        invoiceNumber: req.params.invoiceNumber,
        userId: req.user.id
      },
      include: Item,
    });
    if (!invoice) return res.status(404).json({ message: 'الفاتورة غير موجودة' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// edite invoice
app.put('/api/invoices/:invoiceNumber', authenticateToken, async (req, res) => {
  try {
    const { clientName, date, items } = req.body;
    const invoice = await Invoice.findOne({ where: { invoiceNumber: req.params.invoiceNumber, userId: req.user.id } });

    if (!invoice) return res.status(404).json({ message: 'الفاتورة غير موجودة' });

    await invoice.update({ clientName, date });
    await Item.destroy({ where: { invoiceId: invoice.id } });

    for (const item of items) {
      await Item.create({ ...item, invoiceId: invoice.id });
    }

    res.json({ success: true, message: 'تم التحديث' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete invoice
app.delete('/api/invoices/:invoiceNumber', authenticateToken, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ where: { invoiceNumber: req.params.invoiceNumber, userId: req.user.id } });

    if (!invoice) return res.status(404).json({ message: 'الفاتورة غير موجودة' });

    await invoice.destroy();

    res.json({ success: true, message: 'تم الحذف بنجاح' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// search by name| id| item
app.get('/api/search', authenticateToken, async (req, res) => {
  try {
    const { term } = req.query;

    const invoices = await Invoice.findAll({
      where: {
        userId: req.user.id,
        [Op.or]: [
          { invoiceNumber: { [Op.like]: `%${term}%` } },
          { clientName: { [Op.like]: `%${term}%` } },
          Sequelize.literal(`EXISTS (
            SELECT 1 FROM Items 
            WHERE Items.invoiceId = Invoice.id 
            AND Items.name LIKE '%${term}%'
          )`)
        ]
      },
      include: [{ model: Item }]
    });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// genrate invoice num
app.get('/api/new-invoice-number', authenticateToken, async (req, res) => {
  try {
    const lastInvoice = await Invoice.findOne({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    let newNumber = 'INV-001';

    if (lastInvoice && lastInvoice.invoiceNumber) {
      const match = lastInvoice.invoiceNumber.match(/INV-(\d+)/);
      if (match) {
        const lastNum = parseInt(match[1]);
        const nextNum = lastNum + 1;
        newNumber = `INV-${String(nextNum).padStart(3, '0')}`;
      }
    }

    res.json({ invoiceNumber: newNumber });
  } catch (error) {
    console.error('خطأ في توليد رقم الفاتورة:', error);
    res.status(500).json({ message: 'حدث خطأ في توليد رقم الفاتورة' });
  }
});
app.post('/api/change-password', authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة' });
  }

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'كلمة المرور القديمة غير صحيحة' });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedNewPassword });

    res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    console.error('🔴 خطأ عند تغيير كلمة المرور:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ في السيرفر', error: error.message });
  }
});



// app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
app.listen(5000, '0.0.0.0', () => {
  console.log("Server running on port 5000");
});
