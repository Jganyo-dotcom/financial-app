import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingBag,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  X,
  Bell,
  ArrowUpRight,
  Loader2,
  History,
  Calendar,
} from "lucide-react";
import "../css/FinancialOverview.css";
import { API_BASE_URL } from "../components/apiEnpoint";

export default function FinancialOverview() {
  // Helper for default date strings (YYYY-MM-DD)
  const getFirstDayOfMonth = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1)
      .toISOString()
      .split("T")[0];
  };

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Date Range Picker States
  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getTodayDate());

  // UI States
  const [activeTab, setActiveTab] = useState("profitability"); // 'profitability' | 'credit'
  const [productSearch, setProductSearch] = useState("");
  const [debtSearch, setDebtSearch] = useState("");

  // API Data States
  const [products, setProducts] = useState([]);
  const [creditAccounts, setCreditAccounts] = useState([]);
  const [operationalExpenses, setOperationalExpenses] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal States
  const [selectedAccount, setSelectedAccount] = useState(null); // For recording payments
  const [historyAccount, setHistoryAccount] = useState(null); // For viewing payment history breakdown
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  const getAuthToken = () => localStorage.getItem("token");

  // --- API FETCH: FINANCIAL OVERVIEW WITH DATE PICKER ---
  const fetchOverviewData = useCallback(async () => {
    setLoading(true);
    const token = getAuthToken();

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/customer/financial/overview?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch overview data");
      const data = await response.json();

      setProducts(Array.isArray(data.products) ? data.products : []);
      setCreditAccounts(
        Array.isArray(data.creditAccounts) ? data.creditAccounts : [],
      );
      setOperationalExpenses(Number(data.operationalExpenses) || 0);
    } catch (error) {
      console.error("Error loading financial overview:", error);
      setProducts([]);
      setCreditAccounts([]);
      setOperationalExpenses(0);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  // --- API POST: RECORD CUSTOMER PAYMENT ---
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    const numericPayment = parseFloat(paymentAmount);

    if (!selectedAccount || isNaN(numericPayment) || numericPayment <= 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/customer/${selectedAccount.id}/pay-debt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            customerId: selectedAccount.id,
            paymentAmount: numericPayment,
            note: paymentNote.trim(),
          }),
        },
      );

      if (response.ok) {
        setSelectedAccount(null);
        setPaymentAmount("");
        setPaymentNote("");
        fetchOverviewData(); // Refresh metrics after payment
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || "Failed to record payment.");
      }
    } catch (error) {
      console.error("Error submitting payment:", error);
      alert("A network error occurred while recording the payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Safe Calculations
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCreditAccounts = Array.isArray(creditAccounts)
    ? creditAccounts
    : [];

  const totalProductRevenue = safeProducts.reduce(
    (sum, item) => sum + (item.unitPrice || 0) * (item.unitsSold || 0),
    0,
  );

  const totalProductCost = safeProducts.reduce(
    (sum, item) => sum + (item.unitCost || 0) * (item.unitsSold || 0),
    0,
  );

  const totalExpenditure = totalProductCost + operationalExpenses;
  const netProfit = totalProductRevenue - totalExpenditure;

  const totalCustomerCreditOwed = safeCreditAccounts.reduce(
    (sum, acc) => sum + ((acc.totalOwed || 0) - ( 0)),
    0,
  );

  const totalUnitsSold = safeProducts.reduce(
    (sum, item) => sum + (item.unitsSold || 0),
    0,
  );

  // Search Filters
  const filteredProducts = safeProducts.filter(
    (p) =>
      p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category?.toLowerCase().includes(productSearch.toLowerCase()),
  );

  const filteredDebts = safeCreditAccounts.filter(
    (c) =>
      c.customerName?.toLowerCase().includes(debtSearch.toLowerCase()) ||
      c.phone?.toLowerCase().includes(debtSearch.toLowerCase()),
  );

  const formatCurrency = (val) =>
    Number(val || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="financial-overview-page">
      {/* Page Header */}
      <header className="page-header">
        <div>
          <h2>
            <DollarSign className="title-icon" size={26} /> Financial Overview
          </h2>
          <p>
            Real-time revenue, expense breakdown, item profit margins, and
            contractor debt ledger.
          </p>
        </div>

        {/* Date Range Picker */}
        <div
          className="date-picker-container"
          style={{ display: "flex", gap: "10px", alignItems: "center" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Calendar size={16} />
            <label style={{ fontSize: "13px" }}>From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <label style={{ fontSize: "13px" }}>To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input"
            />
          </div>
        </div>
      </header>

      {/* Top 4 Metric Cards */}
      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Gross Revenue</span>
            <div className="icon-wrapper blue">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="metric-body">
            <h3>GH₵{formatCurrency(totalProductRevenue)}</h3>
            <span className="sub-text positive">
              <ArrowUpRight size={14} /> Sales from {totalUnitsSold} units
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Expenditure</span>
            <div className="icon-wrapper red">
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="metric-body">
            <h3>GH₵{formatCurrency(totalExpenditure)}</h3>
            <span className="sub-text muted">
              COGS: GH₵{formatCurrency(totalProductCost)} | Ops: GH₵
              {formatCurrency(operationalExpenses)}
            </span>
          </div>
        </div>

        <div className="metric-card highlight">
          <div className="metric-header">
            <span className="metric-title">Net Profit</span>
            <div className="icon-wrapper green">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="metric-body">
            <h3 className="profit-value">GH₵{formatCurrency(netProfit)}</h3>
            <span className="sub-text positive">
              Margin:{" "}
              {totalProductRevenue > 0
                ? ((netProfit / totalProductRevenue) * 100).toFixed(1)
                : "0.0"}
              %
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Money Owed by Customers</span>
            <div className="icon-wrapper amber">
              <Clock size={18} />
            </div>
          </div>
          <div className="metric-body">
            <h3 className="amber-text">
              GH₵{formatCurrency(totalCustomerCreditOwed)}
            </h3>
            <span className="sub-text amber-badge">
              {
                safeCreditAccounts.filter(
                  (a) => (a.totalOwed || 0) > (a.amountPaid || 0),
                ).length
              }{" "}
              Active Debts
            </span>
          </div>
        </div>
      </section>

      {/* Main Tabbed Detail Section */}
      <section className="main-content-card">
        <div className="card-tabs">
          <button
            className={`tab-btn ${activeTab === "profitability" ? "active" : ""}`}
            onClick={() => setActiveTab("profitability")}
          >
            <ShoppingBag size={16} /> Item-Level Profit Breakdown
          </button>
          <button
            className={`tab-btn ${activeTab === "credit" ? "active" : ""}`}
            onClick={() => setActiveTab("credit")}
          >
            <Users size={16} /> Customer Credit & Payments Ledger
            {totalCustomerCreditOwed > 0 && <span className="tab-dot"></span>}
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner-container text-center py-8">
            <p>Loading financial metrics...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: ITEM PROFITABILITY */}
            {activeTab === "profitability" && (
              <div className="tab-pane">
                <div className="pane-toolbar">
                  <div className="search-box">
                    <Search size={16} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search item or category..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                  </div>
                  <span className="info-badge">
                    Showing item profit margins based on stock cost
                  </span>
                </div>

                <div className="table-responsive">
                  <table className="financial-table">
                    <thead>
                      <tr>
                        <th>Product & Category</th>
                        <th>Unit Cost</th>
                        <th>Selling Price</th>
                        <th>Units Sold</th>
                        <th>Total Revenue</th>
                        <th>Total Cost</th>
                        <th>Net Profit / Item</th>
                        <th>Margin %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center py-4">
                            No product sales recorded for this timeframe.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((item, index) => {
                          const itemRevenue =
                            (item.unitPrice || 0) * (item.unitsSold || 0);
                          const itemCost =
                            (item.unitCost || 0) * (item.unitsSold || 0);
                          const itemProfit = itemRevenue - itemCost;
                          const margin =
                            itemRevenue > 0
                              ? (itemProfit / itemRevenue) * 100
                              : 0;

                          return (
                            <tr key={item.id || item._id || index}>
                              <td>
                                <span className="item-name">{item.name}</span>
                                <span className="item-cat">
                                  {item.category}
                                </span>
                              </td>
                              <td>GH₵{formatCurrency(item.unitCost)}</td>
                              <td>GH₵{formatCurrency(item.unitPrice)}</td>
                              <td className="center-text">
                                {item.unitsSold || 0}
                              </td>
                              <td>GH₵{formatCurrency(itemRevenue)}</td>
                              <td className="text-muted-cell">
                                GH₵{formatCurrency(itemCost)}
                              </td>
                              <td className="profit-cell">
                                +GH₵{formatCurrency(itemProfit)}
                              </td>
                              <td>
                                <span className="margin-chip">
                                  {margin.toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: CUSTOMER CREDIT & PAYMENT TRACKING */}
            {activeTab === "credit" && (
              <div className="tab-pane">
                <div className="pane-toolbar">
                  <div className="search-box">
                    <Search size={16} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search customer name or phone..."
                      value={debtSearch}
                      onChange={(e) => setDebtSearch(e.target.value)}
                    />
                  </div>
                  <span className="info-badge warning">
                    Pending Receivables: GH₵
                    {formatCurrency(totalCustomerCreditOwed)}
                  </span>
                </div>

                <div className="table-responsive">
                  <table className="financial-table">
                    <thead>
                      <tr>
                        <th>Customer & Contact</th>
                        <th>Remaining Balance</th>
                        <th>Amount Paid</th>
                        <th>Total Credit</th>
                        <th>Status & Active Reminder</th>
                        <th>Last Payment</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDebts.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            No active customer debt accounts found.
                          </td>
                        </tr>
                      ) : (
                        filteredDebts.map((acc, index) => {
                          const totalOwed = acc.totalOwed || 0;
                          const amountPaid = acc.amountPaid || 0;
                          const remaining = acc.totalCredit;
                          const isCleared = remaining <= 0;

                          return (
                            <tr key={acc.id || acc._id || index}>
                              <td>
                                <span className="customer-title">
                                  {acc.customerName}
                                </span>
                                <span className="customer-phone">
                                  {acc.phone || "No phone provided"}
                                </span>
                              </td>
                              <td>GH₵{formatCurrency(totalOwed)}</td>
                              <td className="paid-cell">
                                GH₵{formatCurrency(amountPaid)}
                              </td>
                              <td>
                                <span
                                  className={`balance-badge ${
                                    isCleared ? "cleared" : "pending"
                                  }`}
                                >
                                  GH₵{formatCurrency(remaining)}
                                </span>
                              </td>
                              <td>
                                <div className="reminder-cell">
                                  {isCleared ? (
                                    <span className="status-tag success">
                                      <CheckCircle2 size={13} /> Paid in Full
                                    </span>
                                  ) : (
                                    <div className="reminder-box">
                                      <span className="reminder-header">
                                        <Bell size={12} /> Due:{" "}
                                        {acc.dueDate || "N/A"}
                                      </span>
                                      {acc.reminderNote && (
                                        <p className="reminder-text">
                                          "{acc.reminderNote}"
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>
                                {acc.lastPaymentDate
                                  ? new Date(
                                      acc.lastPaymentDate,
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </td>
                              <td>
                                <div style={{ display: "flex", gap: "6px" }}>
                                  {/* BUTTON: View Payment History Breakdown */}
                                  <button
                                    className="history-action-btn"
                                    onClick={() => setHistoryAccount(acc)}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "4px",
                                      padding: "6px 10px",
                                      fontSize: "12px",
                                      backgroundColor: "blue",
                                      border: "1px solid #cbd5e1",
                                      borderRadius: "6px",
                                      cursor: "pointer",
                                      color:"white"
                                    }}
                                  >
                                    <History size={14} /> History
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* RECORD PAYMENT MODAL */}
      {selectedAccount && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Record Payment for {selectedAccount.customerName}</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedAccount(null)}
                disabled={isSubmitting}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="modal-form">
              <div className="debt-summary-box">
                <div>
                  <span className="box-label">Total Credit</span>
                  <span className="box-val">
                    GH₵{formatCurrency(selectedAccount.totalOwed)}
                  </span>
                </div>
                <div>
                  <span className="box-label">Already Paid</span>
                  <span className="box-val green-val">
                    GH₵{formatCurrency(selectedAccount.amountPaid)}
                  </span>
                </div>
                <div>
                  <span className="box-label">Current Owed</span>
                  <span className="box-val amber-val">
                    GH₵
                    {formatCurrency(
                      (selectedAccount.totalOwed || 0) -
                        (selectedAccount.amountPaid || 0),
                    )}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Amount Being Paid (GH₵) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={
                    (selectedAccount.totalOwed || 0) -
                    (selectedAccount.amountPaid || 0)
                  }
                  placeholder="Enter amount paid today"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="form-group">
                <label>Update Reminder / Settlement Note</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Paid cash today. Balance to be paid next week."
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  disabled={isSubmitting}
                ></textarea>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setSelectedAccount(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="confirm-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="spinner" /> Recording...
                    </>
                  ) : (
                    "Confirm Payment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYMENT HISTORY BREAKDOWN MODAL */}
      {historyAccount && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h3>Payment History: {historyAccount.customerName}</h3>
              <button
                className="close-btn"
                onClick={() => setHistoryAccount(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: "16px" }}>
              {historyAccount.paymentHistory &&
              historyAccount.paymentHistory.length > 0 ? (
                <table
                  className="financial-table"
                  style={{ width: "100%", textAlign: "left" }}
                >
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount Paid</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyAccount.paymentHistory.map((pmt, idx) => (
                      <tr key={pmt.id || idx}>
                        <td>
                          {pmt.paymentDate
                            ? new Date(pmt.paymentDate).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td style={{ color: "green", fontWeight: "bold" }}>
                          GH₵{formatCurrency(pmt.amountPaid)}
                        </td>
                        <td>{pmt.note || "No notes"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ textAlign: "center", padding: "20px" }}>
                  No payment history recorded yet for this customer.
                </p>
              )}
            </div>

            <div className="modal-actions" style={{ padding: "12px 16px" }}>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setHistoryAccount(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
