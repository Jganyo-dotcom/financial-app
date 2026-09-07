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
  Mail,
  X,
  Building2,
  Target,
  Award,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Footer from "../Footer/Footer";
import StakeholderCard from "../StakeholderCard";

import "./LandingPage.css";

// Import your brand logos
import logoDark from "../../assets/albijo-logo-dark.jpeg";
import logoLight from "../../assets/albijo-logo-light.jpeg";

export default function LandingPage({ onLaunchApp, onLoginClick }) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");
  const [customLogo, setCustomLogo] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  const stakeholders = [
    {
      id: "ceo",
      name: "Leadership / CEO",
      role: "Chief Executive Officer",
      image: null,
      snippet:
        "Driving innovation, retail inventory strategies, and multi-tenant vision for enterprise growth.",
      bio: "With over a decade of leadership in retail supply chain management and backend API architectures, our CEO has spearheaded ALBIJO into a top-tier multi-tenant platform. Passionate about empowering business owners through real-time financial tracking and automated inventory logic.",
    },
    {
      id: "cto",
      name: "Engineering Lead",
      role: "Head of Technology",
      image: null,
      snippet:
        "Architecting resilient cloud databases, POS integrations, and real-time calculation engines.",
      bio: "Overseeing all database infrastructure, data isolation protocols, and frontend performance optimizations. Dedicated to building reliable, high-speed retail systems.",
    },
  ];

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

  const activeBrandLogo = theme === "dark" ? logoDark : logoLight;

  return (
    <div className="albijo-landing">
      {/* HEADER */}
      <header className="albijo-header">
        <div className="albijo-container">
          <nav className="albijo-nav-wrapper">
            <div className="albijo-brand" onClick={() => navigate("/")}>
              <img
                src={customLogo || activeBrandLogo}
                alt="ALBIJO Logo"
                className="albijo-brand-logo"
              />
            </div>

            <ul className="albijo-nav-links">
              <li>
                <a
                  href="#about"
                  className="albijo-nav-link albijo-dark-heading"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="albijo-nav-link albijo-dark-heading"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#whitelabel"
                  className="albijo-nav-link albijo-dark-heading"
                >
                  White-Labeling
                </a>
              </li>
              <li>
                <a
                  href="#leadership"
                  className="albijo-nav-link albijo-dark-heading"
                >
                  Leadership
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
                  <Sun size={20} className="icon-amber" />
                ) : (
                  <Moon size={20} className="icon-indigo" />
                )}
              </button>

              <button
                onClick={handleLogin}
                className="albijo-btn-primary"
                style={{ marginRight: "0.5rem" }}
              >
                Sign In
              </button>

              {/* <button onClick={handleLaunch} className="albijo-btn-primary">
                <span></span>
                <ArrowRight size={16} />
              </button> */}
            </div>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main>
        {/* HERO SECTION */}
        <section className="albijo-hero">
          <div className="albijo-container">
            <span className="albijo-badge">Inventory & Sales System</span>

            <h1 className="albijo-hero-title albijo-dark-heading">
              Complete Retail Control, Bulk Profits & Live Statements for{" "}
              <span>ALBIJO</span>
            </h1>

            <p className="albijo-hero-subtitle albijo-dark-body">
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
                <Mail size={18} />
                <span className="albijo-dark-heading">Contact Us</span>
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
                  <div className="albijo-stat-label albijo-dark-muted">
                    Total Revenue Today
                  </div>
                  <div className="albijo-stat-value albijo-dark-heading">
                    $14,280.00
                  </div>
                </div>
                <div className="albijo-stat-card emerald">
                  <div className="albijo-stat-label albijo-dark-muted">
                    Calculated Net Profit
                  </div>
                  <div className="albijo-stat-value albijo-dark-heading">
                    $4,110.50
                  </div>
                </div>
                <div className="albijo-stat-card amber">
                  <div className="albijo-stat-label albijo-dark-muted">
                    Low Stock Warning
                  </div>
                  <div className="albijo-stat-value albijo-dark-heading">
                    3 Items Low
                  </div>
                </div>
              </div>

              <div className="albijo-preview-footer">
                <span>✓ Isolated Multi-Tenant Workspace</span>
                <span>✓ Automatic Margin Calculations</span>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT US SECTION */}
        <section id="about" className="albijo-about-section">
          <div className="albijo-container">
            <div className="albijo-section-header">
              <span className="albijo-badge">Who We Are</span>
              <h2 className="albijo-section-title albijo-dark-heading">
                Empowering Businesses through Smart Automation
              </h2>
              <p className="albijo-section-subtitle albijo-dark-body">
                ALBIJO delivers end-to-end management solutions designed to
                streamline retail operations, track inventory accuracy, and
                maximizes revenue transparency.
              </p>
            </div>

            <div className="albijo-about-grid">
              <div className="albijo-about-card">
                <Building2 size={36} className="icon-indigo" />
                <h3 className="albijo-dark-heading">Enterprise Quality</h3>
                <p className="albijo-dark-body">
                  Built with rock-solid database isolation ensuring secure,
                  real-time data handling for every tenant organization.
                </p>
              </div>

              <div className="albijo-about-card">
                <Target size={36} className="icon-emerald" />
                <h3 className="albijo-dark-heading">Margin Optimization</h3>
                <p className="albijo-dark-body">
                  Eliminate manual calculations. Instantly compute profit per
                  unit upon bulk entry and track margins live.
                </p>
              </div>

              <div className="albijo-about-card">
                <Award size={36} className="icon-amber" />
                <h3 className="albijo-dark-heading">White-Label Flexibility</h3>
                <p className="albijo-dark-body">
                  Tailor themes, logos, and dashboard brand identity cleanly for
                  your organization or clients.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="albijo-features-section">
          <div className="albijo-container">
            <div className="albijo-section-header">
              <h2 className="albijo-section-title albijo-dark-heading">
                Built for Real Business Workflows
              </h2>
              <p className="albijo-section-subtitle albijo-dark-body">
                Everything you need to manage items, record sales, and check
                profitability in real time.
              </p>
            </div>

            <div className="albijo-features-grid">
              <FeatureCard
                icon={<Package size={32} className="icon-indigo" />}
                title="Bulk Stock Entry"
                description="Record bulk purchases with item costs, total unit counts, and automatically calculate profit margins per unit."
              />
              <FeatureCard
                icon={<TrendingUp size={32} className="icon-emerald" />}
                title="Point-of-Sale Log"
                description="Easily register customer purchases. Updates backend stock levels and daily revenue instantly."
              />
              <FeatureCard
                icon={<FileText size={32} className="icon-blue" />}
                title="Financial Statements"
                description="One-click generation of revenue and sales statements right up to the current minute."
              />
              <FeatureCard
                icon={<Bell size={32} className="icon-amber" />}
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
                  className="albijo-section-title albijo-dark-heading"
                  style={{ textAlign: "left" }}
                >
                  White-Labeled Custom Branding
                </h2>
                <p
                  className="albijo-section-subtitle albijo-dark-body"
                  style={{ textAlign: "left", marginBottom: "1.5rem" }}
                >
                  Each tenant receives a customized client experience. Your
                  customer will see their brand name, logo, and theme preference
                  while benefiting from our unified multi-tenant architecture.
                </p>

                <ul className="albijo-list">
                  <li className="albijo-list-item">
                    <CheckCircle className="albijo-check-icon" size={20} />
                    <span className="albijo-dark-heading">
                      Upload brand logos directly into the header
                    </span>
                  </li>
                  <li className="albijo-list-item">
                    <CheckCircle className="albijo-check-icon" size={20} />
                    <span className="albijo-dark-heading">
                      Independent database records per client
                    </span>
                  </li>
                  <li className="albijo-list-item">
                    <CheckCircle className="albijo-check-icon" size={20} />
                    <span className="albijo-dark-heading">
                      Dark & Light theme preference persistence
                    </span>
                  </li>
                </ul>
              </div>

              <div className="albijo-whitelabel-card">
                <BarChart3
                  size={48}
                  className="icon-indigo"
                  style={{ margin: "0 auto 1rem", display: "block" }}
                />
                <h3 className="albijo-feature-title albijo-dark-heading">
                  Ready to build the dashboard?
                </h3>
                <p
                  className="albijo-feature-desc albijo-dark-body"
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

        {/* LEADERSHIP & STAKEHOLDERS SECTION */}
        <section id="leadership" className="albijo-stakeholders-section">
          <div className="albijo-container">
            <div className="albijo-section-header">
              <span className="albijo-badge">Leadership & Vision</span>
              <h2 className="albijo-section-title albijo-dark-heading">
                Meet Our Stakeholders
              </h2>
              <p className="albijo-section-subtitle albijo-dark-body">
                Click on any profile card to view detailed notes, backgrounds,
                and vision statements.
              </p>
            </div>

            <div className="albijo-stakeholders-grid">
              {stakeholders.map((member) => (
                <StakeholderCard
                  key={member.id}
                  member={member}
                  onClick={(m) => setSelectedMember(m)}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* POPUP MODAL */}
      {selectedMember && (
        <div
          className="albijo-modal-backdrop"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="albijo-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="albijo-modal-close"
              onClick={() => setSelectedMember(null)}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="albijo-modal-body">
              <div className="albijo-modal-img-container">
                {selectedMember.image ? (
                  <img
                    src={selectedMember.image}
                    alt={selectedMember.name}
                    className="albijo-modal-img"
                  />
                ) : (
                  <div className="albijo-modal-placeholder">
                    <Building2 size={64} className="albijo-placeholder-icon" />
                  </div>
                )}
              </div>

              <div className="albijo-modal-details">
                <span className="albijo-badge">{selectedMember.role}</span>
                <h3 className="albijo-modal-title albijo-dark-heading">
                  {selectedMember.name}
                </h3>
                <div className="albijo-modal-divider" />
                <p className="albijo-modal-bio albijo-dark-body">
                  {selectedMember.bio}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <article className="albijo-feature-card">
      <div className="albijo-feature-icon">{icon}</div>
      <h3 className="albijo-feature-title albijo-dark-heading">{title}</h3>
      <p className="albijo-feature-desc albijo-dark-body">{description}</p>
    </article>
  );
}
