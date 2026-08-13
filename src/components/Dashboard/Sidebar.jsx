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
  company,
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
      path: "/dashboard/pos",
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

  // Helper logic to get up to a clean 2-letter avatar from user name (e.g., "Elikem Shela" -> "ES")
  const getUserInitials = () => {
    if (!user?.name) return "A";
    const nameParts = user.name.trim().split(/\s+/);
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  const currentCompanyName = company?.name || "ALBIJO";
  const currentUserName = user?.name || "ALBIJO USER";

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
          <div
            className="logo-container"
            style={{ minWidth: 0, width: "100%" }}
          >
            <div className="logo-icon-bg" style={{ flexShrink: 0 }}>
              <Store size={22} />
            </div>
            {/* Added dynamic HTML title attribute so users can view the full name on mouse hover */}
            <span
              className="logo-text"
              title={currentCompanyName}
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {currentCompanyName}
            </span>
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
                <Icon
                  size={20}
                  className="nav-icon"
                  style={{ flexShrink: 0 }}
                />
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
            <div className="theme-info" style={{ minWidth: 0 }}>
              {isDarkMode ? (
                <Moon size={18} style={{ flexShrink: 0 }} />
              ) : (
                <Sun size={18} style={{ flexShrink: 0 }} />
              )}
              <span className="nav-text">
                {isDarkMode ? "Dark Mode" : "Light Mode"}
              </span>
            </div>

            <div className={`switch-track ${isDarkMode ? "active" : ""}`}>
              <div className="switch-thumb" />
            </div>
          </div>

          {/* User Profile */}
          <div className="user-profile" style={{ minWidth: 0, width: "100%" }}>
            <div className="user-avatar" style={{ flexShrink: 0 }}>
              {getUserInitials()}
            </div>

            <div
              className="user-info-text"
              style={{ minWidth: 0, flex: 1, overflow: "hidden" }}
            >
              <span
                className="user-name"
                title={currentUserName}
                style={{
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {currentUserName}
              </span>
              <span
                className="user-role"
                style={{
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {company?.reference
                  ? `Code: ${company.reference}`
                  : user?.role || "Store Owner"}
              </span>
            </div>

            <button
              className="logout-btn"
              onClick={onLogout}
              title="Log Out"
              style={{ flexShrink: 0 }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
