import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for React Router v6
import { getUserRole } from '../services/api'; // Assuming this function fetches the current user's role

const Dashboard = () => {
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const data = await getUserRole(); // Fetch the user role

        // Redirect based on the role
        if (data.role === 'customer') {
          navigate('/customer-map');  // Redirect to customer map page
        } else if (data.role === 'seller') {
          navigate('/seller-dashboard');  // Redirect to seller dashboard
        } else {
          console.error('Unknown role:', data.role); // Handle unknown roles
        }
      } catch (err) {
        console.error('Error fetching user role:', err); // Error handling
      }
    };

    fetchUserRole();
  }, [navigate]); // Adding navigate to the dependencies

  return (
    <div>
      <h2>Loading your dashboard...</h2>
    </div>
  );
};

export default Dashboard;
