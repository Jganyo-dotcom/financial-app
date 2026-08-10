import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Users,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Plus,
  X,
  Bell,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import "../css/FinancialOverview.css";

// Mock Product Profitability Data
const INITIAL_PRODUCT_PROFITABILITY = [
  {
    id: "P-101",
    name: "Cement Bag 50kg (32.5R)",
    category: "Masonry",
    unitCost: 68.0,
    unitPrice: 85.0,
    unitsSold: 140,
  },
  {
    id: "P-102",
    name: "PVC Pipe 4-Inch (6m)",
    category: "Plumbing",
    unitCost: 30.0,
    unitPrice: 45.0,
    unitsSold: 85,
  },
  {
    id: "P-103",
    name: "Emulsion Paint White (20L)",
    category: "Paints",
    unitCost: 210.0,
    unitPrice: 280.0,
    unitsSold: 32,
  },
  {
    id: "P-104",
    name: "Roofing Nails (1kg pack)",
    category: "Fasteners",
    unitCost: 16.0,
    unitPrice: 25.0,
    unitsSold: 210,
  },
  {
    id: "P-105",
    name: "High-Tensile Steel Rod 12mm",
    category: "Structural",
    unitCost: 52.0,
    unitPrice: 65.0,
    unitsSold: 95,
  },
];

// Mock Customer Debts & Payment Records
const INITIAL_CREDIT_ACCOUNTS = [
  {
    id: "CR-201",
    customerName: "Kofi Mensah (Contractor)",
    phone: "+233 24 123 4567",
    totalOwed: 3500.0,
    amountPaid: 2000.0,
    dueDate: "2026-08-15",
    reminderNote: "Promised full settlement by Friday after site inspection.",
    lastPaymentDate: "2026-08-02",
  },
  {
    id: "CR-202",
    customerName: "Kwame Asante",
    phone: "+233 55 987 6543",
    totalOwed: 1200.0,
    amountPaid: 1200.0,
    dueDate: "2026-08-01",
    reminderNote: "Fully cleared balance.",
    lastPaymentDate: "2026-08-08",
  },
  {
    id: "CR-203",
    customerName: "Ebenezer Construction Ltd",
    phone: "+233 20 444 8899",
    totalOwed: 8400.0,
    amountPaid: 3000.0,
    dueDate: "2026-08-12",
    reminderNote: "Urgent: Send MoMo reminder link for balance.",
    lastPaymentDate: "2026-07-28",
  },
];

export default function FinancialOverview() {
  // State
  const [timeframe, setTimeframe] = useState("This Month");
  const [activeTab, setActiveTab] = useState("profitability"); // 'profitability' | 'credit'
  const [productSearch, setProductSearch] = useState("");
  const [debtSearch, setDebtSearch] = useState("");
  const [products] = useState(INITIAL_PRODUCT_PROFITABILITY);
  const [creditAccounts, setCreditAccounts] = useState(INITIAL_CREDIT_ACCOUNTS);

  // Modal State for Recording Payments
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  // --- Financial Calculations ---
  const operationalExpenses = 2450.0; // Rent, utilities, staff allowances

  const totalProductRevenue = products.reduce(
    (sum, item) => sum + item.unitPrice * item.unitsSold,
    0,
  );

  const totalProductCost = products.reduce(
    (sum, item) => sum + item.unitCost * item.unitsSold,
    0,
  );

  const totalExpenditure = totalProductCost + operationalExpenses;
  const netProfit = totalProductRevenue - totalExpenditure;

  const totalCustomerCreditOwed = creditAccounts.reduce(
    (sum, acc) => sum + (acc.totalOwed - acc.amountPaid),
    0,
  );

  // Handle Recording New Customer Payment
  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!selectedAccount || !paymentAmount || parseFloat(paymentAmount) <= 0)
      return;

    const payVal = parseFloat(paymentAmount);

    setCreditAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === selectedAccount.id) {
          const newAmountPaid = acc.amountPaid + payVal;
          const remaining = acc.totalOwed - newAmountPaid;
          return {
            ...acc,
            amountPaid: newAmountPaid,
            lastPaymentDate: new Date().toISOString().split("T")[0],
            reminderNote:
              remaining <= 0
                ? "Account cleared in full."
                : paymentNote || acc.reminderNote,
          };
        }
        return acc;
      }),
    );

    // Reset Modal
    setSelectedAccount(null);
    setPaymentAmount("");
    setPaymentNote("");
  };

  // Filtered Lists
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase()),
  );

  const filteredDebts = creditAccounts.filter(
    (c) =>
      c.customerName.toLowerCase().includes(debtSearch.toLowerCase()) ||
      c.phone.includes(debtSearch),
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
              {products.reduce((a, b) => a + b.unitsSold, 0)} units
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
              Margin: {((netProfit / totalProductRevenue) * 100).toFixed(1)}%
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
              {creditAccounts.filter((a) => a.totalOwed > a.amountPaid).length}{" "}
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
                Showing item profit margins based on Vault stock cost
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
                  {filteredProducts.map((item) => {
                    const itemRevenue = item.unitPrice * item.unitsSold;
                    const itemCost = item.unitCost * item.unitsSold;
                    const itemProfit = itemRevenue - itemCost;
                    const margin = (itemProfit / itemRevenue) * 100;

                    return (
                      <tr key={item.id}>
                        <td>
                          <span className="item-name">{item.name}</span>
                          <span className="item-cat">{item.category}</span>
                        </td>
                        <td>${item.unitCost.toFixed(2)}</td>
                        <td>${item.unitPrice.toFixed(2)}</td>
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
                  })}
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
                  {filteredDebts.map((acc) => {
                    const remaining = acc.totalOwed - acc.amountPaid;
                    const isCleared = remaining <= 0;

                    return (
                      <tr key={acc.id}>
                        <td>
                          <span className="customer-title">
                            {acc.customerName}
                          </span>
                          <span className="customer-phone">{acc.phone}</span>
                        </td>
                        <td>${acc.totalOwed.toFixed(2)}</td>
                        <td className="paid-cell">
                          ${acc.amountPaid.toFixed(2)}
                        </td>
                        <td>
                          <span
                            className={`balance-badge ${isCleared ? "cleared" : "pending"}`}
                          >
                            ${remaining > 0 ? remaining.toFixed(2) : "0.00"}
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
                        <td>{acc.lastPaymentDate || "No payments yet"}</td>
                        <td>
                          {!isCleared ? (
                            <button
                              className="pay-action-btn"
                              onClick={() => setSelectedAccount(acc)}
                            >
                              <Plus size={14} /> Record Payment
                            </button>
                          ) : (
                            <span className="text-muted-cell">Cleared</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
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
                    ${selectedAccount.totalOwed.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="box-label">Already Paid</span>
                  <span className="box-val green-val">
                    ${selectedAccount.amountPaid.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="box-label">Current Owed</span>
                  <span className="box-val amber-val">
                    $
                    {(
                      selectedAccount.totalOwed - selectedAccount.amountPaid
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Amount Being Paid ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  max={selectedAccount.totalOwed - selectedAccount.amountPaid}
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
                  placeholder="e.g. Paid $500 cash today. Balance to be paid next Monday."
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
