import React from 'react';
import './UnderDevelopmentOverlay.css';

const UnderDevelopmentOverlay = ({ message = "Under Development" }) => {
  return (
    <div className="under-dev-overlay-wrapper">
      <div className="under-dev-badge">
        <span></span>
        {message}
      </div>
    </div>
  );
};

export default UnderDevelopmentOverlay;
