import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import html2pdf from 'html2pdf.js';
import writtenNumber from 'written-number';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import fontAmiri from "./Amiri-Regular-normal";

function AllInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    fetch('http://localhost:5000/api/invoices', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(t("failLoadInvoices"));
        return res.json();
      })
      .then(data => setInvoices(data || []))
      .catch(err => {
        console.error(err);
        alert(t("failLoadInvoices"));
      });
  }, []);

  const handleExportPDF = async (invoice) => {
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
      return d.toLocaleDateString(i18n.language === 'ar' ? "ar-EG" : "en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    };

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
      drawText(t("sidebar.Invoice"), pageWidth - margin, 25, { align: "right" });
      if (logoImg) doc.addImage(logoImg, "JPEG", margin, 10, 40, 20);
    };

    // 🟢 الفوتر
    const drawFooter = () => {
      const footerY = pageHeight - 50;
      doc.setFontSize(12);

      // معلومات الدفع
      drawText(t("paymentInfo"), margin, footerY);
      drawText(`${t("bank")}: ${invoice.bankName || (i18n.language === "ar" ? "بنك الخرطوم" : "Bank of Khartoum")}`, margin, footerY + 6);
      drawText(`${t("accountName")}: ${invoice.accountName || (i18n.language === "ar" ? "كيان" : "kian")}`, margin, footerY + 12);
      drawText(`${t("accountNumber")}: ${invoice.accountNumber || (i18n.language === "ar" ? "١٦١٧١٨" : "151617")}`, margin, footerY + 18);

      // معلومات الشركة
      drawText(t("companyInfo"), pageWidth - margin, footerY, { align: "right" });
      drawText("+249911451467", pageWidth - margin, footerY + 6, { align: "right" });
      drawText("support@kian24.com", pageWidth - margin, footerY + 12, { align: "right" });
      drawText("www.kian24.com", pageWidth - margin, footerY + 18, { align: "right" });
      drawText(i18n.language === "ar" ? "بورتسودان | حي الأغاريق | الشركة السودانية" : "Port Sudan | Al-Aghariq District | South Sudan Company", pageWidth - margin, footerY + 24, { align: "right" });

      doc.setFontSize(14);
      drawText(t("thankYou"), pageWidth / 2, footerY + 40, { align: "center" });
    };

    drawHeader();

    // بيانات العميل
    doc.setFontSize(12);
    drawText(`${t("client")}: ${clientName}`, margin, 45, { align: "left" });
    if (invoice.clientPhone) drawText(`${invoice.clientPhone}`, margin, 51, { align: "left" });
    if (invoice.clientAddress) drawText(`${invoice.clientAddress}`, margin, 57, { align: "left" });

    // بيانات الفاتورة
    drawText(`${t("invoiceNumber")}: ${invoice.invoiceNumber || "---"}`, pageWidth - margin, 45, { align: "right" });
    drawText(`${formatDate(invoice.created_at || invoice.date)}`, pageWidth - margin, 51, { align: "right" });

    // 🟢 جدول العناصر
    const tableColumns = [t("items"), t("quantity"), t("price"), t("total")];
    const tableRows =
      invoiceItems.length > 0
        ? invoiceItems.map((i) => [
            i.name || i.service || "",
            i.quantity,
            `${i.price.toLocaleString()} $`,
            `${(i.price * i.quantity).toLocaleString()} $`,
          ])
        : [[t("noInvoices"), "", "", ""]];

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
    const headerHeight = 50;
    const startYNewPage = headerHeight + 10;

    if (finalY + 30 > pageHeight - footerHeight) {
      doc.addPage();
      drawHeader();
      finalY = startYNewPage;
    }

    doc.autoTable({
      startY: finalY,
      theme: "grid",
      body: [
        [t("subtotal"), `${totalAmount.toLocaleString("en-US")} $`],
        [t("tax"), "0 $"],
        [t("total"), `${totalAmount.toLocaleString("en-US")} $`],
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

  return (
    <div dir={i18n.language === "ar" ? "rtl" : "ltr"} style={{ padding: '20px', maxWidth: '900px', margin: 'auto' }}>
      <h2>{t("allInvoices")}</h2>
      {invoices.length > 0 ? (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>{t("invoiceNumber")}</th>
              <th style={thStyle}>{t("client")}</th>
              <th style={thStyle}>{t("date")}</th>
              <th style={thStyle}>{t("items")}</th>
              <th style={thStyle}>{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr 
                key={inv.id} 
                style={tdRowStyle}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f3f5'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
              >
                <td style={tdStyle}>{inv.invoiceNumber}</td>
                <td style={tdStyle}>{inv.clientName}</td>
                <td style={tdStyle}>{inv.date}</td>
                <td style={tdStyle}>{inv.Items?.length || 0}</td>
                <td style={tdStyle}>
                  <button 
                    onClick={() => navigate(`/view/${inv.invoiceNumber}`)} 
                    style={editButton}
                    title={t("viewInvoice")}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  >
                    {t("view")}
                  </button>
                  <button 
                    onClick={() => handleExportPDF(inv)} 
                    style={pdfButton}
                    title={t("exportPDF")}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  >
                    {t("pdf")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>{t("noInvoices")}</p>
      )}
    </div>
  );
}

// ---------------------------- Styles ----------------------------
const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '20px'
};

const thStyle = {
  backgroundColor: '#f0f0f0',
  padding: '10px',
  border: '1px solid #ccc'
};

const tdStyle = {
  padding: '10px',
  border: '1px solid #ccc',
  textAlign: 'center'
};

const tdRowStyle = {
  transition: '0.2s ease'
};

const editButton = {
  fontSize: '14px',
  padding: '5px 10px',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  marginRight: '5px',
  cursor: 'pointer',
  transition: '0.2s ease'
};

const pdfButton = {
  ...editButton,
  backgroundColor: '#007bff'
};

export default AllInvoicesPage;
