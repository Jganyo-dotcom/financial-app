import React, { useState } from "react";
import {
  Mail,
  Lock,
  Building2,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import "./Auth.css";
import { API_BASE_URL } from "../apiEnpoint";

export default function Login({ onLogin, onNavigateRegister, onNavigateHome }) {
  const [formData, setFormData] = useState({
    companyReference: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.companyReference || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyReference: formData.companyReference,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials or login failed");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      if (data.company) {
        localStorage.setItem("company", JSON.stringify(data.company));
      }

      toast.success(data.message || "Welcome back!");

      if (onLogin) {
        onLogin(data);
      }
    } catch (error) {
      toast.error(
        error.message || "Server connection error. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Navigation Button */}
        <button className="auth-back-btn" onClick={onNavigateHome}>
          <ArrowLeft size={16} /> Back to Landing
        </button>

        {/* Brand Header */}
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
          {/* Company Reference Code */}
          <div className="auth-field">
            <label className="auth-label">Company Reference Code *</label>
            <div className="auth-input-wrapper">
              <Building2 className="auth-input-icon" size={18} />
              <input
                type="text"
                className="auth-input"
                placeholder="e.g. ES-4829"
                required
                disabled={loading}
                value={formData.companyReference}
                onChange={(e) =>
                  setFormData({ ...formData, companyReference: e.target.value })
                }
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="auth-field">
            <label className="auth-label">Email Address *</label>
            <div className="auth-input-wrapper">
              <Mail className="auth-input-icon" size={18} />
              <input
                type="email"
                className="auth-input"
                placeholder="owner@albijo.com"
                required
                disabled={loading}
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
                disabled={loading}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Card Footer */}
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
