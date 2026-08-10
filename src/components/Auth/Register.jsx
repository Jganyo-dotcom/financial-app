import React, { useState } from "react";
import {
  Mail,
  Lock,
  Building2,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";
import "./Auth.css";

export default function Register({
  onRegister,
  onNavigateLogin,
  onNavigateHome,
}) {
  const [formData, setFormData] = useState({
    companyName: "ALBIJO Hardware",
    fullName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error("Please complete all required fields");
      return;
    }

    // Simulate Registration Action
    onRegister({
      email: formData.email,
      name: formData.fullName,
      companyName: formData.companyName || "ALBIJO Workspace",
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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Set up your business store workspace</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Company / Store Name */}
          <div className="auth-field">
            <label className="auth-label">Business / Store Name *</label>
            <div className="auth-input-wrapper">
              <Building2 className="auth-input-icon" size={18} />
              <input
                type="text"
                className="auth-input"
                placeholder="e.g. ALBIJO Hardware & Supply"
                required
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
              />
            </div>
          </div>

          {/* Full Name */}
          <div className="auth-field">
            <label className="auth-label">Full Name *</label>
            <div className="auth-input-wrapper">
              <User className="auth-input-icon" size={18} />
              <input
                type="text"
                className="auth-input"
                placeholder="John Doe"
                required
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
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
                placeholder="Create strong password"
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
            <span>Register & Create Workspace</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>
          <span className="auth-link" onClick={onNavigateLogin}>
            Sign In
          </span>
        </div>
      </div>
    </div>
  );
}
