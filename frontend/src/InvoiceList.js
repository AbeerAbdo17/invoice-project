// InvoiceList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import fontAmiri from './Amiri-Regular-normal';
import { useTranslation } from 'react-i18next';

function InvoiceList() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  // hover effect state
  const [hoveredBtn, setHoveredBtn] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const term = searchTerm.trim();
      if (!term) {
        setResults([]);
        return;
      }
      const token = localStorage.getItem('token');
      fetch(`http://100.70.131.12:5000/api/search?term=${encodeURIComponent(term)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setResults(data))
        .catch(err => {
          console.error(err);
          alert(t('invoiceList.searchError'));
        });
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, t]);

  const handleDelete = (invoiceNumber) => {
    const token = localStorage.getItem('token');
    if (!window.confirm(t('invoiceList.confirmDelete', { number: invoiceNumber }))) return;

    fetch(`http://100.70.131.12:5000/api/invoices/${invoiceNumber}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setResults(prev => prev.filter(inv => inv.invoiceNumber !== invoiceNumber));
        else alert(t('invoiceList.deleteFailed'));
      })
      .catch(err => {
        console.error(err);
        alert(t('invoiceList.deleteError'));
      });
  };

  const handleExportPDF = (invoice) => {
    if (!invoice) return;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    doc.addFileToVFS('Amiri-Regular.ttf', fontAmiri);
    doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');

    const invoiceItems = invoice.Items || [];
    const clientName = invoice.clientName || '—';
    const totalAmount = invoice.total || invoiceItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

    const formatDate = (dateStr) => {
      if (!dateStr) return '—';
      const d = new Date(dateStr);
      return d.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-GB', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
    };

    const drawText = (text, x, y, options = {}) => {
      doc.setFont(/[\u0600-\u06FF]/.test(text) ? 'Amiri' : 'helvetica', 'normal');
      doc.text(text, x, y, options);
    };

    const drawHeader = () => {
      doc.setFont('Amiri', 'normal');
      doc.setFontSize(28);
      drawText(i18n.language === 'ar' ? 'فاتورة' : 'INVOICE', pageWidth - margin, 25, { align: 'right' });
      const logoImg = `${window.location.origin}/images/logo.jpg`;
      if (logoImg) doc.addImage(logoImg, 'JPEG', margin, 10, 40, 20);
    };

    const drawFooter = () => {
      const footerY = pageHeight - 50;
      doc.setFontSize(12);
      drawText(i18n.language === 'ar' ? 'معلومات الدفع' : 'PAYMENT INFORMATION', margin, footerY);
      drawText(`${i18n.language === 'ar' ? 'البنك' : 'Bank'}: ${invoice.bankName || (isRTL ? 'بنك الخرطوم' : 'Bank of Khartoum')}`, margin, footerY + 6);
      drawText(`${i18n.language === 'ar' ? 'اسم الحساب' : 'Account Name'}: ${invoice.accountName || (isRTL ? 'كيان' : 'kian')}`, margin, footerY + 12);
      drawText(`${i18n.language === 'ar' ? 'رقم الحساب' : 'Account No'}: ${invoice.accountNumber || (isRTL ? '١٦١٧١٨' : '151617')}`, margin, footerY + 18);

      drawText(i18n.language === 'ar' ? 'معلومات الشركة' : 'COMPANY INFORMATION', pageWidth - margin, footerY, { align: 'right' });
      drawText('+249911451467', pageWidth - margin, footerY + 6, { align: 'right' });
      drawText('support@kian24.com', pageWidth - margin, footerY + 12, { align: 'right' });
      drawText('www.kian24.com', pageWidth - margin, footerY + 18, { align: 'right' });
      drawText(i18n.language === 'ar' ? 'بورتسودان | حي الأغاريق | الشركة السودانية' : 'Port Sudan | Al-Aghariq District | South Sudan Company', pageWidth - margin, footerY + 24, { align: 'right' });

      doc.setFontSize(14);
      drawText(i18n.language === 'ar' ? 'شكراً لكم' : 'Thank You', pageWidth / 2, footerY + 40, { align: 'center' });
    };

    drawHeader();
    doc.setFontSize(12);
    drawText(`${t('invoiceList.clientName')}: ${clientName}`, margin, 45, { align: 'left' });
    if (invoice.clientPhone) drawText(`${invoice.clientPhone}`, margin, 51, { align: 'left' });
    if (invoice.clientAddress) drawText(`${invoice.clientAddress}`, margin, 57, { align: 'left' });
    drawText(`${t('invoiceList.invoiceNumber')}: ${invoice.invoiceNumber || '---'}`, pageWidth - margin, 45, { align: 'right' });
    drawText(`${formatDate(invoice.created_at || invoice.date)}`, pageWidth - margin, 51, { align: 'right' });

    const tableColumns = isRTL ? ['الصنف', 'الكمية', 'سعر الوحدة', 'الإجمالي'] : ['Item', 'Quantity', 'Unit Price', 'Total'];
    const tableRows = invoiceItems.length > 0 ? invoiceItems.map(i => [
      i.name || i.service || '',
      i.quantity,
      `${i.price.toLocaleString()} $`,
      `${(i.price * i.quantity).toLocaleString()} $`,
    ]) : [[isRTL ? 'لا يوجد أصناف' : 'No items', '', '', '']];

    doc.autoTable({
      startY: 70,
      head: [tableColumns],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], halign: 'center', fontStyle: 'bold' },
      bodyStyles: { halign: 'center' },
      styles: { fontSize: 11, font: 'Amiri' },
      margin: { top: 70, bottom: 60 },
      didDrawPage: (data) => {
        drawHeader();
        if (data.pageNumber === doc.internal.getNumberOfPages()) drawFooter();
      },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.autoTable({
      startY: finalY,
      theme: 'grid',
      body: [
        [isRTL ? 'الإجمالي الفرعي' : 'Subtotal', `${totalAmount.toLocaleString()} $`],
        [isRTL ? 'الضريبة (0%)' : 'Tax (0%)', '0 $'],
        [isRTL ? 'الإجمالي' : 'Total', `${totalAmount.toLocaleString()} $`],
      ],
      columnStyles: { 0: { halign: 'left', cellWidth: 60 }, 1: { halign: 'right', cellWidth: 40, fontStyle: 'bold' } },
      styles: { fontSize: 12, font: 'Amiri' },
      margin: { left: pageWidth - 110 },
    });

    doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
  };

  const interactiveStyle = (color) => ({
    transition: '0.2s',
    cursor: 'pointer',
    transform: hoveredBtn === color ? 'scale(1.05)' : 'scale(1)',
    backgroundColor: color,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '5px 10px',
    marginRight: '5px',
    fontSize: '14px',
  });

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ padding: '20px', maxWidth: '900px', margin: 'auto' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder={t('invoiceList.searchPlaceholder')}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ flexGrow: 1, padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button
          style={interactiveStyle('#007bff')}
          onMouseEnter={() => setHoveredBtn('#007bff')}
          onMouseLeave={() => setHoveredBtn(null)}
        >
          🔍
        </button>
      </div>

      {results.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr>
              <th style={thStyle}>{t('invoiceList.invoiceNumber')}</th>
              <th style={thStyle}>{t('invoiceList.clientName')}</th>
              <th style={thStyle}>{t('invoiceList.date')}</th>
              <th style={thStyle}>{t('invoiceList.items')}</th>
              <th style={thStyle}>{t('invoiceList.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {results.map((invoice, i) => (
              <tr key={i}>
                <td style={tdStyle}>{invoice.invoiceNumber}</td>
                <td style={tdStyle}>{invoice.clientName}</td>
                <td style={tdStyle}>{invoice.date}</td>
                <td style={tdStyle}>{invoice.Items?.length || 0}</td>
                <td style={tdStyle}>
                  <button
                    style={interactiveStyle('#6c757d')}
                    onMouseEnter={() => setHoveredBtn('#6c757d')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    onClick={() => navigate(`/view/${invoice.invoiceNumber}`)}
                  >
                    {t('invoiceList.view')}
                  </button>
                  <button
                    style={interactiveStyle('#137e2c')}
                    onMouseEnter={() => setHoveredBtn('#137e2c')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    onClick={() => navigate(`/edit/${invoice.invoiceNumber}`)}
                  >
                    {t('invoiceList.edit')}
                  </button>
                  <button
                    style={interactiveStyle('#007bff')}
                    onMouseEnter={() => setHoveredBtn('#007bff')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    onClick={() => handleExportPDF(invoice)}
                  >
                    {t('invoiceList.pdf')}
                  </button>
                  <button
                    style={interactiveStyle('#dc3545')}
                    onMouseEnter={() => setHoveredBtn('#dc3545')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    onClick={() => handleDelete(invoice.invoiceNumber)}
                  >
                    {t('invoiceList.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>🔎 {t('invoiceList.searchPlaceholder')}</p>
      )}

      <button
  style={{
    position: 'fixed',
    bottom: '20px',
    left: isRTL ? '20px' : 'auto',
    right: !isRTL ? '20px' : 'auto',
    padding: '12px 18px',
    fontSize: '16px',
    borderRadius: '50px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    cursor: 'pointer',
    zIndex: 1000,
    transition: '0.3s',
    transform: hoveredBtn === 'newInvoice' ? 'scale(1.05)' : 'scale(1)',
  }}
  onMouseEnter={() => setHoveredBtn('newInvoice')}
  onMouseLeave={() => setHoveredBtn(null)}
  onClick={() => navigate('/Invoice')}
>
  {t('invoiceList.newInvoice')}
</button>

    </div>
  );
}

const thStyle = { backgroundColor: '#f0f0f0', padding: '10px', border: '1px solid #ccc' };
const tdStyle = { padding: '10px', border: '1px solid #ccc', textAlign: 'center' };

export default InvoiceList;
