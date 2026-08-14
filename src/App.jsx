import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

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




function AppRoutes() {
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  // 1. Verify token with the backend on initial mount
  useEffect(() => {
    const verifyUserSession = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("session expired");
        setIsAuthenticated(false);
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
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
          // Token is invalid, expired, or rejected by backend
          handleSessionExpired();
        }
      } catch (error) {
        // Network or server error during verification
        handleSessionExpired();
      } finally {
        setIsVerifying(false);
      }
    };

    verifyUserSession();
  }, []);

  const handleSessionExpired = () => {
    toast.error("session expired");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("company");
    setIsAuthenticated(false);
    toast.error("Session expired");
  };

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    toast.success(`Welcome back to ${userData.company?.name || "Workspace"}!`);
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

  // Show a smooth full-screen loader while checking token authenticity
  if (isVerifying) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#0f172a",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <p style={{ fontSize: "1rem", fontWeight: "600" }}>
          Verifying session...
        </p>
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
      <Route
        path="/login"
        element={
          <Login
            onLogin={handleLogin}
            onNavigateRegister={() => navigate("/register")}
            onNavigateHome={() => navigate("/")}
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
          {/* Overview Tab */}
          <Route index element={<DashboardOverview />} />

          {/* Bulk Inventory Tab */}
          <Route path="inventory" element={<BulkInventory />} />
          <Route path="addons" element={<BulkInventory />} />

          {/* POS & Customer Sales Entry Page */}
          <Route path="pos" element={<CustomerEntry />} />
          <Route path="financial" element={<FinancialOverview />} />
          <Route path="SalesRegisterLedger" element={<SalesRegisterLedger />} />
          <Route
            path="InventoryExpenseManager"
            element={<InventoryExpenseManager />}
          />

          {/* Financial Statements Tab */}
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
