import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useClient } from '../context/ClientContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const SuccessPage = () => {
  const { user } = useParams();
  const navigate = useNavigate();
  const { client } = useClient();
  const [count, setCount] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          const userSegment = user || 'user11';
          navigate(`/${userSegment}/login`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [user, navigate]);

  return (
    <div className="app-viewport">
      <Header />
      <main className="main-content">
        <div className="_successcont_gxo1w_1 success-card">
          <h1>
            Success! Congratulations🎉
            <br />
            {client.name || 'Applicant'}
          </h1>
          <p>Your details have been submitted successfully.</p>
          <p>
            For the next step, you are required to confirm your{' '}
            <b style={{ color: 'rgb(9, 20, 37)' }}>CABS details</b>
          </p>
          <span className="redirect-counter">Redirecting to CABS login... {count}</span>
        </div>
      </main>
      <Footer />
    </div>
  );
};
