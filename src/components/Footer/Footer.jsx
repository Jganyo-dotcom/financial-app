import React from "react";
import { Link } from "react-router-dom";
import { Mail, ShieldCheck, Globe } from "lucide-react";
import "./Footer.css";

// Import your brand logos
import logoDark from "../../assets/albijo-logo-dark.jpeg";
import logoLight from "../../assets/albijo-logo-light.jpeg";

// Native SVG brand icons to replace the missing Lucide ones
const Github = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://w3.org"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://w3.org"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Twitter = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://w3.org"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export default function Footer({ activeTheme = "light", customLogo }) {
  const currentYear = new Date().getFullYear();
  const activeBrandLogo = activeTheme === "dark" ? logoDark : logoLight;

  return (
    <footer className="albijo-footer">
      <div className="albijo-container">
        {/* TOP SECTION: BRAND & LINK COLUMNS */}
        <div className="albijo-footer-main">
          {/* BRAND COLUMN */}
          <div className="albijo-footer-brand-col">
            <div className="albijo-footer-logo-wrapper">
              {customLogo || activeBrandLogo ? (
                <img
                  src={customLogo || activeBrandLogo}
                  alt="ALBIJO Logo"
                  className="albijo-footer-logo-img"
                />
              ) : (
                <div className="albijo-footer-badge-fallback">
                  <span className="albijo-logo-badge">A</span>
                  <span className="albijo-brand-name">ALBIJO</span>
                </div>
              )}
            </div>

            <p className="albijo-footer-description">
              Multi-tenant retail management platform powering bulk stock
              operations, live profit calculations, and real-time financial
              reporting.
            </p>

            <div className="albijo-footer-socials">
              <a
                href="https://github.com/Jganyo-dotcom"
                aria-label="GitHub"
                className="albijo-social-link"
              >
                <Github size={18} />
              </a>
              <a
                href="#twitter"
                aria-label="Twitter"
                className="albijo-social-link"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://www.linkedin.com/in/james-ganyo-aa0593360?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                aria-label="LinkedIn"
                className="albijo-social-link"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="mailto:support@albijo.com"
                aria-label="Email"
                className="albijo-social-link"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="albijo-footer-col">
            <h4 className="albijo-footer-heading">Platform</h4>
            <ul className="albijo-footer-links">
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#whitelabel">White-Labeling</a>
              </li>
              <li>
                <a href="#reports">Statements</a>
              </li>
              <li>
                <a href="#about">About Us</a>
              </li>
            </ul>
          </div>

          {/* STAKEHOLDERS & LEGAL */}
          <div className="albijo-footer-col">
            <h4 className="albijo-footer-heading">Organization</h4>
            <ul className="albijo-footer-links">
              <li>
                <a href="#leadership">Leadership</a>
              </li>
              <li>
                <a href="#security">Data Isolation</a>
              </li>
              <li>
                <a href="#privacy">Privacy Policy</a>
              </li>
              <li>
                <a href="#terms">Terms of Service</a>
              </li>
            </ul>
          </div>

          {/* SYSTEM STATUS & METRICS */}
          <div className="albijo-footer-col">
            <h4 className="albijo-footer-heading">System Status</h4>
            <div className="albijo-status-pill">
              <span className="albijo-status-dot" />
              <span>Multi-Tenant Engine Online</span>
            </div>
            <p className="albijo-footer-subtext">
              Encrypted end-to-end POS & database isolation verified.
            </p>
          </div>
        </div>

        {/* BOTTOM SECTION: COPYRIGHT & METADATA */}
        <div className="albijo-footer-bottom">
          <p className="albijo-footer-copy">
            © {currentYear} <strong>ALBIJO</strong> Sales & Inventory Management
            Architecture. All rights reserved.
          </p>
          <div className="albijo-footer-meta">
            <span>
              <ShieldCheck size={14} /> Enterprise Grade
            </span>
            <span>
              <Globe size={14} /> Multi-Tenant v2.4
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
