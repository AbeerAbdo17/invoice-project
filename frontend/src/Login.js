import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function LoginRegister() {
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const navigate = useNavigate();

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    document.body.dir = isRTL ? 'rtl' : 'ltr';
  }, [isRTL]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAuth = async () => {
    if (mode === 'register') {
      if (!username.trim() || !email.trim() || !password.trim()) {
        setFormError(t('loginRegister.allFieldsRequired'));
        return;
      }
      if (!isValidEmail(email)) {
        setEmailError(t('loginRegister.invalidEmail'));
        return;
      }
      setFormError('');
      setEmailError('');
    }

    if (mode === 'login') {
      if (!username.trim() || !password.trim()) {
        setFormError(t('loginRegister.loginFieldsRequired'));
        return;
      }
      setFormError('');
    }

    const url = `http://100.70.131.12:5000/api/${mode}`;
    const body = mode === 'login'
      ? { loginId: username, password }
      : { username, email, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (data.success) {
        if (mode === 'login') {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify({ username: data.username }));
          navigate('/invoices');
        } else {
          alert(t('loginRegister.registerSuccess'));
          setMode('login');
          setUsername('');
          setEmail('');
          setPassword('');
          setFormError('');
          setEmailError('');
        }
      } else {
        alert(t('loginRegister.error', { message: data.message || 'حدث خطأ' }));
      }
    } catch (err) {
      alert(t('loginRegister.error', { message: err.message }));
    }
  };

  const interactiveButtonStyle = (color, key) => ({
    padding: '10px 24px',           // أكبر حجم
    fontSize: '18px',
    backgroundColor: hoveredBtn === key ? shadeColor(color, -10) : color,
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: '0.2s',
    boxShadow: hoveredBtn === key ? '0 6px 15px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.2)',
  });

  function shadeColor(color, percent) {
    let f = parseInt(color.slice(1),16), t = percent<0?0:255, p = percent<0?percent*-1:percent;
    let R = f>>16, G = f>>8&0x00FF, B = f&0x0000FF;
    return "#" + (0x1000000 + (Math.round((t-R)*p/100)+R)*0x10000 
      + (Math.round((t-G)*p/100)+G)*0x100 + (Math.round((t-B)*p/100)+B))
      .toString(16).slice(1);
  }

  const languageButtonStyle = {
    position: 'fixed',
    top: '20px',
    [isRTL ? 'right' : 'left']: '20px',
    padding: '10px 14px',
    backgroundColor: '#007bff',
    color: '#fff',
    borderRadius: '6px',
    cursor: 'pointer',
    zIndex: 1000
  };

  return (
    <div style={containerStyle}>
      <div onClick={toggleLanguage} style={languageButtonStyle}>
        {i18n.language === 'ar' ? 'EN' : 'AR'}
      </div>

      <h2>{mode === 'login' ? t('loginRegister.loginTitle') : t('loginRegister.registerTitle')}</h2>

      {formError && (
        <div style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>{formError}</div>
      )}

      <input
        type="text"
        placeholder={mode === 'login' ? t('loginRegister.usernameOrEmail') : t('loginRegister.username')}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={inputStyle}
      /><br />

      {mode === 'register' && (
        <>
          <input
            type="email"
            placeholder={t('loginRegister.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          /><br />
          {emailError && (
            <div style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>{emailError}</div>
          )}
        </>
      )}

      <input
        type="password"
        placeholder={t('loginRegister.password')}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      /><br />

      <button
        onClick={handleAuth}
        onMouseEnter={() => setHoveredBtn('auth')}
        onMouseLeave={() => setHoveredBtn(null)}
        style={interactiveButtonStyle('#28a745', 'auth')}
      >
        {mode === 'login' ? t('loginRegister.loginButton') : t('loginRegister.registerButton')}
      </button>

      <p style={{ marginTop: '20px' }}>
        {mode === 'login' ? t('loginRegister.noAccount') : t('loginRegister.hasAccount')}{' '}
        <span onClick={() => {
          setMode(mode === 'login' ? 'register' : 'login');
          setFormError('');
          setEmailError('');
        }} style={{ color: 'blue', cursor: 'pointer' }}>
          {mode === 'login' ? t('loginRegister.signUpNow') : t('loginRegister.loginNow')}
        </span>
      </p>
    </div>
  );
}

const containerStyle = {
  maxWidth: '500px',      // كبرنا البورد
  width: '90%',            // خلي العرض نسبي
  margin: '80px auto',    
  padding: '30px',
  textAlign: 'center',
  background: '#fff',
  borderRadius: '12px',
  boxShadow: '0 0 20px rgba(0,0,0,0.1)'
};

const inputStyle = {
  padding: '10px',         // خففنا شوي البادينج
  margin: '10px 0',
  width: '90%',            // خلي الحقل 90% من عرض البورد
  maxWidth: '400px',       // لا يزيد عن 400px
  fontSize: '16px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  boxSizing: 'border-box'  // عشان البادينج ما يطلع الحقل من البورد
};


export default LoginRegister;
