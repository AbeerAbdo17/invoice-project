import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function ChangePassword() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const navigate = useNavigate();

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      setMessage(t('loginRegister.allFieldsRequired'));
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://100.70.131.12:5000/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error('❌ Response is not JSON:', text);
        setMessage(t('failSave', { message: 'Invalid server response' }));
        return;
      }

      if (data.success) {
        setMessage(t('saveSuccess'));
        setOldPassword('');
        setNewPassword('');
      } else {
        setMessage(t('saveFail', { message: data.message || 'حدث خطأ' }));
      }
    } catch (err) {
      console.error('❌ Server connection failed:', err);
      setMessage(t('saveFail', { message: 'Server connection failed' }));
    }
  };

  const interactiveStyle = (color, key) => ({
    padding: '15px 30px',       // أكبر
    fontSize: '18px',           // أكبر
    backgroundColor: hoveredBtn === key ? shadeColor(color, -10) : color,
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
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
      <h2>{t('profile.changePassword')}</h2>
      {message && (
        <div style={{ marginBottom: '10px', color: message.startsWith('✅') ? 'green' : 'red' }}>
          {message}
        </div>
      )}
      <input
        type="password"
        placeholder={t('loginRegister.password') + ' ' + t('loginRegister.old')}
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        style={inputStyle}
      /><br />
      <input
        type="password"
        placeholder={t('loginRegister.password') + ' ' + t('loginRegister.new')}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        style={inputStyle}
      /><br />
      <button
        onClick={handleChangePassword}
        onMouseEnter={() => setHoveredBtn('change')}
        onMouseLeave={() => setHoveredBtn(null)}
        style={interactiveStyle('#007bff', 'change')}
      >
        {t('profile.changePassword')}
      </button>
      <br /><br />
      <button
        onClick={() => navigate(-1)}
        onMouseEnter={() => setHoveredBtn('back')}
        onMouseLeave={() => setHoveredBtn(null)}
        style={interactiveStyle('#6c757d', 'back')}
      >
         {t('back')}
      </button>
    </div>
  );
}

const containerStyle = {
  maxWidth: '400px',
  margin: '100px auto',
  padding: '20px',
  textAlign: 'center',
  background: '#fff',
  borderRadius: '12px',
  boxShadow: '0 0 15px rgba(0,0,0,0.1)'
};

const inputStyle = {
  padding: '12px',
  margin: '10px 0',
  width: '100%',
  fontSize: '16px',
  borderRadius: '6px',
  border: '1px solid #ccc'
};

export default ChangePassword;
