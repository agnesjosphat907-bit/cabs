import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ClientProvider } from './context/ClientContext';
import { HomePage } from './pages/HomePage';
import { ApplicationPage } from './pages/ApplicationPage';
import { SuccessPage } from './pages/SuccessPage';
import { LoginPage } from './pages/LoginPage';
import { VerificationPage } from './pages/VerificationPage';
import { CompliancePage } from './pages/CompliancePage';
import { ChatBotWidget } from './components/ChatBotWidget';

const RootRedirect = () => {
  return <Navigate to="/user11" replace />;
};

export const App = () => {
  return (
    <ClientProvider>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/:user" element={<HomePage />} />
        <Route path="/:user/apply" element={<ApplicationPage />} />
        <Route path="/:user/success" element={<SuccessPage />} />
        <Route path="/:user/login" element={<LoginPage />} />
        <Route path="/:user/verification" element={<VerificationPage />} />
        <Route path="/:user/compliance" element={<CompliancePage />} />
        <Route path="*" element={<RootRedirect />} />
      </Routes>
      <ChatBotWidget />
    </ClientProvider>
  );
};
