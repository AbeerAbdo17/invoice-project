import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import fontAmiri from "./Amiri-Regular-normal";
import { useTranslation } from 'react-i18next';

function InvoiceView() {
  const { t, i18n } = useTranslation();
  const { invoiceNumber } = useParams();
  const [invoice, setInvoice] = useState(null);
  const navigate = useNavigate();
  const pageLang = i18n.language; // 'ar' or 'en'
  const isRTL = pageLang === 'ar';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert(t('loginRegister.loginTitle'));
      navigate('/login');
      return;
    }

    fetch(`http://100.70.131.12:5000/api/invoices/${invoiceNumber}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          alert(t('loginRegister.loginTitle'));
          navigate('/login');
          return;
        }
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => setInvoice(data))
      .catch(err => {
        console.error('Fetch invoice error:', err);
        alert(t('failSave', { message: err.message }));
      });
  }, [invoiceNumber, navigate, t]);

const handleExportPDF = async () => {
  if (!invoice) return;

  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // ✅ إضافة خط عربي
  doc.addFileToVFS("Amiri-Regular.ttf", fontAmiri);
  doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");

  const logoImg = `${window.location.origin}/images/logo.jpg`;
  const invoiceItems = invoice.Items || [];
  const clientName = invoice.clientName || "—";
  const totalAmount =
    invoice.total ||
    invoiceItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString(pageLang === 'ar' ? "ar-EG" : "en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // دالة لتحديد الخط حسب النص
  const isArabic = (text) => /[\u0600-\u06FF]/.test(text);
  const drawText = (text, x, y, options = {}) => {
    if (!text) return;
    doc.setFont(isArabic(text) ? "Amiri" : "helvetica", "normal");
    doc.text(text, x, y, options);
  };

  // 🟢 الهيدر
  const drawHeader = () => {
    doc.setFont("Amiri", "normal");
    doc.setFontSize(28);
    drawText(pageLang === 'ar' ? "فاتورة" : "INVOICE", pageWidth - margin, 25, { align: "right" });
    if (logoImg) doc.addImage(logoImg, "JPEG", margin, 10, 40, 20);
  };

  // 🟢 الفوتر
  const drawFooter = () => {
    const footerY = pageHeight - 50;
    doc.setFontSize(12);

    const alignClientInfo = 'left';
    const alignCompanyInfo = 'right';

    // معلومات الدفع
    drawText(pageLang === 'ar' ? "معلومات الدفع" : "PAYMENT INFORMATION", margin, footerY);
    drawText(`${pageLang === 'ar' ? 'البنك' : 'Bank'}: ${invoice.bankName || (pageLang === 'ar' ? "بنك الخرطوم" : "Bank of Khartoum")}`, margin, footerY + 6);
    drawText(`${pageLang === 'ar' ? 'اسم الحساب' : 'Account Name'}: ${invoice.accountName ||(pageLang === 'ar' ? "كيان": "kian")}`, margin, footerY + 12);
    drawText(`${pageLang === 'ar' ? 'رقم الحساب' : 'Account No'}: ${invoice.accountNumber ||(pageLang === 'ar' ? "١٦١٧١٨": "151617")}`, margin, footerY + 18);

    // معلومات الشركة
    drawText(pageLang === 'ar' ? "معلومات الشركة" : "COMPANY INFORMATION", pageWidth - margin, footerY, { align: alignCompanyInfo });
    drawText("+249911451467", pageWidth - margin, footerY + 6, { align: alignCompanyInfo });
    drawText("support@kian24.com", pageWidth - margin, footerY + 12, { align: alignCompanyInfo });
    drawText("www.kian24.com", pageWidth - margin, footerY + 18, { align: alignCompanyInfo });
    drawText(pageLang === 'ar' ? "بورتسودان | حي الأغاريق | الشركة السودانية" : "Port Sudan | Al-Aghariq District | South Sudan Company", pageWidth - margin, footerY + 24, { align: alignCompanyInfo });

    doc.setFontSize(14);
    drawText(pageLang === 'ar' ? "شكراً لكم" : "Thank You", pageWidth / 2, footerY + 40, { align: "center" });
  };

  // 🟢 الهيدر
  drawHeader();

  // بيانات العميل
  doc.setFontSize(12);
  drawText(`${pageLang === 'ar' ? "العميل" : "Client"}: ${clientName}`, margin, 45, { align: "left" });
  if (invoice.clientPhone) drawText(`${invoice.clientPhone}`, margin, 51, { align: "left" });
  if (invoice.clientAddress) drawText(`${invoice.clientAddress}`, margin, 57, { align: "left" });

  // بيانات الفاتورة
  drawText(`${pageLang === 'ar' ? "رقم الفاتورة" : "Invoice No."}: ${invoice.invoiceNumber || "---"}`, pageWidth - margin, 45, { align: "right" });
  drawText(`${formatDate(invoice.created_at || invoice.date)}`, pageWidth - margin, 51, { align: "right" });

  // 🟢 جدول العناصر
  const tableColumns = pageLang === 'ar' ? ["الصنف", "الكمية", "سعر الوحدة", "الإجمالي"] : ["Item", "Quantity", "Unit Price", "Total"];
  const tableRows =
    invoiceItems.length > 0
      ? invoiceItems.map((i) => [
          i.name || i.service || "",
          i.quantity,
          `${i.price.toLocaleString()} $`,
          `${(i.price * i.quantity).toLocaleString()} $`,
        ])
      : [[pageLang === 'ar' ? "لا يوجد أصناف" : "No items", "", "", ""]];

  doc.autoTable({
    startY: 70,
    head: [tableColumns],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: [0, 0, 0],
      halign: "center",
      fontStyle: "bold",
    },
    bodyStyles: { halign: "center" },
    styles: { fontSize: 11, font: "Amiri" },
    margin: { top: 70, bottom: 60 },
    didDrawPage: (data) => {
      drawHeader();
      if (data.pageNumber === doc.internal.getNumberOfPages()) {
        drawFooter();
      }
    },
  });

  // 🟢 جدول الإجمالي
  let finalY = doc.lastAutoTable.finalY + 10;
  const footerHeight = 60;
  const headerHeight = 50; // ارتفاع الهيدر
  const startYNewPage = headerHeight + 10; // مسافة بين الهيدر والجدول في الصفحة الجديدة

  if (finalY + 30 > pageHeight - footerHeight) {
    doc.addPage();
    drawHeader();
    finalY = startYNewPage; // أقل مسافة من الهيدر للجدول الجديد
  }

  doc.autoTable({
    startY: finalY,
    theme: "grid",
    body: [
      [pageLang === 'ar' ? "الإجمالي الفرعي" : "Subtotal", `${totalAmount.toLocaleString("en-US")} $`],
      [pageLang === 'ar' ? "الضريبة (0%)" : "Tax (0%)", "0 $"],
      [pageLang === 'ar' ? "الإجمالي" : "Total", `${totalAmount.toLocaleString("en-US")} $`],
    ],
    columnStyles: {
      0: { halign: "left", cellWidth: 60 },
      1: { halign: "right", cellWidth: 40, fontStyle: "bold" },
    },
    styles: { fontSize: 12, font: "Amiri" },
    margin: { left: pageWidth - 110 },
  });

  doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
};

  if (!invoice) return <p>⏳ {t('loadingInvoice')}</p>;

  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={{ padding: '20px' }}>
      <p><strong>{t('invoiceNumber')}:</strong> {invoice.invoiceNumber}</p>
      <p><strong>{t('client')}:</strong> {invoice.clientName}</p>
      <p><strong>{t('date')}:</strong> {invoice.date}</p>

      <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }} border="1">
        <thead>
          <tr>
            <th>{t('itemOrService')}</th>
            <th>{t('price')}</th>
            <th>{t('quantity')}</th>
            <th>{t('total')}</th>
          </tr>
        </thead>
        <tbody>
          {invoice.Items.map((item, i) => (
            <tr key={i}>
              <td>{item.name}</td>
              <td>{item.price}</td>
              <td>{item.quantity}</td>
              <td>{(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

   <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
  <button 
    onClick={handleExportPDF} 
    style={pdfButton}
    title={t('exportPDF')}
    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
    onMouseUp={e => e.currentTarget.style.transform = 'scale(1.05)'}
  >
    {t('pdf')}
  </button>

  <button 
    onClick={() => navigate(-1)} 
    style={backButton}
    title={t('back')}
    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
    onMouseUp={e => e.currentTarget.style.transform = 'scale(1.05)'}
  >
    {t('back')}
  </button>
</div>

    </div>
  );
}
const pdfButton = {
  padding: '10px 20px',
  fontSize: '16px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  transition: '0.2s ease'
};

const backButton = {
  padding: '10px 20px',
  fontSize: '16px',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  transition: '0.2s ease'
};

export default InvoiceView;
