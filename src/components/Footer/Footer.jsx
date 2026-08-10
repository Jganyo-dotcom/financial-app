import React from "react";
import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="albijo-footer">
      <div className="albijo-container">
        <div className="albijo-footer-content">
          <div className="albijo-footer-brand">
            <div className="albijo-logo-badge">A</div>
            <span className="albijo-brand-name">ALBIJO</span>
          </div>
          <p className="albijo-footer-text">
            © {currentYear} ALBIJO Sales & Inventory Management Architecture.
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
