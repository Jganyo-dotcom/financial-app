import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../components/apiEnpoint";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 🔍 Automatically detect token from URL (e.g. /reset-password?token=xyz)
  const token = searchParams.get("token");

  // Input states
  const [email, setEmail] = useState("");
  const [companyref, setCompanyref] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Status feedback states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // 📧 STEP 1: Request Password Reset Link (Email + Company Ref)
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim() || !companyref.trim()) {
      setErrorMsg("Please enter both your Email and Company Reference ID.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          companyref: companyref.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process request.");
      }

      setSuccessMsg(
        data.message ||
          "A reset link has been dispatched to your email address.",
      );
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔒 STEP 2: Save New Password using Token
  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify and try again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setSuccessMsg("Password reset successfully! Redirecting to login...");

      // Automatically send user back to login after short delay
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8fafc",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "2rem",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e2e8f0",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              color: "#0f172a",
              margin: "0 0 0.5rem",
            }}
          >
            {token ? "Set New Password 🔑" : "Forgot Password? 🔑"}
          </h2>
          <p style={{ fontSize: "0.875rem", color: "#64748b", margin: 0 }}>
            {token
              ? "Create a secure new password for your account."
              : "Enter your account details to receive a reset link."}
          </p>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div
            style={{
              padding: "0.75rem 1rem",
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              borderRadius: "6px",
              fontSize: "0.85rem",
              marginBottom: "1.25rem",
              borderLeft: "4px solid #dc2626",
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              padding: "0.75rem 1rem",
              backgroundColor: "#dcfce7",
              color: "#166534",
              borderRadius: "6px",
              fontSize: "0.85rem",
              marginBottom: "1.25rem",
              borderLeft: "4px solid #16a34a",
            }}
          >
            ✅ {successMsg}
          </div>
        )}

        {/* FORM 1: REQUEST LINK (No Token Present) */}
        {!token ? (
          <form onSubmit={handleRequestReset}>
            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="companyref"
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "0.35rem",
                }}
              >
                Company Reference <span style={{ color: "#e11d48" }}>*</span>
              </label>
              <input
                id="companyref"
                type="text"
                placeholder="e.g. CO-john-4921"
                value={companyref}
                onChange={(e) => setCompanyref(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "0.35rem",
                }}
              >
                Email Address <span style={{ color: "#e11d48" }}>*</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: loading ? "#94a3b8" : "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s ease",
              }}
            >
              {loading ? "Sending Reset Link..." : "Send Reset Link"}
            </button>
          </form>
        ) : (
          /* FORM 2: UPDATE PASSWORD (Token Present in URL) */
          <form onSubmit={handleSetNewPassword}>
            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="newPassword"
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "0.35rem",
                }}
              >
                New Password <span style={{ color: "#e11d48" }}>*</span>
              </label>
              <input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                htmlFor="confirmPassword"
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "0.35rem",
                }}
              >
                Confirm New Password <span style={{ color: "#e11d48" }}>*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: loading ? "#94a3b8" : "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s ease",
              }}
            >
              {loading ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        )}

        {/* Footer Navigation Link */}
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link
            to="/login"
            style={{
              fontSize: "0.85rem",
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
