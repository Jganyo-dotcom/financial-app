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
} from "lucide-react";
import "../css/FinancialOverview.css";
import { API_BASE_URL } from "../components/apiEnpoint";

export default function FinancialOverview() {
  const token = localStorage.getItem("token");

  // State
  const [timeframe, setTimeframe] = useState("This Month");
  const [activeTab, setActiveTab] = useState("profitability"); // 'profitability' | 'credit'
  const [productSearch, setProductSearch] = useState("");
  const [debtSearch, setDebtSearch] = useState("");

  // API Data States
  const [products, setProducts] = useState([]);
  const [creditAccounts, setCreditAccounts] = useState([]);
  const [operationalExpenses, setOperationalExpenses] = useState(0);
  const [loading, setLoading] = useState(false);

  // Modal State for Recording Payments
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  // --- API FETCH: FINANCIAL OVERVIEW ---
  const fetchOverviewData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/financial/overview?timeframe=${encodeURIComponent(
          timeframe,
        )}`,
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
      setOperationalExpenses(data.operationalExpenses || 0);
    } catch (error) {
      console.error("Error loading financial overview:", error);
      setProducts([]);
      setCreditAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [timeframe, token]);

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  // --- API POST: RECORD CUSTOMER PAYMENT ---
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedAccount || !paymentAmount || parseFloat(paymentAmount) <= 0)
      return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/financial/pay-debt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId: selectedAccount.id,
          paymentAmount: parseFloat(paymentAmount),
          reminderNote: paymentNote,
        }),
      });

      if (response.ok) {
        setSelectedAccount(null);
        setPaymentAmount("");
        setPaymentNote("");
        fetchOverviewData(); // Refresh metrics after payment
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to record payment.");
      }
    } catch (error) {
      console.error("Error submitting payment:", error);
    }
  };

  // Safe Fallback Calculations
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
    (sum, acc) => sum + ((acc.totalOwed || 0) - (acc.amountPaid || 0)),
    0,
  );

  // Filtered Search Lists
  const filteredProducts = safeProducts.filter(
    (p) =>
      p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category?.toLowerCase().includes(productSearch.toLowerCase()),
  );

  const filteredDebts = safeCreditAccounts.filter(
    (c) =>
      c.customerName?.toLowerCase().includes(debtSearch.toLowerCase()) ||
      c.phone?.includes(debtSearch),
  );

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

        {/* Timeframe Filter */}
        <div className="timeframe-selector">
          {["Today", "This Week", "This Month"].map((tf) => (
            <button
              key={tf}
              className={`time-btn ${timeframe === tf ? "active" : ""}`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </header>

      {/* Top 4 Summary Cards */}
      <section className="metrics-grid">
        {/* Gross Revenue */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Gross Revenue</span>
            <div className="icon-wrapper blue">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="metric-body">
            <h3>
              $
              {totalProductRevenue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </h3>
            <span className="sub-text positive">
              <ArrowUpRight size={14} /> Sales from{" "}
              {safeProducts.reduce((a, b) => a + (b.unitsSold || 0), 0)} units
            </span>
          </div>
        </div>

        {/* Total Expenditure */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Expenditure</span>
            <div className="icon-wrapper red">
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="metric-body">
            <h3>
              $
              {totalExpenditure.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </h3>
            <span className="sub-text muted">
              COGS: ${totalProductCost.toFixed(2)} | Ops: $
              {operationalExpenses.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="metric-card highlight">
          <div className="metric-header">
            <span className="metric-title">Net Profit</span>
            <div className="icon-wrapper green">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="metric-body">
            <h3 className="profit-value">
              ${netProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h3>
            <span className="sub-text positive">
              Margin:{" "}
              {totalProductRevenue > 0
                ? ((netProfit / totalProductRevenue) * 100).toFixed(1)
                : 0}
              %
            </span>
          </div>
        </div>

        {/* Outstanding Customer Credit */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Money Owed by Customers</span>
            <div className="icon-wrapper amber">
              <Clock size={18} />
            </div>
          </div>
          <div className="metric-body">
            <h3 className="amber-text">
              $
              {totalCustomerCreditOwed.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </h3>
            <span className="sub-text amber-badge">
              {
                safeCreditAccounts.filter((a) => a.totalOwed > a.amountPaid)
                  .length
              }{" "}
              Active Debts
            </span>
          </div>
        </div>
      </section>

      {/* Main Tabbed Detail Section */}
      <section className="main-content-card">
        {/* Navigation Tabs */}
        <div className="card-tabs">
          <button
            className={`tab-btn ${
              activeTab === "profitability" ? "active" : ""
            }`}
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
          <div className="text-center py-8">Loading financial metrics...</div>
        ) : (
          <>
            {/* TAB 1: ITEM-LEVEL PROFITABILITY */}
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
                        filteredProducts.map((item) => {
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
                            <tr key={item.id}>
                              <td>
                                <span className="item-name">{item.name}</span>
                                <span className="item-cat">
                                  {item.category}
                                </span>
                              </td>
                              <td>${(item.unitCost || 0).toFixed(2)}</td>
                              <td>${(item.unitPrice || 0).toFixed(2)}</td>
                              <td className="center-text">{item.unitsSold}</td>
                              <td>${itemRevenue.toFixed(2)}</td>
                              <td className="text-muted-cell">
                                ${itemCost.toFixed(2)}
                              </td>
                              <td className="profit-cell">
                                +${itemProfit.toFixed(2)}
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
                    Pending Receivables: ${totalCustomerCreditOwed.toFixed(2)}
                  </span>
                </div>

                <div className="table-responsive">
                  <table className="financial-table">
                    <thead>
                      <tr>
                        <th>Customer & Contact</th>
                        <th>Total Credit</th>
                        <th>Amount Paid</th>
                        <th>Remaining Balance</th>
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
                        filteredDebts.map((acc) => {
                          const remaining =
                            (acc.totalOwed || 0) - (acc.amountPaid || 0);
                          const isCleared = remaining <= 0;

                          return (
                            <tr key={acc.id}>
                              <td>
                                <span className="customer-title">
                                  {acc.customerName}
                                </span>
                                <span className="customer-phone">
                                  {acc.phone}
                                </span>
                              </td>
                              <td>${(acc.totalOwed || 0).toFixed(2)}</td>
                              <td className="paid-cell">
                                ${(acc.amountPaid || 0).toFixed(2)}
                              </td>
                              <td>
                                <span
                                  className={`balance-badge ${
                                    isCleared ? "cleared" : "pending"
                                  }`}
                                >
                                  $
                                  {remaining > 0
                                    ? remaining.toFixed(2)
                                    : "0.00"}
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
                                        <Bell size={12} /> Due: {acc.dueDate}
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
                              <td>{acc.lastPaymentDate}</td>
                              <td>
                                {!isCleared ? (
                                  <button
                                    className="pay-action-btn"
                                    onClick={() => setSelectedAccount(acc)}
                                  >
                                    <Plus size={14} /> Record Payment
                                  </button>
                                ) : (
                                  <span className="text-muted-cell">
                                    Cleared
                                  </span>
                                )}
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

      {/* PAYMENT RECORDING MODAL */}
      {selectedAccount && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Record Payment for {selectedAccount.customerName}</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedAccount(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="modal-form">
              <div className="debt-summary-box">
                <div>
                  <span className="box-label">Total Credit</span>
                  <span className="box-val">
                    ${(selectedAccount.totalOwed || 0).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="box-label">Already Paid</span>
                  <span className="box-val green-val">
                    ${(selectedAccount.amountPaid || 0).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="box-label">Current Owed</span>
                  <span className="box-val amber-val">
                    $
                    {(
                      (selectedAccount.totalOwed || 0) -
                      (selectedAccount.amountPaid || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Amount Being Paid ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  max={
                    (selectedAccount.totalOwed || 0) -
                    (selectedAccount.amountPaid || 0)
                  }
                  placeholder="Enter amount paid today"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
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
                ></textarea>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setSelectedAccount(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="confirm-btn">
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
