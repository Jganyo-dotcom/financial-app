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
  Loader2,
  ArrowRight,
  Sparkles,
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

  // Loading States
  const [isTxLoading, setIsTxLoading] = useState(false);
  const [isCustomersLoading, setIsCustomersLoading] = useState(false);
  const [isDebtorsLoading, setIsDebtorsLoading] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");

  // Ledger Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  // Customer Pagination State
  const [customerPage, setCustomerPage] = useState(1);
  const customerItemsPerPage = 5;

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
    setIsTxLoading(true);
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
    } finally {
      setIsTxLoading(false);
    }
  }, [searchTerm, methodFilter, currentPage, itemsPerPage, token]);

  const fetchCustomers = useCallback(async () => {
    setIsCustomersLoading(true);
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
    } finally {
      setIsCustomersLoading(false);
    }
  }, [token]);

  const fetchDebtors = useCallback(async () => {
    setIsDebtorsLoading(true);
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
    } finally {
      setIsDebtorsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    fetchCustomers();
    fetchDebtors();
  }, [fetchCustomers, fetchDebtors]);

  // --- SAFE METRICS & FILTERED DATA CALCULATIONS ---
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const safeDebtors = Array.isArray(debtors) ? debtors : [];

  // Filter customers based on search term (Name or Phone)
  const filteredCustomers = safeCustomers.filter((c) => {
    const name = (c.fullName || c.customerName || "").toLowerCase();
    const phone = (c.phone || "").toLowerCase();
    const query = customerSearchTerm.toLowerCase();
    return name.includes(query) || phone.includes(query);
  });

  // Customer Pagination Calculations
  const totalCustomerPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / customerItemsPerPage),
  );
  const paginatedCustomers = filteredCustomers.slice(
    (customerPage - 1) * customerItemsPerPage,
    customerPage * customerItemsPerPage,
  );

  const expectedCashInDrawer = safeTransactions
    .filter((tx) => tx.paymentMethod === "Cash")
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
    if (isReconciling) return;

    setIsReconciling(true);
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
    } finally {
      setIsReconciling(false);
    }
  };

  const handleDebtPayment = async (e) => {
    e.preventDefault();
    if (!selectedDebtor || !debtRepaymentAmount || isSubmittingPayment) return;

    setIsSubmittingPayment(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/customer/${
          selectedDebtor._id || selectedDebtor.id
        }/pay-debt`,
        {
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
        },
      );

      if (response.ok) {
        setSelectedDebtor(null);
        setDebtRepaymentAmount("");
        fetchTransactions();
        fetchCustomers();
        fetchDebtors();
      }
    } catch (error) {
      console.error("Error updating debt payment:", error);
    } finally {
      setIsSubmittingPayment(false);
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

  // --- LIVE CALCULATION FOR DEBT REPAYMENT ---
  const currentDebtorOwing = selectedDebtor
    ? selectedDebtor.totalOwing || selectedDebtor.amountOwe || 0
    : 0;
  const parsedRepaymentInput = parseFloat(debtRepaymentAmount) || 0;
  const remainingDebtCalc = Math.max(
    0,
    currentDebtorOwing - parsedRepaymentInput,
  );
  const overpaidCalc =
    parsedRepaymentInput > currentDebtorOwing
      ? parsedRepaymentInput - currentDebtorOwing
      : 0;

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
            disabled={isTxLoading}
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
                {isTxLoading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "8px",
                          color: "#6b7280",
                        }}
                      >
                        <Loader2 className="animate-spin" size={20} /> Loading
                        transactions...
                      </div>
                    </td>
                  </tr>
                ) : safeTransactions.length === 0 ? (
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

          {/* Ledger Pagination */}
          <div className="pagination-bar">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="pagination-buttons">
              <button
                disabled={currentPage === 1 || isTxLoading}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                disabled={currentPage >= totalPages || isTxLoading}
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
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div className="search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search customer name or phone..."
                  value={customerSearchTerm}
                  onChange={(e) => {
                    setCustomerSearchTerm(e.target.value);
                    setCustomerPage(1);
                  }}
                />
              </div>

              <button
                type="button"
                className="excel-export-btn"
                disabled={isCustomersLoading}
                onClick={() =>
                  exportToExcel(filteredCustomers, "Customer_Purchase_Summary")
                }
              >
                <FileSpreadsheet size={16} /> Export Customers
              </button>
            </div>
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
                {isCustomersLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "8px",
                          color: "#6b7280",
                        }}
                      >
                        <Loader2 className="animate-spin" size={20} /> Loading
                        customer records...
                      </div>
                    </td>
                  </tr>
                ) : paginatedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No matching customer records found.
                    </td>
                  </tr>
                ) : (
                  paginatedCustomers.map((c, i) => {
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

          {/* Customer Directory Pagination */}
          <div className="pagination-bar">
            <span>
              Page {customerPage} of {totalCustomerPages}
            </span>
            <div className="pagination-buttons">
              <button
                disabled={customerPage === 1 || isCustomersLoading}
                onClick={() => setCustomerPage((prev) => Math.max(prev - 1, 1))}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                disabled={
                  customerPage >= totalCustomerPages || isCustomersLoading
                }
                onClick={() =>
                  setCustomerPage((prev) =>
                    Math.min(prev + 1, totalCustomerPages),
                  )
                }
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
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
              disabled={isDebtorsLoading}
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
                {isDebtorsLoading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "8px",
                          color: "#6b7280",
                        }}
                      >
                        <Loader2 className="animate-spin" size={20} /> Loading
                        debtors list...
                      </div>
                    </td>
                  </tr>
                ) : safeDebtors.length === 0 ? (
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
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => !isReconciling && setIsReconcileOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "28px",
              borderRadius: "16px",
              maxWidth: "460px",
              width: "92%",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              border: "1px solid #e5e7eb",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div
                  style={{
                    backgroundColor: "#eff6ff",
                    padding: "10px",
                    borderRadius: "10px",
                    color: "#2563eb",
                  }}
                >
                  <Scale size={22} />
                </div>
                <div>
                  <h3
                    style={{ margin: 0, fontSize: "1.15rem", color: "#111827" }}
                  >
                    Shift Reconciliation
                  </h3>
                  <span style={{ fontSize: "0.82rem", color: "#6b7280" }}>
                    Verify cash count before register close
                  </span>
                </div>
              </div>
              <button
                disabled={isReconciling}
                style={{
                  border: "none",
                  background: "#f3f4f6",
                  padding: "6px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  color: "#4b5563",
                }}
                onClick={() => setIsReconcileOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReconcileSubmit}>
              <div
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px dashed #cbd5e1",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "20px",
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                  Expected Cash in Till
                </span>
                <h2
                  style={{
                    margin: "4px 0 0 0",
                    color: "#10b981",
                    fontSize: "1.8rem",
                  }}
                >
                  GH₵{expectedCashInDrawer.toFixed(2)}
                </h2>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "600",
                    fontSize: "0.88rem",
                    color: "#374151",
                  }}
                >
                  Physical Cash Counted (GH₵)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  disabled={isReconciling}
                  value={physicalCashInput}
                  onChange={(e) => setPhysicalCashInput(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "1rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "600",
                    fontSize: "0.88rem",
                    color: "#374151",
                  }}
                >
                  Shift Notes / Discrepancy Reason
                </label>
                <textarea
                  rows="3"
                  placeholder="Explain any difference between counted and expected cash..."
                  disabled={isReconciling}
                  value={reconciliationNote}
                  onChange={(e) => setReconciliationNote(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                    resize: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  disabled={isReconciling}
                  onClick={() => setIsReconcileOpen(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    color: "#374151",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReconciling}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#2563eb",
                    color: "#ffffff",
                    fontWeight: "600",
                    cursor: isReconciling ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    opacity: isReconciling ? 0.75 : 1,
                  }}
                >
                  {isReconciling ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />{" "}
                      Reconciling...
                    </>
                  ) : (
                    "Submit & Reconcile"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD DEBT REPAYMENT MODAL (WITH REAL-TIME KEYPRESS CALCULATION) */}
      {selectedDebtor && (
        <div
          className="receipt-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => !isSubmittingPayment && setSelectedDebtor(null)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "28px",
              borderRadius: "16px",
              maxWidth: "440px",
              width: "92%",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              border: "1px solid #e5e7eb",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div
                  style={{
                    backgroundColor: "#ecfdf5",
                    padding: "10px",
                    borderRadius: "10px",
                    color: "#10b981",
                  }}
                >
                  <DollarSign size={22} />
                </div>
                <div>
                  <h3
                    style={{ margin: 0, fontSize: "1.15rem", color: "#111827" }}
                  >
                    Record Debt Repayment
                  </h3>
                  <span style={{ fontSize: "0.82rem", color: "#6b7280" }}>
                    {selectedDebtor.customer?.fullName ||
                      selectedDebtor.customerName ||
                      "Customer"}
                  </span>
                </div>
              </div>
              <button
                disabled={isSubmittingPayment}
                style={{
                  border: "none",
                  background: "#f3f4f6",
                  padding: "6px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  color: "#4b5563",
                }}
                onClick={() => setSelectedDebtor(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDebtPayment}>
              {/* Input Repayment Amount */}
              <div style={{ marginBottom: "18px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "600",
                    fontSize: "0.88rem",
                    color: "#374151",
                  }}
                >
                  Repayment Amount Received (GH₵)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  disabled={isSubmittingPayment}
                  value={debtRepaymentAmount}
                  onChange={(e) => setDebtRepaymentAmount(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* REAL-TIME CALCULATION BOARD */}
              <div
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                    fontSize: "0.88rem",
                    color: "#64748b",
                  }}
                >
                  <span>Total Current Debt:</span>
                  <span style={{ fontWeight: "700", color: "#ef4444" }}>
                    GH₵{currentDebtorOwing.toFixed(2)}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                    fontSize: "0.88rem",
                    color: "#64748b",
                  }}
                >
                  <span>Payment Applied:</span>
                  <span style={{ fontWeight: "700", color: "#10b981" }}>
                    - GH₵{parsedRepaymentInput.toFixed(2)}
                  </span>
                </div>

                <div
                  style={{
                    borderTop: "1px dashed #cbd5e1",
                    paddingTop: "10px",
                    marginTop: "6px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "600",
                      fontSize: "0.92rem",
                      color: "#1e293b",
                    }}
                  >
                    Remaining Balance:
                  </span>
                  <span
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: "800",
                      color: remainingDebtCalc === 0 ? "#10b981" : "#d97706",
                    }}
                  >
                    GH₵{remainingDebtCalc.toFixed(2)}
                  </span>
                </div>

                {/* Overpayment Notice */}
                {overpaidCalc > 0 && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      backgroundColor: "#fef3c7",
                      color: "#92400e",
                      fontSize: "0.82rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Sparkles size={14} /> Change / Overpayment to return:{" "}
                    <strong>GH₵{overpaidCalc.toFixed(2)}</strong>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  disabled={isSubmittingPayment}
                  onClick={() => setSelectedDebtor(null)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    color: "#374151",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#10b981",
                    color: "#ffffff",
                    fontWeight: "600",
                    cursor: isSubmittingPayment ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    opacity: isSubmittingPayment ? 0.75 : 1,
                  }}
                >
                  {isSubmittingPayment ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />{" "}
                      Processing...
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
    </div>
  );
}
