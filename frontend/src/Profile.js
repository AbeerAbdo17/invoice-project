import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from 'react-i18next';
import fontAmiri from "./Amiri-Regular-normal";

function Profile() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUsername(decoded.username);
      setEmail(decoded.email);
    } catch (err) {
      console.error(t('failSave', { message: 'Invalid token' }));
      navigate('/login');
    }
  }, [navigate, t]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  const handleViewInvoices = () => {
    navigate('/all');
  };

  const interactiveStyle = (color, key) => ({
    padding: '10px 25px',   // كبر حجم الأزرار
    fontSize: '20px',       // خط أكبر
    backgroundColor: hoveredBtn === key ? shadeColor(color, -10) : color,
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: '0.2s',
    boxShadow: hoveredBtn === key ? '0 6px 15px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.2)',
  });

  function shadeColor(color, percent) {
    let f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent;
    let R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#" + (0x1000000 + (Math.round((t-R)*p/100)+R)*0x10000 
      + (Math.round((t-G)*p/100)+G)*0x100 + (Math.round((t-B)*p/100)+B))
      .toString(16).slice(1);
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={containerStyle}>
      <h2 style={{ ...titleStyle, fontFamily: 'Amiri' }}>{t('profile.welcome')}</h2>
      <div style={{ ...cardStyle, fontFamily: 'Amiri' }}>
        <p style={{ ...infoStyle, fontFamily: 'Amiri' }}>
          <strong>{t('profile.username')}:</strong> {username}
        </p>

        <div style={buttonGroupStyle}>
          <button
            onClick={handleViewInvoices}
            onMouseEnter={() => setHoveredBtn('view')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{ ...interactiveStyle('#6c757d', 'view'), fontFamily: 'Amiri' }}
          >
            {t('profile.viewInvoices')}
          </button>

          <button
            onClick={handleChangePassword}
            onMouseEnter={() => setHoveredBtn('change')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{ ...interactiveStyle('#007bff', 'change'), fontFamily: 'Amiri' }}
          >
            {t('profile.changePassword')}
          </button>

          <button
            onClick={handleLogout}
            onMouseEnter={() => setHoveredBtn('logout')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{ ...interactiveStyle('#dc3545', 'logout'), fontFamily: 'Amiri' }}
          >
            {t('profile.logout')}
          </button>
        </div>
      </div>
    </div>
  );
}

const containerStyle = {
  maxWidth: '600px',
  margin: '80px auto',
  padding: '20px',
  fontFamily: 'Tahoma, Arial',
  textAlign: 'center'
};

const titleStyle = {
  marginBottom: '30px',
  fontSize: '28px', // خط أكبر للعنوان
  color: '#333'
};

const cardStyle = {
  backgroundColor: '#fff',
  padding: '40px', // مساحة أكبر حول النصوص
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
};

const infoStyle = {
  fontSize: '20px', // تكبير الخط
  marginBottom: '20px',
  color: '#444'
};

const buttonGroupStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '20px',
  flexWrap: 'wrap'
};

export default Profile;
