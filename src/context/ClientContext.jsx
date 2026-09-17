import React, { createContext, useContext, useState } from 'react';

const ClientContext = createContext();

export const ClientProvider = ({ children }) => {
  const [client, setClient] = useState({
    name: '',
    number: '',
    dob: '',
    id: '',
    loan: 500,
    income: '',
    employment: 'employed',
    repaymentTerm: 12,
    pin: '',
    otp: '',
    status: 'draft',
    refId: `CABS-LN-${Math.floor(100000 + Math.random() * 900000)}`
  });

  const updateClient = (fields) => {
    setClient((prev) => ({ ...prev, ...fields }));
  };

  return (
    <ClientContext.Provider value={{ client, updateClient, setClient }}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClient = () => useContext(ClientContext);
