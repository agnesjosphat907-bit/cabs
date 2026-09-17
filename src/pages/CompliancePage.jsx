import React from 'react';
import { useClient } from '../context/ClientContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CheckCircle2, MessageSquare, ShieldCheck, Download } from 'lucide-react';

export const CompliancePage = () => {
  const { client } = useClient();

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(val || 0);
  };

  const getApr = (months) => {
    if (months <= 6) return 4.0;
    if (months <= 12) return 4.5;
    if (months <= 24) return 5.5;
    if (months <= 36) return 6.5;
    return 8.5;
  };

  const calcMonthly = (amt, months) => {
    const rate = getApr(months) / 100 / 12;
    const num = amt * rate * Math.pow(1 + rate, months);
    const den = Math.pow(1 + rate, months) - 1;
    if (den === 0 || !isFinite(num) || !isFinite(den)) return 0;
    const res = num / den;
    return isFinite(res) ? res : 0;
  };

  const monthlyPayment = calcMonthly(client.loan || 500, client.repaymentTerm || 12);

  return (
    <div className="app-viewport">
      <Header />
      <main className="main-content">
        <div className="compliance-container">
          <div className="approval-badge">
            <CheckCircle2 size={20} color="#059669" />
            <span>Application Verified & In Disbursal Pipeline</span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
            Compliance & Disbursal Status
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.4rem' }}>
            Reference Code: <strong style={{ color: 'var(--accent-blue)' }}>{client.refId}</strong>
          </p>

          <div className="summary-card">
            <div className="summary-row">
              <span className="summary-label">Applicant Name</span>
              <span className="summary-value">{client.name || 'CABS Customer'}</span>
            </div>

            <div className="summary-row">
              <span className="summary-label">EcoCash / Phone Number</span>
              <span className="summary-value">{client.number || 'N/A'}</span>
            </div>

            <div className="summary-row">
              <span className="summary-label">National ID</span>
              <span className="summary-value">{client.id || 'N/A'}</span>
            </div>

            <div className="summary-row">
              <span className="summary-label">Approved Loan Amount</span>
              <span className="summary-value" style={{ color: 'var(--accent-blue)', fontSize: '1.1rem' }}>
                {formatCurrency(client.loan)}
              </span>
            </div>

            <div className="summary-row">
              <span className="summary-label">Repayment Tenure</span>
              <span className="summary-value">{client.repaymentTerm || 12} Months</span>
            </div>

            <div className="summary-row">
              <span className="summary-label">Monthly Repayment</span>
              <span className="summary-value">{formatCurrency(monthlyPayment)} / month</span>
            </div>

            <div className="summary-row">
              <span className="summary-label">Disbursement Channel</span>
              <span className="summary-value">EcoCash Wallet / CABS Account</span>
            </div>

            <div className="summary-row">
              <span className="summary-label">Security & Verification</span>
              <span className="summary-value" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ShieldCheck size={16} /> Verified via PIN & OTP
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', marginTop: '1.5rem' }}>
            <a
              href="https://wa.me/?text=Hello%20CABS%20Support,%20I%20have%20completed%20my%20loan%20application%20verification."
              target="_blank"
              rel="noopener noreferrer"
              className="btnContinue"
              style={{ textDecoration: 'none', background: '#25D366' }}
            >
              <MessageSquare size={20} /> Contact CABS WhatsApp Support
            </a>

            <button
              onClick={() => alert(`Receipt downloaded for Reference: ${client.refId}`)}
              className="term-button"
              style={{ padding: '0.9rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Download size={18} /> Download Application Summary PDF
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
