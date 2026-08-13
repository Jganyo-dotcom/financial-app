import React, { useState, useEffect, useCallback } from "react";
import {
  Banknote,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  X,
  Receipt,
  Printer,
  ChevronRight,
  Scale,
  Download,
  Users,
  CreditCard,
  UserCheck,
  ChevronLeft,
  DollarSign,
  FileSpreadsheet,
} from "lucide-react";
import "../css/SalesRegisterLedger.css";
import { API_BASE_URL } from "../components/apiEnpoint";

export default function SalesRegisterLedger() {
  // Navigation Tabs: 'ledger' | 'customers' | 'debtors'
  const [activeTab, setActiveTab] = useState("ledger");
  const token = localStorage.getItem("token");

  // Data States
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [debtors, setDebtors] = useState([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  // Drawer & Modal States
  const [selectedTx, setSelectedTx] = useState(null);
  const [spooledCustomer, setSpooledCustomer] = useState(null);
  const [isReconcileOpen, setIsReconcileOpen] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState(null);

  // Form Inputs
  const [physicalCashInput, setPhysicalCashInput] = useState("");
  const [reconciliationNote, setReconciliationNote] = useState("");
  const [debtRepaymentAmount, setDebtRepaymentAmount] = useState("");

  // Shift Reconciliation State
  const [shiftReconciliation, setShiftReconciliation] = useState({
    status: "Unreconciled",
    difference: 0,
    countedCash: null,
  });

  // --- API FETCH HANDLERS ---
  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/customer/?search=${encodeURIComponent(
          searchTerm,
        )}&method=${encodeURIComponent(
          methodFilter,
        )}&page=${currentPage}&limit=${itemsPerPage}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data = await response.json();

      // Extract transaction array matching backend response format
      const txList = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
          ? data.data
          : [];
      setTransactions(txList);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    }
  }, [searchTerm, methodFilter, currentPage, itemsPerPage, token]);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/directory`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch customers");
      const data = await response.json();

      if (Array.isArray(data)) {
        setCustomers(data);
      } else if (Array.isArray(data.customers)) {
        setCustomers(data.customers);
      } else if (Array.isArray(data.data)) {
        setCustomers(data.data);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
    }
  }, [token]);

  const fetchDebtors = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/debtors`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch debtors");
      const data = await response.json();

      if (Array.isArray(data)) {
        setDebtors(data);
      } else if (Array.isArray(data.debtors)) {
        setDebtors(data.debtors);
      } else if (Array.isArray(data.data)) {
        setDebtors(data.data);
      } else {
        setDebtors([]);
      }
    } catch (error) {
      console.error("Error fetching debtors:", error);
      setDebtors([]);
    }
  }, [token]);

  // Fetch transactions on search, filter, or page update
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Fetch initial directory data
  useEffect(() => {
    fetchCustomers();
    fetchDebtors();
  }, [fetchCustomers, fetchDebtors]);

  // --- SAFE METRICS CALCULATIONS ---
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const safeDebtors = Array.isArray(debtors) ? debtors : [];

  const expectedCashInDrawer = safeTransactions
    .filter(
      (tx) =>
        tx.paymentMethod === "Cash" &&
        (tx.paymentStatus === "Paid" || tx.status === "Completed"),
    )
    .reduce((sum, tx) => sum + (tx.amountPaid || tx.totalAmount || 0), 0);

  const mobileMoneyReceived = safeTransactions
    .filter((tx) => tx.paymentMethod === "Mobile Money")
    .reduce((sum, tx) => sum + (tx.amountPaid || 0), 0);

  const totalOutstandingDebt = safeDebtors.reduce(
    (sum, d) => sum + (d.totalOwing || d.amountOwe || 0),
    0,
  );

  // --- EVENT HANDLERS ---
  const handleReconcileSubmit = async (e) => {
    e.preventDefault();
    const counted = parseFloat(physicalCashInput) || 0;
    const diff = counted - expectedCashInDrawer;

    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/reconcile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          countedCash: counted,
          expectedCash: expectedCashInDrawer,
          note: reconciliationNote,
        }),
      });

      if (!response.ok) throw new Error("Reconciliation submission failed");

      setShiftReconciliation({
        status: diff === 0 ? "Balanced" : "Discrepancy",
        difference: diff,
        countedCash: counted,
      });

      setIsReconcileOpen(false);
      setPhysicalCashInput("");
      setReconciliationNote("");
    } catch (error) {
      console.error("Reconciliation error:", error);
    }
  };

  const handleDebtPayment = async (e) => {
    e.preventDefault();
    if (!selectedDebtor || !debtRepaymentAmount) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/pay-debt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId: selectedDebtor._id || selectedDebtor.id,
          customerName:
            selectedDebtor.customer?.fullName || selectedDebtor.customerName,
          paymentAmount: parseFloat(debtRepaymentAmount),
        }),
      });

      if (response.ok) {
        setSelectedDebtor(null);
        setDebtRepaymentAmount("");
        fetchTransactions();
        fetchCustomers();
        fetchDebtors();
      }
    } catch (error) {
      console.error("Error updating debt payment:", error);
    }
  };

  const exportToExcel = (dataList, filename) => {
    const list = Array.isArray(dataList) ? dataList : [];
    if (list.length === 0) return;

    const headers = Object.keys(list[0]).join(",");
    const rows = list.map((obj) =>
      Object.values(obj)
        .map((val) => {
          if (val === null || val === undefined) return '""';
          if (typeof val === "object") {
            return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
          }
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(","),
    );

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${filename}_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="sales-ledger-page">
      {/* Page Header */}
      <header className="page-header">
        <div>
          <h2>
            <Receipt className="title-icon" size={26} /> Sales Ledger & Customer
            Management
          </h2>
          <p>
            Track cash flow, customer purchases, outstanding debts, and register
            closing.
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="excel-export-btn"
            onClick={() =>
              exportToExcel(safeTransactions, "Sales_Transactions")
            }
          >
            <Download size={16} /> Export to Excel
          </button>
          <button
            type="button"
            className="reconcile-trigger-btn"
            onClick={() => setIsReconcileOpen(true)}
          >
            <Scale size={18} /> Close & Reconcile Shift
          </button>
        </div>
      </header>

      {/* Overview Metrics Cards */}
      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Expected Till Cash</span>
            <div className="icon-wrapper green">
              <Banknote size={18} />
            </div>
          </div>
          <div className="metric-body">
            <h3>GH₵{expectedCashInDrawer.toFixed(2)}</h3>
            <span className="sub-text positive">Cash transactions today</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Mobile Money Settled</span>
            <div className="icon-wrapper blue">
              <Smartphone size={18} />
            </div>
          </div>
          <div className="metric-body">
            <h3>GH₵{mobileMoneyReceived.toFixed(2)}</h3>
            <span className="sub-text blue-badge">Direct MoMo receipts</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Outstanding Debt</span>
            <div className="icon-wrapper red">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="metric-body">
            <h3 className="red-text">GH₵{totalOutstandingDebt.toFixed(2)}</h3>
            <span className="sub-text red-badge">
              {safeDebtors.length} customers owing
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Register Status</span>
            <div
              className={`icon-wrapper ${
                shiftReconciliation.status === "Balanced"
                  ? "green"
                  : shiftReconciliation.status === "Discrepancy"
                    ? "red"
                    : "amber"
              }`}
            >
              {shiftReconciliation.status === "Balanced" ? (
                <CheckCircle2 size={18} />
              ) : shiftReconciliation.status === "Discrepancy" ? (
                <AlertTriangle size={18} />
              ) : (
                <Clock size={18} />
              )}
            </div>
          </div>
          <div className="metric-body">
            <h3
              className={
                shiftReconciliation.status === "Balanced"
                  ? "green-text"
                  : shiftReconciliation.status === "Discrepancy"
                    ? "red-text"
                    : "amber-text"
              }
            >
              {shiftReconciliation.status === "Unreconciled" && "Pending Close"}
              {shiftReconciliation.status === "Balanced" && "Balanced ✓"}
              {shiftReconciliation.status === "Discrepancy" &&
                `${
                  shiftReconciliation.difference > 0 ? "Overage" : "Shortage"
                }: GH₵${Math.abs(shiftReconciliation.difference).toFixed(2)}`}
            </h3>
            <span className="sub-text muted">
              {shiftReconciliation.status === "Unreconciled"
                ? "Physical count needed"
                : `Counted: GH₵${(shiftReconciliation.countedCash || 0).toFixed(
                    2,
                  )}`}
            </span>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "ledger" ? "active" : ""}`}
          onClick={() => setActiveTab("ledger")}
        >
          <Receipt size={16} /> Sales Ledger
        </button>
        <button
          className={`tab-btn ${activeTab === "customers" ? "active" : ""}`}
          onClick={() => setActiveTab("customers")}
        >
          <Users size={16} /> Customers & Items Bought ({safeCustomers.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "debtors" ? "active" : ""}`}
          onClick={() => setActiveTab("debtors")}
        >
          <CreditCard size={16} /> Debtors / Owing ({safeDebtors.length})
        </button>
      </div>

      {/* TAB 1: SALES LEDGER */}
      {activeTab === "ledger" && (
        <section className="ledger-card">
          <div className="ledger-toolbar">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search receipt # or customer name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="filter-group">
              <Filter size={15} className="filter-icon" />
              <select
                value={methodFilter}
                onChange={(e) => {
                  setMethodFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Payment Methods</option>
                <option value="Cash">Cash</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Credit / Owing">Credit / Owing</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Time & Receipt #</th>
                  <th>Customer</th>
                  <th>Items Count</th>
                  <th>Total</th>
                  <th>Paid / Owing</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {safeTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      No sales transactions found.
                    </td>
                  </tr>
                ) : (
                  safeTransactions.map((tx) => {
                    const txId = tx._id || tx.id;
                    const customerName =
                      tx.customer?.fullName || tx.customerName || "Walk-in";
                    const itemCount = tx.items?.length || tx.itemsCount || 0;
                    const amountOwe = tx.amountOwe ?? tx.amountOwing ?? 0;
                    const status = tx.paymentStatus || tx.status || "Paid";
                    const txTime = tx.createdAt
                      ? new Date(tx.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : tx.time;

                    return (
                      <tr key={txId}>
                        <td>
                          <span className="tx-id">#{txId.slice(-6)}</span>
                          <span className="tx-time">{txTime}</span>
                        </td>
                        <td>
                          <span className="cust-name">{customerName}</span>
                        </td>
                        <td>
                          <span className="item-count-badge">
                            {itemCount} items
                          </span>
                        </td>
                        <td className="amount-cell">
                          GH₵{(tx.totalAmount || 0).toFixed(2)}
                        </td>
                        <td>
                          <span className="paid-val">
                            GH₵{(tx.amountPaid || 0).toFixed(2)}
                          </span>{" "}
                          /{" "}
                          <span className="owing-val">
                            GH₵{amountOwe.toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`method-chip ${
                              tx.paymentMethod === "Cash"
                                ? "cash"
                                : tx.paymentMethod === "Mobile Money"
                                  ? "momo"
                                  : "credit"
                            }`}
                          >
                            {tx.paymentMethod === "Cash" ? (
                              <Banknote size={12} />
                            ) : tx.paymentMethod === "Mobile Money" ? (
                              <Smartphone size={12} />
                            ) : (
                              <CreditCard size={12} />
                            )}
                            {tx.paymentMethod}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${
                              status === "Paid" || status === "Completed"
                                ? "success"
                                : status === "Partially Paid"
                                  ? "warning"
                                  : "danger"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="view-receipt-btn"
                            onClick={() => setSelectedTx(tx)}
                          >
                            Receipt <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="pagination-bar">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="pagination-buttons">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: CUSTOMERS DIRECTORY & ITEM PURCHASES */}
      {activeTab === "customers" && (
        <section className="ledger-card">
          <div className="ledger-toolbar">
            <h3>Customer Database & Purchase Summaries</h3>
            <button
              type="button"
              className="excel-export-btn"
              onClick={() =>
                exportToExcel(safeCustomers, "Customer_Purchase_Summary")
              }
            >
              <FileSpreadsheet size={16} /> Export Customers
            </button>
          </div>

          <div className="table-responsive">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Phone</th>
                  <th>Total Orders</th>
                  <th>Total Spent</th>
                  <th>Current Owing</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {safeCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No customer records found.
                    </td>
                  </tr>
                ) : (
                  safeCustomers.map((c, i) => {
                    const cName = c.fullName || c.customerName || "N/A";
                    const owing = c.totalOwing || c.amountOwe || 0;
                    return (
                      <tr key={c._id || c.id || i}>
                        <td className="cust-name">{cName}</td>
                        <td>{c.phone || "N/A"}</td>
                        <td>{c.totalPurchases || 1} orders</td>
                        <td className="amount-cell">
                          GH₵{(c.totalSpent || 0).toFixed(2)}
                        </td>
                        <td
                          className={
                            owing > 0 ? "red-text font-bold" : "green-text"
                          }
                        >
                          GH₵{owing.toFixed(2)}
                        </td>
                        <td>
                          <button
                            className="spool-btn"
                            onClick={() => setSpooledCustomer(c)}
                          >
                            <UserCheck size={14} /> Spool History
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 3: DEBTORS / OWING MANAGEMENT */}
      {activeTab === "debtors" && (
        <section className="ledger-card">
          <div className="ledger-toolbar">
            <h3>Debtors Register (Unpaid & Partial Credit Sales)</h3>
            <button
              type="button"
              className="excel-export-btn"
              onClick={() => exportToExcel(safeDebtors, "Debtors_Ledger")}
            >
              <Download size={16} /> Export Debtors
            </button>
          </div>

          <div className="table-responsive">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Debtor Name</th>
                  <th>Phone Number</th>
                  <th>Unpaid Bills Count</th>
                  <th>Total Amount Owing</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {safeDebtors.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No customer is currently owing. All accounts balanced!
                    </td>
                  </tr>
                ) : (
                  safeDebtors.map((d, index) => {
                    const debtorName =
                      d.customer?.fullName || d.customerName || "N/A";
                    const owingAmount = d.totalOwing || d.amountOwe || 0;
                    return (
                      <tr key={d._id || d.id || index}>
                        <td className="cust-name">{debtorName}</td>
                        <td>{d.phone || d.customer?.phone || "N/A"}</td>
                        <td>{d.pendingTransactions?.length || 1} bills</td>
                        <td className="amount-cell red-text">
                          GH₵{owingAmount.toFixed(2)}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="pay-debt-btn"
                            onClick={() => {
                              setSelectedDebtor(d);
                              setDebtRepaymentAmount(
                                owingAmount > 0 ? owingAmount.toString() : "",
                              );
                            }}
                          >
                            <DollarSign size={14} /> Record Repayment
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SLIDE-OVER RECEIPT DRAWER */}
      {selectedTx && (
        <div className="receipt-overlay" onClick={() => setSelectedTx(null)}>
          <div className="receipt-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-title">
                <Receipt size={20} className="title-icon" />
                <div>
                  <h3>Receipt Details</h3>
                  <span className="drawer-sub">
                    #{selectedTx._id || selectedTx.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={() => setSelectedTx(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body">
              <div className="receipt-meta-grid">
                <div>
                  <span className="meta-label">Customer</span>
                  <span className="meta-val">
                    {selectedTx.customer?.fullName ||
                      selectedTx.customerName ||
                      "Walk-in"}
                  </span>
                </div>
                <div>
                  <span className="meta-label">Date & Time</span>
                  <span className="meta-val">
                    {selectedTx.createdAt
                      ? new Date(selectedTx.createdAt).toLocaleString()
                      : `${selectedTx.date} ${selectedTx.time}`}
                  </span>
                </div>
                <div>
                  <span className="meta-label">Payment Channel</span>
                  <span className="meta-val highlight">
                    {selectedTx.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="itemized-section">
                <h4>Purchased Items</h4>
                <table className="receipt-items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th className="right-align">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedTx.items || []).map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name || item.product?.name}</td>
                        <td>{item.qty}</td>
                        <td>GH₵{(item.unitPrice || 0).toFixed(2)}</td>
                        <td className="right-align">
                          GH₵
                          {((item.qty || 0) * (item.unitPrice || 0)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="receipt-summary-box">
                <div className="summary-row">
                  <span>Total Amount</span>
                  <span>GH₵{(selectedTx.totalAmount || 0).toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Amount Paid</span>
                  <span className="green-text">
                    GH₵{(selectedTx.amountPaid || 0).toFixed(2)}
                  </span>
                </div>
                <div className="summary-row total-row">
                  <span>Balance / Owing</span>
                  <span
                    className={
                      (selectedTx.amountOwe || selectedTx.amountOwing || 0) > 0
                        ? "red-text"
                        : ""
                    }
                  >
                    GH₵
                    {(
                      selectedTx.amountOwe ??
                      selectedTx.amountOwing ??
                      0
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="drawer-footer">
              <button
                type="button"
                className="print-btn"
                onClick={() => window.print()}
              >
                <Printer size={16} /> Print Receipt Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SPOOLED CUSTOMER HISTORY DRAWER */}
      {spooledCustomer && (
        <div
          className="receipt-overlay"
          onClick={() => setSpooledCustomer(null)}
        >
          <div
            className="receipt-drawer customer-spool-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <h3>
                Customer Statement:{" "}
                {spooledCustomer.fullName || spooledCustomer.customerName}
              </h3>
              <button
                className="close-drawer-btn"
                onClick={() => setSpooledCustomer(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body">
              <div className="spool-summary">
                <p>Phone: {spooledCustomer.phone || "N/A"}</p>
                <p>Total Orders: {spooledCustomer.totalPurchases || 1}</p>
                <p>
                  Total Spent: GH₵{(spooledCustomer.totalSpent || 0).toFixed(2)}
                </p>
                <p>
                  Outstanding Debt: GH₵
                  {(
                    spooledCustomer.totalOwing ||
                    spooledCustomer.amountOwe ||
                    0
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECONCILIATION MODAL */}
      {isReconcileOpen && (
        <div
          className="receipt-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
          }}
          onClick={() => setIsReconcileOpen(false)}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: "#1e293b",
              padding: "24px",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "460px",
              color: "#fff",
              border: "1px solid #334155",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.2rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Scale size={20} style={{ color: "#10b981" }} /> Close Register
                & Reconcile Shift
              </h3>
              <button
                type="button"
                onClick={() => setIsReconcileOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReconcileSubmit}>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "0.85rem",
                    color: "#cbd5e1",
                  }}
                >
                  Physical Cash Counted (GH₵) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={physicalCashInput}
                  onChange={(e) => setPhysicalCashInput(e.target.value)}
                  placeholder="Enter total cash counted in till"
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "0.85rem",
                    color: "#cbd5e1",
                  }}
                >
                  Reconciliation Note (Optional)
                </label>
                <textarea
                  rows="3"
                  value={reconciliationNote}
                  onChange={(e) => setReconciliationNote(e.target.value)}
                  placeholder="Notes on overages, shortages, or shift details..."
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                    resize: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsReconcileOpen(false)}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "#334155",
                    color: "#cbd5e1",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Submit Reconciliation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD DEBT REPAYMENT MODAL */}
      {selectedDebtor && (
        <div
          className="receipt-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
          }}
          onClick={() => setSelectedDebtor(null)}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: "#1e293b",
              padding: "24px",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "460px",
              color: "#fff",
              border: "1px solid #334155",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                borderBottom: "1px solid #334155",
                paddingBottom: "12px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.2rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <DollarSign size={20} style={{ color: "#10b981" }} /> Record
                Debt Repayment
              </h3>
              <button
                type="button"
                onClick={() => setSelectedDebtor(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Debtor Details Card */}
            <div
              style={{
                backgroundColor: "#0f172a",
                padding: "14px 16px",
                borderRadius: "10px",
                marginBottom: "18px",
                border: "1px solid #334155",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "1.05rem",
                  color: "#38bdf8",
                }}
              >
                {selectedDebtor.customer?.fullName ||
                  selectedDebtor.customerName ||
                  "Customer"}
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#94a3b8",
                  marginTop: "2px",
                }}
              >
                Phone:{" "}
                {selectedDebtor.phone ||
                  selectedDebtor.customer?.phone ||
                  "N/A"}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "12px",
                  paddingTop: "10px",
                  borderTop: "1px dashed #334155",
                }}
              >
                <span style={{ fontSize: "0.85rem", color: "#f87171" }}>
                  Total Outstanding Debt:
                </span>
                <span
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    color: "#ef4444",
                  }}
                >
                  GH₵
                  {(
                    selectedDebtor.totalOwing ||
                    selectedDebtor.amountOwe ||
                    0
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={handleDebtPayment}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "0.85rem",
                    color: "#cbd5e1",
                    fontWeight: "500",
                  }}
                >
                  Repayment Amount (GH₵) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={debtRepaymentAmount}
                  onChange={(e) => setDebtRepaymentAmount(e.target.value)}
                  placeholder="Enter amount paid"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
                {debtRepaymentAmount &&
                  !isNaN(parseFloat(debtRepaymentAmount)) && (
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "0.8rem",
                        color:
                          (selectedDebtor.totalOwing ||
                            selectedDebtor.amountOwe ||
                            0) -
                            parseFloat(debtRepaymentAmount) <=
                          0
                            ? "#10b981"
                            : "#f59e0b",
                      }}
                    >
                      Remaining Balance After Payment: GH₵
                      {Math.max(
                        0,
                        (selectedDebtor.totalOwing ||
                          selectedDebtor.amountOwe ||
                          0) - parseFloat(debtRepaymentAmount),
                      ).toFixed(2)}
                    </div>
                  )}
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "24px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedDebtor(null)}
                  style={{
                    padding: "10px 18px",
                    backgroundColor: "#334155",
                    color: "#cbd5e1",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  Submit Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
