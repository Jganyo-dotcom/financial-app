import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X, Store } from "lucide-react";
import Sidebar from "./Sidebar";
import "./Sidebar.css";

export default function DashboardLayout({ user, onLogout }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Apply Light/Dark attribute to HTML root
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "dark" : "light",
    );
  }, [isDarkMode]);

  return (
    <div className="app-layout">
      {/* ==========================================
          MOBILE TOPBAR
         ========================================== */}
      <header className="mobile-topbar">
        {/* Left: Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
          <span>Menu</span>
        </button>

        {/* Right: Company Brand & Icon */}
        <div className="mobile-brand">
          <div className="brand-icon-box">
            <Store size={16} />
          </div>
          <span className="brand-name">{user?.companyName || "ALBIJO"}</span>
        </div>
      </header>

      {/* Modular Sidebar Component */}
      <Sidebar
        user={user}
        onLogout={onLogout}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {/* Main Viewport Outlet */}
      <main className={`main-viewport ${isCollapsed ? "collapsed" : ""}`}>
        <Outlet />
      </main>
    </div>
  );
}
