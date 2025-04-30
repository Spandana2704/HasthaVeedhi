import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role') || 'guest'; // Default to 'guest' if no role
    
    // Redirect based on the role
    if (role === 'customer') {
      navigate('/customer-map');
    } else if (role === 'seller') {
      navigate('/seller-dashboard');
    } else {
      console.error('Unknown role:', role);
      navigate('/auth'); // Redirect to login if no valid role
    }
  }, [navigate]);

  return (
    <div>
      <h2>Loading your dashboard...</h2>
    </div>
  );
};

export default Dashboard;