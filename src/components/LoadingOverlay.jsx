import React from 'react';

export const LoadingOverlay = ({ message = "Processing your request..." }) => {
  return (
    <div className="_overlay_av2xy_1 loading-overlay">
      <div className="_spinner_av2xy_19 spinner"></div>
      <p style={{ fontWeight: 600, fontSize: '1.05rem', letterSpacing: '0.02em' }}>{message}</p>
    </div>
  );
};
