import React, { useState } from "react";
import {
  Mail,
  Lock,
  Building2,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";
import "./Auth.css";

export default function Login({ onLogin, onNavigateRegister, onNavigateHome }) {
  const [formData, setFormData] = useState({
    companyCode: "ALBIJO",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Simulate Login Action
    onLogin({
      email: formData.email,
      companyName: formData.companyCode || "ALBIJO Workspace",
      role: "Store Admin",
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button className="auth-back-btn" onClick={onNavigateHome}>
          <ArrowLeft size={16} /> Back to Landing
        </button>

        <div className="auth-header">
          <div className="auth-brand" onClick={onNavigateHome}>
            <div className="auth-logo-badge">A</div>
            <span className="auth-brand-name">ALBIJO</span>
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            Sign in to manage stock, sales & revenue
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Company / Tenant Code */}
          <div className="auth-field">
            <label className="auth-label">Company / Tenant Code</label>
            <div className="auth-input-wrapper">
              <Building2 className="auth-input-icon" size={18} />
              <input
                type="text"
                className="auth-input"
                placeholder="e.g. ALBIJO"
                value={formData.companyCode}
                onChange={(e) =>
                  setFormData({ ...formData, companyCode: e.target.value })
                }
              />
            </div>
          </div>

          {/* Email */}
          <div className="auth-field">
            <label className="auth-label">Email Address *</label>
            <div className="auth-input-wrapper">
              <Mail className="auth-input-icon" size={18} />
              <input
                type="email"
                className="auth-input"
                placeholder="owner@albijo.com"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label">Password *</label>
            <div className="auth-input-wrapper">
              <Lock className="auth-input-icon" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                className="auth-input"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn">
            <span>Sign In to Workspace</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          <span>Don't have a business workspace?</span>
          <span className="auth-link" onClick={onNavigateRegister}>
            Register Here
          </span>
        </div>
      </div>
    </div>
  );
}
