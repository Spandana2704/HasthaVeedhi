import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/api';
import '../styles/AuthPage.css';

const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: '',
    phone: '',
    email: '',
    password: '',
    role: 'customer'
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    return password.length >= minLength && hasUpper && hasLower && hasDigit;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        if (!validatePassword(form.password)) {
          setMessage('Password must be at least 8 characters and include uppercase, lowercase, and a number.');
          return;
        }
        await register(form);
        setMessage('Registration successful. Please log in.');
        setIsRegister(false);
      } else {
        const data = await login(form);
        sessionStorage.setItem('loggedIn', 'true');
        sessionStorage.setItem('role', data.role);
        sessionStorage.setItem('user', JSON.stringify(data));
        setMessage(`Logged in as ${data.role}`);

        if (data.role === 'customer') {
          navigate('/customer-map');
        } else if (data.role === 'seller') {
          navigate('/seller-dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setMessage(err.message || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <>
            <input name="username" placeholder="Username" onChange={handleChange} required />
            <input name="phone" placeholder="Phone" onChange={handleChange} required />
          </>
        )}
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        
        <div className="password-field">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="show-password-btn"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        {isRegister && (
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="customer">Customer</option>
            <option value="seller">Seller</option>
          </select>
        )}

        {/* Bootstrap Primary Button */}
        <button type="submit" className="btn btn-primary submit-btn">
          {isRegister ? 'Register' : 'Login'}
        </button>
      </form>

      <p>{message}</p>

      {/* Toggle with Bootstrap Outline Button */}
      <button
        onClick={() => setIsRegister(!isRegister)}
        className="btn btn-outline-primary toggle-btn"
      >
        {isRegister ? 'Already have an account? Login' : 'Don’t have an account? Register'}
      </button>
    </div>
  );
};

export default AuthPage;
