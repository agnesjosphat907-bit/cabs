import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useClient } from '../context/ClientContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const HomePage = () => {
  const { user } = useParams();
  const navigate = useNavigate();
  const { client, updateClient } = useClient();

  const [amount, setAmount] = useState(client.loan || 500);
  const [term, setTerm] = useState(client.repaymentTerm || 12);
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  // Dynamic Interest Rate APR Calculation
  const getApr = (months) => {
    if (months <= 6) return 4.0;
    if (months <= 12) return 4.5;
    if (months <= 24) return 5.5;
    if (months <= 36) return 6.5;
    return 8.5;
  };

  const calculateRepayment = (amt, months) => {
    const rate = getApr(months) / 100 / 12;
    const num = amt * rate * Math.pow(1 + rate, months);
    const den = Math.pow(1 + rate, months) - 1;
    if (den === 0 || !isFinite(num) || !isFinite(den)) return 0;
    const res = num / den;
    return isFinite(res) ? res : 0;
  };

  useEffect(() => {
    const payment = calculateRepayment(amount, term);
    setMonthlyPayment(payment);
  }, []);

  const memoizedPayment = useMemo(() => calculateRepayment(amount, term), [amount, term]);

  useEffect(() => {
    if (Math.abs(memoizedPayment - monthlyPayment) > 0.01) {
      setMonthlyPayment(memoizedPayment);
    }
  }, [memoizedPayment, monthlyPayment]);

  const handleAmountChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 100 && val <= 50000) {
      setAmount(val);
      const p = calculateRepayment(val, term);
      setMonthlyPayment(p);
    }
  };

  const handleTermChange = (selectedTerm) => {
    setTerm(selectedTerm);
    const p = calculateRepayment(amount, selectedTerm);
    setMonthlyPayment(p);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatMonthly = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(val);
  };

  const handleApplyClick = () => {
    updateClient({ loan: amount, repaymentTerm: term });
    const userSegment = user || 'user11';
    navigate(`/${userSegment}/apply`);
  };

  return (
    <div className="app-viewport">
      <Header />
      <main className="main-content">
        <div className="loan-calculator-container">
          <div className="calculator-header">
            <h1>
              Get Your Loan Approved <span className="fast-text">Fast</span>
            </h1>
            <p className="subtitle">Quick approval • Competitive rates • Flexible terms</p>
          </div>

          <div className="calculator-content">
            <div className="calculator-section">
              <h2 className="section-title">Loan Calculator</h2>

              <div className="calculator-control">
                <label className="control-label">Loan Amount</label>
                <div className="amount-display">{formatCurrency(amount)}</div>
                <div className="slider-container">
                  <input
                    type="range"
                    min="500"
                    max="50000"
                    step="100"
                    value={amount}
                    onChange={handleAmountChange}
                    className="amount-slider"
                  />
                  <div className="slider-labels">
                    <span>USD 500</span>
                    <span>USD 50,000</span>
                  </div>
                </div>
              </div>

              <div className="calculator-control">
                <label className="control-label">Loan Term</label>
                <div className="term-display">{term} months</div>
                <div className="term-buttons">
                  {[6, 12, 24, 36, 48, 60].map((t) => (
                    <button
                      key={t}
                      className={`term-button ${term === t ? 'active' : ''}`}
                      onClick={() => handleTermChange(t)}
                    >
                      {t} months
                    </button>
                  ))}
                </div>
              </div>

              <div className="payment-display">
                <div className="payment-label">Monthly Payment</div>
                <div className="payment-amount">{formatMonthly(monthlyPayment)}</div>
                <div className="interest-rate">Interest rate: {getApr(term).toFixed(1)}% APR</div>
              </div>

              <button className="apply-button" onClick={handleApplyClick}>
                APPLY NOW
              </button>
            </div>

            <div className="features-section">
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <div className="feature-content">
                  <h3 className="feature-title">Fast Approval</h3>
                  <p className="feature-desc">Within 24 hours</p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">💰</div>
                <div className="feature-content">
                  <h3 className="feature-title">Low Rates</h3>
                  <p className="feature-desc">From 8%</p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <div className="feature-content">
                  <h3 className="feature-title">Secure</h3>
                  <p className="feature-desc">Bank-level security</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
