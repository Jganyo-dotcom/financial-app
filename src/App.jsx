import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

import LandingPage from "./components/landingPage/LandingPage";
import Login from "./components/Auth/Lgin";
import Register from "./components/Auth/Register";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import DashboardLayout from "./components/Dashboard/DashboardLayout";
import DashboardOverview from "./pages/DashboardOverview";
import BulkInventory from "./pages/BulkInventory";
import CustomerEntry from "./pages/CustomerEntry"; // <-- Imported here
import FinancialOverview from "./pages/FinancialOverview";
import SalesRegisterLedger from "./pages/SalesRegisterLedger";
import InventoryExpenseManager from "./pages/InventoryExpenseManager";

function AppRoutes() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    email: "owner@albijo.com",
    companyName: "ALBIJO Hardware",
    role: "Store Owner",
  });

  const handleLogin = (userData) => {
    setUser(userData);
    toast.success(`Welcome back to ${userData.companyName}!`);
    navigate("/dashboard");
  };

  const handleRegister = (userData) => {
    setUser(userData);
    toast.success(`Workspace created for ${userData.companyName}!`);
    navigate("/dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    toast("Logged out of ALBIJO", { icon: "👋" });
    navigate("/login");
  };

  const handleLaunchApp = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      toast.error("Please log in to access the workspace.");
      navigate("/login");
    }
  };

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
      <Route element={<ProtectedRoute isAuthenticated={!!user} />}>
        <Route
          path="/dashboard"
          element={<DashboardLayout user={user} onLogout={handleLogout} />}
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
