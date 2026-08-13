import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X, Store } from "lucide-react";
import Sidebar from "./Sidebar";
import "./Sidebar.css";

export default function DashboardLayout({ onLogout }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // 1. Initialize user info directly from localStorage safely
  const [localStorageUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 2. Initialize company info directly from localStorage safely
  const [localStorageCompany] = useState(() => {
    const savedCompany = localStorage.getItem("company");
    return savedCompany ? JSON.parse(savedCompany) : null;
  });

  // 3. Initialize dark mode state by checking localStorage (defaults to dark mode)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : true;
  });

  // Apply theme attribute and save changes to localStorage automatically
  useEffect(() => {
    const themeValue = isDarkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", themeValue);
    localStorage.setItem("theme", themeValue);
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
          {/* Displaying Company name if available, fallback to user name or fallback string */}
          <span className="brand-name">
            {localStorageCompany?.name || localStorageUser?.name}
          </span>
        </div>
      </header>

      {/* Modular Sidebar Component */}
      <Sidebar
        user={localStorageUser}
        company={localStorageCompany}
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
