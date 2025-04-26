import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`/auth/verify-email?token=${token}`);
        const result = await response.json();
        
        if (response.ok) {
          alert('Email verified successfully! You can now login.');
          navigate('/login');
        } else {
          alert(result.error || 'Verification failed');
        }
      } catch (err) {
        alert('Verification failed. Please try again.');
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  return <div>Verifying your email...</div>;
};

export default EmailVerificationPage;