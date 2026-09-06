import React, { useState, useRef } from "react";
import {
  Mail,
  Lock,
  Building2,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  KeyRound,
  RotateCcw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import "./Auth.css";
import { API_BASE_URL } from "../apiEnpoint";

export default function Login({
  onLogin,
  onNavigateRegister,
  onNavigateHome,
  onNavigateForgotPassword,
}) {
  const currentHour = new Date().getHours();
  let timeGreeting;

  if (currentHour < 12) {
    timeGreeting = "Good Morning JOJO";
  } else if (currentHour < 17) {
    timeGreeting = "Good Afternoon JOJO";
  } else {
    timeGreeting = "Good Evening JOJO";
  }
  const savedCompany = localStorage.getItem("company");
  const parsedCompany = savedCompany ? JSON.parse(savedCompany) : null;

  const [formData, setFormData] = useState({
    companyReference:
      parsedCompany?.reference || parsedCompany?.Reference || "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 2FA / OTP States
  const [step, setStep] = useState("LOGIN"); // "LOGIN" | "OTP"
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  // Handle standard login
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

      // Check if backend requires 2FA OTP verification
      if (data.requiresOtp) {
        toast.success(data.message || "OTP code sent to your email!");
        setStep("OTP");
        setLoading(false);
        return;
      }

      // Standard Login Direct Flow
      completeLoginSession(data);
    } catch (error) {
      toast.error(
        error.message || "Server connection error. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper to persist session and proceed
  const completeLoginSession = (data) => {
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
  };

  // Handle OTP digit changes
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-advance to next input field
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle keypress backspace navigation in OTP fields
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle pasting full 6-digit code
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();

    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split("");
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  // Submit OTP verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP code");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otpCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid OTP code. Please try again.");
      }

      completeLoginSession(data);
    } catch (error) {
      toast.error(error.message || "Failed to verify OTP code.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP trigger
  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          companyReference: formData.companyReference,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend OTP code.");
      }

      toast.success("A new OTP code has been sent to your email!");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error) {
      toast.error(error.message || "Could not resend OTP code.");
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
          onClick={step === "OTP" ? () => setStep("LOGIN") : onNavigateHome}
        >
          <ArrowLeft size={16} />{" "}
          {step === "OTP" ? "Back to Login" : "Back to Landing"}
        </button>

        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-brand" onClick={onNavigateHome}>
            <div className="auth-logo-badge">A</div>
            <span className="auth-brand-name">ALBIJO</span>
          </div>
          <h1 className="auth-title">
            {step === "OTP" ? "We didnt recognise you" : timeGreeting}
          </h1>
          <p className="auth-subtitle">
            {step === "OTP"
              ? `We sent a 6-digit code to ${formData.email}`
              : "Sign in to manage stock, sales & revenue"}
          </p>
        </div>

        {step === "LOGIN" ? (
          /* STANDARD LOGIN FORM */
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
                    setFormData({
                      ...formData,
                      companyReference: e.target.value,
                    })
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

            {/* Forgot Password Link */}
            <div
              className="auth-forgot-row"
              style={{ textAlign: "right", marginTop: "-6px" }}
            >
              <span
                className="auth-link"
                onClick={onNavigateForgotPassword}
                style={{ fontSize: "0.85rem", cursor: "pointer" }}
              >
                Forgot Password?
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
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
        ) : (
          /* OTP VERIFICATION VIEW */
          <form className="auth-form" onSubmit={handleVerifyOtp}>
            <div className="auth-field">
              <label className="auth-label">
                Enter 6-Digit Verification Code *
              </label>

              {/* 6 Individual Digit Slots */}
              <div
                className="otp-inputs-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: "8px",
                  marginTop: "8px",
                }}
              >
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    disabled={loading}
                    style={{
                      width: "100%",
                      height: "48px",
                      textAlign: "center",
                      fontSize: "1.25rem",
                      fontWeight: "700",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color, #cbd5e1)",
                      outline: "none",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Submit OTP */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <KeyRound size={18} />
                  <span>Verify Code & Continue</span>
                </>
              )}
            </button>

            {/* Resend OTP Row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "12px",
                fontSize: "0.85rem",
              }}
            >
              <span style={{ color: "#64748b" }}>Didn't get a code?</span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                style={{
                  background: "none",
                  border: "none",
                  color: "#4f46e5",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <RotateCcw size={14} /> Resend OTP
              </button>
            </div>
          </form>
        )}

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
