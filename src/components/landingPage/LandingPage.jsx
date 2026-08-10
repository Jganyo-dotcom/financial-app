import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  TrendingUp,
  FileText,
  Bell,
  Sun,
  Moon,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Upload,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Footer from "../Footer/Footer";
import "./LandingPage.css";

export default function LandingPage({ onLaunchApp, onLoginClick }) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");
  const [customLogo, setCustomLogo] = useState(null);

  // Fallback handler if props aren't explicitly passed
  const handleLaunch = () => {
    if (onLaunchApp) {
      onLaunchApp();
    } else {
      navigate("/dashboard");
    }
  };

  const handleLogin = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      navigate("/login");
    }
  };

  // Sync data-theme attribute with state for CSS variable switching
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCustomLogo(URL.createObjectURL(file));
      toast.success(`Custom brand logo uploaded!`, {
        icon: "🎨",
      });
    }
  };

  return (
    <div className="albijo-landing">
      {/* --- HEADER --- */}
      <header className="albijo-header">
        <div className="albijo-container">
          <nav className="albijo-nav-wrapper">
            <div className="albijo-brand" onClick={() => navigate("/")}>
              {customLogo ? (
                <img
                  src={customLogo}
                  alt="Client Brand Logo"
                  className="albijo-custom-logo"
                />
              ) : (
                <>
                  <div className="albijo-logo-badge">A</div>
                  <span className="albijo-brand-name">ALBIJO</span>
                </>
              )}
            </div>

            <ul className="albijo-nav-links">
              <li>
                <a href="#features" className="albijo-nav-link">
                  Features
                </a>
              </li>
              <li>
                <a href="#whitelabel" className="albijo-nav-link">
                  White-Labeling
                </a>
              </li>
              <li>
                <a href="#reports" className="albijo-nav-link">
                  Statements
                </a>
              </li>
            </ul>

            <div className="albijo-nav-actions">
              <button
                onClick={toggleTheme}
                className="albijo-theme-btn"
                aria-label="Toggle dark/light mode"
                title="Toggle Theme"
              >
                {theme === "dark" ? (
                  <Sun size={20} color="#fbbf24" />
                ) : (
                  <Moon size={20} color="#64748b" />
                )}
              </button>

              <button
                onClick={handleLogin}
                className="albijo-btn-primary"
                style={{ marginRight: "0.5rem" }}
              >
                Sign In
              </button>

              <button onClick={handleLaunch} className="albijo-btn-primary">
                <span>Launch App</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main>
        {/* HERO SECTION */}
        <section className="albijo-hero">
          <div className="albijo-container">
            <span className="albijo-badge">Inventory & Sales System</span>

            <h1 className="albijo-hero-title">
              Complete Retail Control, Bulk Profits & Live Statements for{" "}
              <span>ALBIJO</span>
            </h1>

            <p className="albijo-hero-subtitle">
              Input bulk stock, calculate profit margins per unit automatically,
              log customer sales instantly, and generate on-demand financial
              statements.
            </p>

            <div className="albijo-hero-cta">
              <button
                onClick={handleLaunch}
                className="albijo-btn-primary albijo-btn-primary-lg"
              >
                Enter App Dashboard
              </button>

              <label className="albijo-btn-outline">
                <Upload size={18} />
                <span>Upload Client Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="albijo-hidden-input"
                />
              </label>
            </div>

            {/* DASHBOARD PREVIEW CARD */}
            <div className="albijo-dashboard-preview">
              <div className="albijo-stats-row">
                <div className="albijo-stat-card indigo">
                  <div className="albijo-stat-label">Total Revenue Today</div>
                  <div className="albijo-stat-value">$14,280.00</div>
                </div>
                <div className="albijo-stat-card emerald">
                  <div className="albijo-stat-label">Calculated Net Profit</div>
                  <div className="albijo-stat-value">$4,110.50</div>
                </div>
                <div className="albijo-stat-card amber">
                  <div className="albijo-stat-label">Low Stock Warning</div>
                  <div className="albijo-stat-value">3 Items Low</div>
                </div>
              </div>

              <div className="albijo-preview-footer">
                <span>✓ Isolated Multi-Tenant Workspace</span>
                <span>✓ Automatic Margin Calculations</span>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="albijo-features-section">
          <div className="albijo-container">
            <div className="albijo-section-header">
              <h2 className="albijo-section-title">
                Built for Real Business Workflows
              </h2>
              <p className="albijo-section-subtitle">
                Everything you need to manage items, record sales, and check
                profitability in real time.
              </p>
            </div>

            <div className="albijo-features-grid">
              <FeatureCard
                icon={<Package size={32} color="#4f46e5" />}
                title="Bulk Stock Entry"
                description="Record bulk purchases with item costs, total unit counts, and automatically calculate profit margins per unit."
              />
              <FeatureCard
                icon={<TrendingUp size={32} color="#059669" />}
                title="Point-of-Sale Log"
                description="Easily register customer purchases. Updates backend stock levels and daily revenue instantly."
              />
              <FeatureCard
                icon={<FileText size={32} color="#2563eb" />}
                title="Financial Statements"
                description="One-click generation of revenue and sales statements right up to the current minute."
              />
              <FeatureCard
                icon={<Bell size={32} color="#d97706" />}
                title="Low Stock Alerts"
                description="Automated system notifications and email alerts triggered as soon as stock levels drop."
              />
            </div>
          </div>
        </section>

        {/* WHITE LABEL SECTION */}
        <section id="whitelabel" className="albijo-whitelabel-section">
          <div className="albijo-container">
            <div className="albijo-whitelabel-flex">
              <div className="albijo-whitelabel-content">
                <span className="albijo-badge">Multi-Tenant Platform</span>
                <h2
                  className="albijo-section-title"
                  style={{ textAlign: "left" }}
                >
                  White-Labeled Custom Branding
                </h2>
                <p
                  className="albijo-section-subtitle"
                  style={{ textAlign: "left", marginBottom: "1.5rem" }}
                >
                  Each tenant receives a customized client experience. Your
                  customer will see their brand name, logo, and theme preference
                  while benefiting from our unified multi-tenant architecture.
                </p>

                <ul className="albijo-list">
                  <li className="albijo-list-item">
                    <CheckCircle className="albijo-check-icon" size={20} />
                    <span>Upload brand logos directly into the header</span>
                  </li>
                  <li className="albijo-list-item">
                    <CheckCircle className="albijo-check-icon" size={20} />
                    <span>Independent database records per client</span>
                  </li>
                  <li className="albijo-list-item">
                    <CheckCircle className="albijo-check-icon" size={20} />
                    <span>Dark & Light theme preference persistence</span>
                  </li>
                </ul>
              </div>

              <div className="albijo-whitelabel-card">
                <BarChart3
                  size={48}
                  color="#4f46e5"
                  style={{ margin: "0 auto 1rem" }}
                />
                <h3 className="albijo-feature-title">
                  Ready to build the dashboard?
                </h3>
                <p
                  className="albijo-feature-desc"
                  style={{ marginBottom: "1.5rem" }}
                >
                  Proceed to the main interface with collapsible sidebar
                  navigation and stock calculation tables.
                </p>
                <button
                  onClick={handleLaunch}
                  className="albijo-btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Open Dashboard Workspace
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* --- SEPARATE FOOTER COMPONENT --- */}
      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <article className="albijo-feature-card">
      <div className="albijo-feature-icon">{icon}</div>
      <h3 className="albijo-feature-title">{title}</h3>
      <p className="albijo-feature-desc">{description}</p>
    </article>
  );
}
