import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiFileText, FiLogOut, FiMenu, FiUser } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from 'react-i18next';  

function Sidebar() {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); 

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsername(decoded.username || '');
      } catch {
        setUsername('');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("appLang", lng);
  };

  const isRTL = i18n.language === 'ar';

  // تأثير Hover/Click على الروابط
  const handleLinkHover = (e) => e.currentTarget.style.transform = 'scale(1.02)';
  const handleLinkLeave = (e) => e.currentTarget.style.transform = 'scale(1)';

  // تأثير Hover/Click على الأزرار
  const handleBtnHover = (e) => e.currentTarget.style.transform = 'scale(1.05)';
  const handleBtnLeave = (e) => e.currentTarget.style.transform = 'scale(1)';

  const handleBtnDown = (e) => e.currentTarget.style.transform = 'scale(0.97)';
  const handleBtnUp = (e) => e.currentTarget.style.transform = 'scale(1.05)';

  return (
    <>
      {/* زر فتح السايدبار */}
      <button
        onClick={() => setOpen(!open)}
        style={toggleButtonStyle}
      >
        <FiMenu size={22} />
      </button>

      {/* السايدبار */}
      <div style={{
        ...sidebarStyle,
        right: open ? '0' : '-270px',
        boxShadow: open ? '-5px 0 20px rgba(0,0,0,0.5)' : 'none',
        transform: open ? 'translateX(0)' : 'translateX(20px)',
        transition: 'right 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease',
        direction: isRTL ? 'rtl' : 'ltr'
      }}>
        <div style={headerStyle}>
          <h3 style={{ textAlign: isRTL ? 'right' : 'left' }}>📋 {t("sidebar.systemTitle")}</h3>
          {username && (
            <p style={{ ...usernameStyle, textAlign: isRTL ? 'right' : 'left' }}>👤 {username}</p>
          )}
        </div>

        <nav style={navStyle}>
          <Link 
            to="/profile" 
            style={{ ...linkStyle, flexDirection: isRTL ? 'row-reverse' : 'row' }}
            onMouseEnter={handleLinkHover}
            onMouseLeave={handleLinkLeave}
            onMouseDown={handleBtnDown}
            onMouseUp={handleBtnUp}
          >
            <FiUser /> {t("sidebar.profile")}
          </Link>

          <Link 
            to="/invoices" 
            style={{ ...linkStyle, flexDirection: isRTL ? 'row-reverse' : 'row' }}
            onMouseEnter={handleLinkHover}
            onMouseLeave={handleLinkLeave}
            onMouseDown={handleBtnDown}
            onMouseUp={handleBtnUp}
          >
            <FiHome /> {t("sidebar.home")}
          </Link>

          <Link 
            to="/Invoice" 
            style={{ ...linkStyle, flexDirection: isRTL ? 'row-reverse' : 'row' }}
            onMouseEnter={handleLinkHover}
            onMouseLeave={handleLinkLeave}
            onMouseDown={handleBtnDown}
            onMouseUp={handleBtnUp}
          >
            <FiFileText /> {t("sidebar.createInvoice")}
          </Link>

          <Link 
            to="/all" 
            style={{ ...linkStyle, flexDirection: isRTL ? 'row-reverse' : 'row' }}
            onMouseEnter={handleLinkHover}
            onMouseLeave={handleLinkLeave}
            onMouseDown={handleBtnDown}
            onMouseUp={handleBtnUp}
          >
            <FiFileText /> {t("sidebar.previousInvoices")}
          </Link>
        </nav>

        {/* اختيار اللغة */}
        <div style={langSwitchStyle}>
          <button
            onClick={() => changeLanguage("en")}
            style={{
              ...langBtnStyle,
              backgroundColor: i18n.language === 'en' ? '#007bff' : '#6c757d'
            }}
            onMouseEnter={handleBtnHover}
            onMouseLeave={handleBtnLeave}
            onMouseDown={handleBtnDown}
            onMouseUp={handleBtnUp}
          >
            EN
          </button>

          <button
            onClick={() => changeLanguage("ar")}
            style={{
              ...langBtnStyle,
              backgroundColor: i18n.language === 'ar' ? '#007bff' : '#6c757d'
            }}
            onMouseEnter={handleBtnHover}
            onMouseLeave={handleBtnLeave}
            onMouseDown={handleBtnDown}
            onMouseUp={handleBtnUp}
          >
            AR
          </button>
        </div>

        {/* زر تسجيل الخروج بأسفل القائمة */}
        <div style={logoutContainerStyle}>
          <button
            onClick={handleLogout}
            style={{ 
              ...logoutButtonStyle, 
              fontFamily: 'Amiri'
            }}
            onMouseEnter={handleBtnHover}
            onMouseLeave={handleBtnLeave}
            onMouseDown={handleBtnDown}
            onMouseUp={handleBtnUp}
          >
            <FiLogOut 
              style={{ 
                marginLeft: isRTL ? '0' : '8px', 
                marginRight: isRTL ? '8px' : '0' 
              }} 
            />
            {t("sidebar.logout")}
          </button>
        </div>
      </div>

      {/* خلفية مظللة */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 999
          }}
        />
      )}
    </>
  );
}

// ---------------------------- Styles ----------------------------

const toggleButtonStyle = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  zIndex: 1001,
  background: '#007bff',
  color: 'white',
  padding: '10px 12px',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  transition: '0.2s'
};

const sidebarStyle = {
  position: 'fixed',
  top: 0,
  right: 0,
  width: '250px',
  height: '100%',
  background: 'linear-gradient(to bottom, #343a40, #212529)',
  color: 'white',
  padding: '20px',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
};

const headerStyle = {
  borderBottom: '1px solid #666',
  paddingBottom: '10px',
  marginBottom: '20px',
  fontSize: '20px'
};

const usernameStyle = {
  marginTop: '8px',
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#adb5bd'
};

const navStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px'
};

const linkStyle = {
  textDecoration: 'none',
  color: 'white',
  backgroundColor: '#495057',
  padding: '12px',
  borderRadius: '6px',
  fontSize: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  transition: '0.2s',
  cursor: 'pointer'
};

const langSwitchStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '20px',
  gap: '10px'
};

const langBtnStyle = {
  flex: 1,
  padding: '8px',
  border: 'none',
  borderRadius: '6px',
  color: 'white',
  cursor: 'pointer',
  transition: '0.2s'
};

const logoutContainerStyle = {
  marginTop: 'auto',
  paddingTop: '20px',
  marginBottom: '40px',
  borderTop: '1px solid #555'
};

const logoutButtonStyle = {
  width: '100%',
  padding: '12px',
  fontSize: '16px',
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: '0.2s'
};

export default Sidebar;
