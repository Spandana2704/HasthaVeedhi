//frontend/services/api.js

const API_URL = 'http://localhost:5000'; // backend URL

// Register user
export const register = async (userData) => {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed.');
    return data;
  } catch (error) {
    throw new Error(error.message || 'Error during registration.');
  }
};

// Login user
export const login = async (credentials) => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed.');

    // Save token and role to localStorage
    if (data.token && data.role) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
    } else {
      throw new Error('Missing token or role in response');
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || 'Error during login.');
  }
};
// Get user role (from localStorage)
export const getUserRole = () => {
  const role = localStorage.getItem('role');  // Retrieve the role from localStorage
  return { role: role || 'guest' };  // Default to 'guest' if no role is found
};
