import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  PackagePlus,
  Receipt,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Store,
  Layers,
  X,
} from "lucide-react";
import "./Sidebar.css";

export default function Sidebar({
  user,
  onLogout,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  isDarkMode,
  setIsDarkMode,
}) {
  const navItems = [
    {
      path: "/dashboard",
      label: "Overview",
      icon: LayoutDashboard,
      index: true,
    },
    {
      path: "/dashboard/inventory",
      label: "Bulk Inventory",
      icon: PackagePlus,
    },
    {
      path: "/dashboard/pos", // <-- Updated from /entry to /dashboard/pos
      label: "Customer & POS",
      icon: Receipt,
    },
    {
      path: "/dashboard/financial",
      label: "Financials",
      icon: FileText,
    },
    {
      path: "/dashboard/SalesRegisterLedger",
      label: "Sale Ledger",
      icon: FileText,
    },
    {
      path: "/dashboard/InventoryExpenseManager",
      label: "Stock & Expenses",
      icon: Layers,
    },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`sidebar ${isCollapsed ? "collapsed" : ""} ${
          isMobileOpen ? "mobile-open" : ""
        }`}
      >
        {/* Header / Logo Section */}
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon-bg">
              <Store size={22} />
            </div>
            <span className="logo-text">{user?.companyName || "ALBIJO"}</span>
          </div>

          {/* Desktop Collapse Arrow Button */}
          <button
            className="collapse-toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            className="mobile-close-btn"
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.index}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
                onClick={() => setIsMobileOpen(false)}
              >
                <Icon size={20} className="nav-icon" />
                <span className="nav-text">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Controls: Theme Toggle & Logout */}
        <div className="sidebar-footer">
          {/* Light / Dark Mode Switch */}
          <div
            className="theme-switch-card"
            onClick={() => setIsDarkMode(!isDarkMode)}
            title="Toggle Light/Dark Theme"
          >
            <div className="theme-info">
              {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
              <span className="nav-text">
                {isDarkMode ? "Dark Mode" : "Light Mode"}
              </span>
            </div>

            <div className={`switch-track ${isDarkMode ? "active" : ""}`}>
              <div className="switch-thumb" />
            </div>
          </div>

          {/* User Profile */}
          <div className="user-profile">
            <div className="user-avatar">
              {user?.companyName ? user.companyName[0].toUpperCase() : "A"}
            </div>
            <div className="user-info-text">
              <span className="user-name">
                {user?.companyName || "ALBIJO INCONPROTION"}
              </span>
              <span className="user-role">{user?.role || "Store Owner"}</span>
            </div>
            <button className="logout-btn" onClick={onLogout} title="Log Out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
