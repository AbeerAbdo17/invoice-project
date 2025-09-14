// App.jsx
import { useTranslation } from "react-i18next";
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Login from './Login';
import Invoice from './Invoice';
import InvoiceList from './InvoiceList';
import AllInvoicesPage from './all';
import InvoiceView from './InvoiceView';
import Profile from './Profile'; 
import ChangePassword from './ChangePassword';

function AppWrapper() {
  const location = useLocation();
  const hideSidebar = ['/login', '/register'].includes(location.pathname);

  return (
    <>
      {!hideSidebar && <Sidebar />}
      <div style={{ marginRight: !hideSidebar ? '200px' : '0', padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/all" element={<AllInvoicesPage />} />
          <Route path="/Invoice" element={<Invoice />} />
          <Route path="/invoices" element={<InvoiceList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/edit/:invoiceNumber" element={<Invoice />} />
          <Route path="/view/:invoiceNumber" element={<InvoiceView />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // أول ما يفتح المشروع نسترجع اللغة من localStorage
    const savedLang = localStorage.getItem("appLang") || "en";
    i18n.changeLanguage(savedLang);

    // نغير الاتجاه (RTL/LTR)
    document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
  }, [i18n]);

  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}

export default App;
