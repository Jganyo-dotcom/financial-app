import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
// Added Loader2 and ShieldCheck for the verification UI anchor
import { Loader2, ShieldCheck } from "lucide-react";

import LandingPage from "./components/landingPage/LandingPage";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import DashboardLayout from "./components/Dashboard/DashboardLayout";
import DashboardOverview from "./pages/DashboardOverview";
import BulkInventory from "./pages/BulkInventory";
import CustomerEntry from "./pages/CustomerEntry";
import FinancialOverview from "./pages/FinancialOverview";
import SalesRegisterLedger from "./pages/SalesRegisterLedger";
import InventoryExpenseManager from "./pages/InventoryExpenseManager";
import { API_BASE_URL } from "./components/apiEnpoint";
import ResetPassword from "./pages/ResetPassword";

function AppRoutes() {
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyUserSession = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        // Removed the annoying toast error on initial website load
        setIsAuthenticated(false);
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setIsAuthenticated(true);
        } else {
          handleSessionExpired();
        }
      } catch (error) {
        handleSessionExpired();
      } finally {
        setIsVerifying(false);
      }
    };

    verifyUserSession();
  }, []);

  const handleSessionExpired = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("company");
    setIsAuthenticated(false);
    toast.error("Session expired. Please log in again.");
  };

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    toast.success(`Welcome back to ${userData.user?.name || "Boss"}!`);
    navigate("/dashboard");
  };

  const handleRegister = (userData) => {
    setIsAuthenticated(true);
    toast.success(
      `Workspace created for ${userData.company?.name || "ALBIJO"}!`,
    );
    navigate("/dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("company");

    setIsAuthenticated(false);
    toast("Logged out of ALBIJO", { icon: "👋" });
    navigate("/login");
  };

  const handleLaunchApp = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      toast.error("Please log in to access the workspace.");
      navigate("/login");
    }
  };

  // ==========================================
  // BEAUTIFUL VERIFICATION LOADING STATE
  // ==========================================
  if (isVerifying) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#0f172a", // Slate 900 base color
          color: "#f8fafc",
          fontFamily: "system-ui, -apple-system, sans-serif",
          gap: "1.25rem",
        }}
      >
        {/* Animated Loading Ring Box Wrapper */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader2
            size={48}
            color="#38bdf8" // Sky blue spinner ring
            style={{
              animation: "spin 1s linear infinite",
            }}
          />
          {/* Static security center anchor icon */}
          <ShieldCheck
            size={20}
            color="#38bdf8"
            style={{ position: "absolute" }}
          />
        </div>

        {/* Text descriptions */}
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "1rem",
              fontWeight: "600",
              margin: "0 0 0.25rem 0",
              letterSpacing: "0.025em",
            }}
          >
            Securing Your Workspace
          </p>
          <p style={{ fontSize: "0.813rem", color: "#94a3b8", margin: 0 }}>
            Verifying encryption tokens...
          </p>
        </div>

        {/* CSS Keyframe Injection hack for spin animations */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <LandingPage
            onLaunchApp={handleLaunchApp}
            onLoginClick={() => navigate("/login")}
          />
        }
      />
      <Route path="/forgetPassword" element={<ResetPassword />} />
      <Route
        path="/login"
        element={
          <Login
            onLogin={handleLogin}
            onNavigateRegister={() => navigate("/register")}
            onNavigateHome={() => navigate("/")}
            onNavigateForgotPassword={() => navigate("/forgetPassword")}
          />
        }
      />
      <Route
        path="/register"
        element={
          <Register
            onRegister={handleRegister}
            onNavigateLogin={() => navigate("/login")}
            onNavigateHome={() => navigate("/")}
          />
        }
      />

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
        <Route
          path="/dashboard"
          element={<DashboardLayout onLogout={handleLogout} />}
        >
          <Route index element={<DashboardOverview />} />
          <Route path="inventory" element={<BulkInventory />} />
          <Route path="addons" element={<BulkInventory />} />
          <Route path="pos" element={<CustomerEntry />} />
          <Route path="financial" element={<FinancialOverview />} />
          <Route path="SalesRegisterLedger" element={<SalesRegisterLedger />} />
          <Route
            path="InventoryExpenseManager"
            element={<InventoryExpenseManager />}
          />
          <Route
            path="statements"
            element={
              <div style={{ padding: "2rem", color: "inherit" }}>
                <h2>Financial Statement Generator</h2>
              </div>
            }
          />
        </Route>
      </Route>

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "10px",
            background: "#1e293b",
            color: "#f8fafc",
            border: "1px solid #334155",
            fontSize: "14px",
          },
        }}
      />
      <AppRoutes />
    </BrowserRouter>
  );
}
