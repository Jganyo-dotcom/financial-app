import React, { useState, useEffect } from "react";
import {
  User,
  Lock,
  UserPlus,
  Store,
  Eye,
  EyeOff,
  Save,
  Users,
  Trash2,
  Loader2,
} from "lucide-react";
import "../css/SettingsPage.css";
import { API_BASE_URL } from "../components/apiEnpoint";
import toast from "react-hot-toast";

export const SettingsPage = () => {
  // Read role & token from LocalStorage
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = storedUser.role || localStorage.getItem("role") || "";
  const isAdmin = userRole === "Store Admin";

  const [activeTab, setActiveTab] = useState("profile");
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Profile Form State
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Password Form State
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // New Employee Form State
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    password: "",
    role: "Cashier",
  });
  const [showEmpPassword, setShowEmpPassword] = useState(false);

  // Staff List State
  const [employees, setEmployees] = useState([]);

  // Business Settings State
  const [business, setBusiness] = useState({
    name: "",
    address: "",
    currency: "USD ($)",
    taxRate: "",
    receiptMessage: "",
    companyRef: "",
  });

  // Fetch initial data from backend API
  useEffect(() => {
    const fetchSettingsData = async () => {
      setLoadingData(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch User Profile
        const profileRes = await fetch(
          `${API_BASE_URL}/api/auth/user/profile`,
          { headers },
        );
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const userData = profileData.user || profileData;
          setProfile({
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
          });
        }

        // 2. Fetch Staff & Business Settings if user is Store Admin
        if (isAdmin) {
          const [empRes, bizRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/auth/all-employees`, { headers }),
            fetch(`${API_BASE_URL}/api/auth/business-settings`, { headers }), // Fixed missing slash in endpoint URL
          ]);

          if (empRes.ok) {
            const empData = await empRes.json();
            if (Array.isArray(empData)) {
              setEmployees(empData);
            } else if (Array.isArray(empData.employees)) {
              setEmployees(empData.employees);
            } else {
              setEmployees([]);
            }
          }

          if (bizRes.ok) {
            const bizData = await bizRes.json();
            // Handle nested objects safely (e.g. { settings: {...} } or raw object)
            const payload = bizData.settings || bizData.business || bizData;

            setBusiness({
              name: payload.storeName || payload.name || "",
              address: payload.address || "",
              currency: payload.currency || "USD ($)",
              taxRate: payload.taxRate ?? payload.tax_rate ?? "",
              receiptMessage:
                payload.receiptMessage || payload.receipt_footer || "",
              companyRef: payload.companyRef || payload.company_code || "",
            });
          }
        }
      } catch (error) {
        console.error("Failed to load settings data:", error);
        toast.error("Failed to load settings data");
      } finally {
        setLoadingData(false);
      }
    };

    fetchSettingsData();
  }, [isAdmin]);

  // Handlers
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/update-user/profile`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(profile),
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to update profile");

      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.message || "Error updating profile.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (submitting) return;
    setSubmitting(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/user/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            currentPassword: passwords.currentPassword,
            newPassword: passwords.newPassword,
            confirmPassword: passwords.confirmPassword,
          }),
        },
      );
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to change password");

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password updated successfully!");
    } catch (err) {
      toast.error(err.message || "Error changing password.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.email || !newEmployee.password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (submitting) return;
    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/create-employee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newEmployee),
      });

      const created = await response.json();
      if (!response.ok)
        throw new Error(created.message || "Failed to create employee account");

      const createdEmp = created.employee || created;

      setEmployees((prev) =>
        Array.isArray(prev) ? [createdEmp, ...prev] : [createdEmp],
      );
      setNewEmployee({ name: "", email: "", password: "", role: "Cashier" });
      toast.success(`Employee ${createdEmp.name || ""} added successfully!`);
    } catch (err) {
      toast.error(err.message || "Error adding employee.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this employee?"))
      return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/employees/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete employee");
      setEmployees((prev) => prev.filter((emp) => (emp.id || emp._id) !== id));
      toast.success("Employee account removed.");
    } catch (err) {
      toast.error(err.message || "Error removing employee.");
    }
  };

  const handleBusinessSave = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/business-settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(business),
        },
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to save business settings");

      toast.success("Business settings saved successfully!");
    } catch (err) {
      toast.error(err.message || "Error saving configuration.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="settings-container flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="settings-header">
        <div>
          <h1 className="settings-title">Account & Business Settings</h1>
          <p className="settings-subtitle">
            Manage system credentials, employees, and store settings.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="settings-tabs">
        <button
          onClick={() => setActiveTab("profile")}
          className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
        >
          <User className="w-4 h-4" /> Profile
        </button>

        <button
          onClick={() => setActiveTab("password")}
          className={`tab-btn ${activeTab === "password" ? "active" : ""}`}
        >
          <Lock className="w-4 h-4" /> Security
        </button>

        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab("employees")}
              className={`tab-btn ${activeTab === "employees" ? "active" : ""}`}
            >
              <UserPlus className="w-4 h-4" /> Employees & Staff
            </button>

            <button
              onClick={() => setActiveTab("business")}
              className={`tab-btn ${activeTab === "business" ? "active" : ""}`}
            >
              <Store className="w-4 h-4" /> Business Config
            </button>
          </>
        )}
      </div>

      {/* Tab Panels */}
      <div className="settings-content">
        {/* TAB 1: PROFILE UPDATE */}
        {activeTab === "profile" && (
          <form onSubmit={handleProfileUpdate} className="settings-card">
            <h2 className="card-title">Personal Profile</h2>
            <p className="card-subtitle">
              Update your personal account display information.
            </p>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                className="form-input"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Update Profile
            </button>
          </form>
        )}

        {/* TAB 2: CHANGE PASSWORD */}
        {activeTab === "password" && (
          <form onSubmit={handlePasswordChange} className="settings-card">
            <h2 className="card-title">Change Password</h2>
            <p className="card-subtitle">
              Ensure your account uses a strong, unique password.
            </p>

            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    currentPassword: e.target.value,
                  })
                }
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="relative-input">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, newPassword: e.target.value })
                  }
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="input-eye-btn"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    confirmPassword: e.target.value,
                  })
                }
                className="form-input"
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              Change Password
            </button>
          </form>
        )}

        {/* TAB 3: EMPLOYEES & STAFF */}
        {activeTab === "employees" && isAdmin && (
          <div className="space-y-6">
            <form onSubmit={handleAddEmployee} className="settings-card">
              <div className="flex items-center gap-2 mb-1">
                <UserPlus className="w-5 h-5 text-indigo-500" />
                <h2 className="card-title">Add New Employee Account</h2>
              </div>
              <p className="card-subtitle">
                Create login access for cashiers, managers, or store
                administrators.
              </p>

              <div className="grid-2-col">
                <div className="form-group">
                  <label className="form-label">Employee Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={newEmployee.name}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, name: e.target.value })
                    }
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    placeholder="john@store.com"
                    value={newEmployee.email}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, email: e.target.value })
                    }
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="grid-2-col">
                <div className="form-group">
                  <label className="form-label">Account Password *</label>
                  <div className="relative-input">
                    <input
                      type={showEmpPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newEmployee.password}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          password: e.target.value,
                        })
                      }
                      className="form-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmpPassword(!showEmpPassword)}
                      className="input-eye-btn"
                    >
                      {showEmpPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned System Role</label>
                  <select
                    value={newEmployee.role}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, role: e.target.value })
                    }
                    className="form-input"
                  >
                    <option value="Cashier">Cashier</option>
                    <option value="Inventory Manager">Inventory Manager</option>
                    <option value="Store Admin">Store Admin</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                Create Employee Account
              </button>
            </form>

            <div className="settings-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="card-title">Active Staff Directory</h3>
                  <p className="card-subtitle">
                    Current registered employees and access levels.
                  </p>
                </div>
                <span className="badge-count">
                  <Users className="w-3.5 h-3.5" />{" "}
                  {Array.isArray(employees) ? employees.length : 0} Staff
                </span>
              </div>

              <div className="table-responsive">
                <table className="staff-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(employees) && employees.length > 0 ? (
                      employees.map((emp) => {
                        const empId =
                          emp.id || emp._id || Math.random().toString();
                        const roleClass = (emp.role || "cashier")
                          .replace(/\s+/g, "-")
                          .toLowerCase();

                        return (
                          <tr key={empId}>
                            <td className="font-semibold">{emp.name}</td>
                            <td style={{ color: "var(--text-muted)" }}>
                              {emp.email}
                            </td>
                            <td>
                              <span className={`role-badge ${roleClass}`}>
                                {emp.role || "Cashier"}
                              </span>
                            </td>
                            <td>
                              <span className="status-pill">
                                {emp.status || "Active"}
                              </span>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <button
                                onClick={() => handleDeleteEmployee(empId)}
                                className="btn-danger-icon"
                                title="Deactivate / Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          style={{ textAlign: "center", padding: "1rem" }}
                        >
                          No employees found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BUSINESS SETTINGS */}
        {activeTab === "business" && isAdmin && (
          <form onSubmit={handleBusinessSave} className="settings-card">
            <h2 className="card-title">Store & Business Setup</h2>
            <p className="card-subtitle">
              Configure business rules, tax rates, and receipt formatting.
            </p>

            <div className="grid-2-col">
              <div className="form-group">
                <label className="form-label">Store / Business Name</label>
                <input
                  type="text"
                  value={business.name}
                  onChange={(e) =>
                    setBusiness({ ...business, name: e.target.value })
                  }
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Company Reference Code</label>
                <input
                  type="text"
                  placeholder="e.g., AB-1234"
                  value={business.companyRef || ""}
                  onChange={(e) =>
                    setBusiness({
                      ...business,
                      companyRef: e.target.value.toUpperCase(),
                    })
                  }
                  className="form-input"
                  maxLength={7}
                  required
                />
              </div>
            </div>

            <div className="grid-2-col">
              <div className="form-group">
                <label className="form-label">Default Currency</label>
                <select
                  value={business.currency}
                  onChange={(e) =>
                    setBusiness({ ...business, currency: e.target.value })
                  }
                  className="form-input"
                >
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="GBP (£)">GBP (£)</option>
                  <option value="GHS (₵)">GHS (₵)</option>
                  <option value="NGN (₦)">NGN (₦)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Business Physical Address</label>
                <input
                  type="text"
                  value={business.address}
                  onChange={(e) =>
                    setBusiness({ ...business, address: e.target.value })
                  }
                  className="form-input"
                />
              </div>
            </div>

            <div className="grid-2-col">
              <div className="form-group">
                <label className="form-label">Sales Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={business.taxRate}
                  onChange={(e) =>
                    setBusiness({ ...business, taxRate: e.target.value })
                  }
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Receipt Footer Note</label>
              <textarea
                value={business.receiptMessage}
                onChange={(e) =>
                  setBusiness({ ...business, receiptMessage: e.target.value })
                }
                className="form-input form-textarea"
                rows="3"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Business Configuration
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
