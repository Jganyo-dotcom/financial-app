import React, { useState } from "react";
import {
  Mail,
  Lock,
  Building2,
  MapPin,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import "./Auth.css";
import { API_BASE_URL } from "../apiEnpoint";



export default function Register({
  onRegister,
  onNavigateLogin,
  onNavigateHome,
}) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: "",
    address: "",
    fullName: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validate Step 1 before proceeding
  const handleNextStep = (e) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      toast.error("Please enter your business/store name");
      return;
    }
    setStep(2);
  };

  // Submit Registration Payload to API
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName,
          address: formData.address,
          role: "Store Admin",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed. Please try again.",
        );
      }

      // Store JWT token if returned
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      toast.success("Workspace created successfully!");

      if (onRegister) {
        onRegister(data);
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
        <button
          className="auth-back-btn"
          onClick={step === 2 ? () => setStep(1) : onNavigateHome}
        >
          <ArrowLeft size={16} />{" "}
          {step === 2 ? "Back to Step 1" : "Back to Landing"}
        </button>

        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-brand" onClick={onNavigateHome}>
            <div className="auth-logo-badge">A</div>
            <span className="auth-brand-name">ALBIJO</span>
          </div>
          <h1 className="auth-title">
            {step === 1 ? "Setup Workspace" : "Admin Account"}
          </h1>
          <p className="auth-subtitle">
            {step === 1
              ? "Step 1 of 2: Business & store details"
              : "Step 2 of 2: Your administrator credentials"}
          </p>
        </div>

        {/* STEP 1: Business Details */}
        {step === 1 && (
          <form className="auth-form" onSubmit={handleNextStep}>
            {/* Store Name */}
            <div className="auth-field">
              <label className="auth-label">Business / Store Name *</label>
              <div className="auth-input-wrapper">
                <Building2 className="auth-input-icon" size={18} />
                <input
                  type="text"
                  className="auth-input"
                  placeholder="e.g. ALBIJO Hardware Mart"
                  required
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Business Address */}
            <div className="auth-field">
              <label className="auth-label">Store Location / Address</label>
              <div className="auth-input-wrapper">
                <MapPin className="auth-input-icon" size={18} />
                <input
                  type="text"
                  className="auth-input"
                  placeholder="e.g. 123 Main St, Accra"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn">
              <span>Continue to Admin Details</span>
              <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* STEP 2: Admin Details */}
        {step === 2 && (
          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="auth-field">
              <label className="auth-label">Full Name *</label>
              <div className="auth-input-wrapper">
                <User className="auth-input-icon" size={18} />
                <input
                  type="text"
                  className="auth-input"
                  placeholder="e.g. Elikem Shela"
                  required
                  disabled={loading}
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
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
                  placeholder="Create strong password"
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

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              <span>
                {loading ? "Creating Workspace..." : "Complete Registration"}
              </span>
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <CheckCircle2 size={18} />
              )}
            </button>
          </form>
        )}

        {/* Card Footer */}
        <div className="auth-footer">
          <span>Already have a workspace?</span>
          <span className="auth-link" onClick={onNavigateLogin}>
            Sign In
          </span>
        </div>
      </div>
    </div>
  );
}
