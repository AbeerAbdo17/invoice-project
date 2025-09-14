import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from "react-i18next";

function Invoice() {
  const invoiceRef = useRef();
  const navigate = useNavigate();
  const { invoiceNumber: invoiceParam } = useParams();
  const { t, i18n } = useTranslation();

  const [clientName, setClientName] = useState('');
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', price: '' });
  const [editIndex, setEditIndex] = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString(i18n.language === "ar" ? "ar-EG" : "en-GB"));

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (invoiceParam) {
      fetch(`http://100.70.131.12:5000/api/invoices/${invoiceParam}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data) {
            setInvoiceNumber(data.invoiceNumber);
            setClientName(data.clientName);
            setDate(data.date);
            setItems(data.Items || []);
          }
        });
    } else {
      fetch('http://100.70.131.12:5000/api/new-invoice-number', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setInvoiceNumber(data.invoiceNumber));
    }
  }, [invoiceParam, i18n.language]);

  const total = items.reduce((acc, item) => acc + item.quantity * item.price, 0);

  const handleAddOrUpdateItem = () => {
    if (!newItem.name || !newItem.quantity || !newItem.price) return;
    const item = {
      ...newItem,
      quantity: parseInt(newItem.quantity),
      price: parseFloat(newItem.price)
    };
    if (editIndex !== null) {
      const updatedItems = [...items];
      updatedItems[editIndex] = item;
      setItems(updatedItems);
      setEditIndex(null);
    } else {
      setItems([...items, item]);
    }
    setNewItem({ name: '', quantity: '', price: '' });
  };

  const handleEditItem = (index) => {
    setNewItem({
      name: items[index].name,
      quantity: items[index].quantity.toString(),
      price: items[index].price.toString()
    });
    setEditIndex(index);
  };

  const handleDeleteItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    if (editIndex === index) {
      setEditIndex(null);
      setNewItem({ name: '', quantity: '', price: '' });
    }
  };

  const handleSaveToDatabase = () => {
    const token = localStorage.getItem('token');
    fetch('http://100.70.131.12:5000/api/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ invoiceNumber, clientName, date, items })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert(t("saveSuccess"));
          navigate('/invoices');
        } else {
          alert(t("saveFail") + ": " + data.message);
        }
      });
  };

  const handleNewInvoice = () => {
    const token = localStorage.getItem('token');
    fetch('http://100.70.131.12:5000/api/new-invoice-number', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setInvoiceNumber(data.invoiceNumber);
        setClientName('');
        setItems([]);
        setNewItem({ name: '', quantity: '', price: '' });
        setEditIndex(null);
        setDate(new Date().toLocaleDateString(i18n.language === "ar" ? "ar-EG" : "en-GB"));
        navigate('/Invoice');
      });
  };

  return (
    <div dir={i18n.language === "ar" ? "rtl" : "ltr"} style={{ backgroundColor: '#f8f8f8', minHeight: '100vh', padding: '20px' }}>
      <div style={invoiceStyle}>
        <h3>{t("clientInfo")}</h3>
        <input
          type="text"
          placeholder={t("enterClientName")}
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          style={{ ...inputStyle, width: '100%' }}
        />

        <h3 style={{ marginTop: '30px' }}>
          {editIndex !== null ? t("editItem") : t("addItem")}
        </h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder={t("itemService")}
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder={t("quantity")}
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder={t("price")}
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            style={inputStyle}
          />
         <button 
  onClick={handleAddOrUpdateItem} 
  style={interactiveButton}
  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
  onMouseUp={e => e.currentTarget.style.transform = 'scale(1.05)'}
>
  {editIndex !== null ? t("saveEdit") : t("add")}
</button>

          {editIndex !== null && (
    <button 
  onClick={() => { setEditIndex(null); setNewItem({ name: '', quantity: '', price: '' }); }}
  style={{ ...interactiveButton, backgroundColor: '#dc3545' }}
  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
  onMouseUp={e => e.currentTarget.style.transform = 'scale(1.05)'}
>
  {t("cancel")}
</button>

          )}
        </div>

        <div ref={invoiceRef} style={invoiceAreaStyle}>
          <h2 style={{ textAlign: 'center' }}>{t("invoice")}</h2>
          <p><strong>{t("invoiceNumber")}:</strong> {invoiceNumber}</p>
          <p><strong>{t("date")}:</strong> {date}</p>
          <p><strong>{t("clientName")}:</strong> {clientName || '—'}</p>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={tableHeader}>{t("itemService")}</th>
                <th style={tableHeader}>{t("price")}</th>
                <th style={tableHeader}>{t("quantity")}</th>
                <th style={tableHeader}>{t("total")}</th>
                <th style={tableHeader}>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td style={tableCell}>{item.name}</td>
                  <td style={tableCell}>{item.price}</td>
                  <td style={tableCell}>{item.quantity}</td>
                  <td style={tableCell}>{(item.quantity * item.price).toFixed(2)}</td>
                  <td style={tableCell}>
                   <button 
  onClick={() => handleEditItem(index)} 
  style={interactiveSmallButton}
  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
  onMouseUp={e => e.currentTarget.style.transform = 'scale(1.1)'}
>
  ✏️
</button>

<button 
  onClick={() => handleDeleteItem(index)} 
  style={{ ...interactiveSmallButton, backgroundColor: '#dc3545' }}
  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
  onMouseUp={e => e.currentTarget.style.transform = 'scale(1.1)'}
>
  🗑️
</button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ textAlign: 'left', marginTop: '20px', fontWeight: 'bold' }}>
            {t("grandTotal")}: {total.toFixed(2)}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
         <button 
  onClick={handleSaveToDatabase} 
  style={interactiveButton}
  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
  onMouseUp={e => e.currentTarget.style.transform = 'scale(1.05)'}
>
  {t("save")}
</button>

        <button 
  onClick={handleNewInvoice} 
  style={{ ...interactiveButton, backgroundColor: '#6c757d' }}
  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
  onMouseUp={e => e.currentTarget.style.transform = 'scale(1.05)'}
>
  {t("newInvoice")}
</button>

        </div>
      </div>
    </div>
  );
}

const invoiceStyle = { fontFamily: 'Arial', width: '100%', maxWidth: '800px', margin: 'auto', backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' };
const invoiceAreaStyle = { border: '1px solid #ccc', borderRadius: '10px', padding: '20px', marginTop: '20px', backgroundColor: '#fafafa' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '20px' };
const tableHeader = { border: '1px solid #ccc', backgroundColor: '#f0f0f0', padding: '8px', textAlign: 'center' };
const tableCell = { border: '1px solid #ccc', padding: '8px', textAlign: 'center' };
const buttonStyle = { padding: '10px 15px', fontSize: '16px', cursor: 'pointer', borderRadius: '6px', border: 'none', backgroundColor: '#007bff', color: 'white', transition: '0.3s' };
const smallButtonStyle = { fontSize: '14px', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', border: 'none', backgroundColor: '#28a745', color: 'white', marginRight: '5px' };
const inputStyle = { padding: '8px', fontSize: '16px', minWidth: '120px', borderRadius: '4px', border: '1px solid #ccc' };

// أزرار كبيرة
const interactiveButton = {
  padding: '10px 15px',
  fontSize: '16px',
  cursor: 'pointer',
  borderRadius: '6px',
  border: 'none',
  backgroundColor: '#007bff',
  color: 'white',
  transition: '0.2s ease'
};

// أزرار صغيرة (Edit/Delete)
const interactiveSmallButton = {
  fontSize: '14px',
  padding: '5px 10px',
  cursor: 'pointer',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: '#28a745',
  color: 'white',
  marginRight: '5px',
  transition: '0.2s ease'
};

export default Invoice;
