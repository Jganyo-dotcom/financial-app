import React, { useState } from "react";
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
} from "lucide-react";
import "../css/SalesRegisterLedger.css";

const INITIAL_TRANSACTIONS = [
  {
    id: "TX-9041",
    time: "02:45 PM",
    date: "2026-08-10",
    customerName: "Kofi Mensah",
    itemsCount: 3,
    totalAmount: 485.0,
    paymentMethod: "Cash",
    status: "Completed",
    cashierName: "Emmanuel A.",
    tax: 24.25,
    items: [
      { name: "PVC Pipe 4-Inch (6m)", qty: 2, unitPrice: 45.0, cost: 30.0 },
      {
        name: "Emulsion Paint White (20L)",
        qty: 1,
        unitPrice: 395.0,
        cost: 290.0,
      },
    ],
  },
  {
    id: "TX-9040",
    time: "01:15 PM",
    date: "2026-08-10",
    customerName: "Ama Serwaa",
    itemsCount: 5,
    totalAmount: 1250.0,
    paymentMethod: "Mobile Money",
    status: "Completed",
    cashierName: "Emmanuel A.",
    tax: 62.5,
    items: [
      { name: "Cement Bag 50kg (32.5R)", qty: 10, unitPrice: 85.0, cost: 68.0 },
      {
        name: "Roofing Nails (1kg pack)",
        qty: 16,
        unitPrice: 25.0,
        cost: 16.0,
      },
    ],
  },
  {
    id: "TX-9039",
    time: "11:30 AM",
    date: "2026-08-10",
    customerName: "Kwame Asante",
    itemsCount: 1,
    totalAmount: 320.0,
    paymentMethod: "Cash",
    status: "Completed",
    cashierName: "Sarah K.",
    tax: 16.0,
    items: [
      {
        name: "High-Tensile Steel Rod 12mm",
        qty: 4,
        unitPrice: 80.0,
        cost: 58.0,
      },
    ],
  },
  {
    id: "TX-9038",
    time: "10:05 AM",
    date: "2026-08-10",
    customerName: "Walk-in Customer",
    itemsCount: 2,
    totalAmount: 90.0,
    paymentMethod: "Cash",
    status: "Completed",
    cashierName: "Sarah K.",
    tax: 4.5,
    items: [
      { name: "PVC Elbow Joint 4-Inch", qty: 6, unitPrice: 15.0, cost: 9.0 },
    ],
  },
];

export default function SalesRegisterLedger() {
  const [transactions] = useState(INITIAL_TRANSACTIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");

  // Drawer States
  const [selectedTx, setSelectedTx] = useState(null);
  const [isReconcileOpen, setIsReconcileOpen] = useState(false);

  // Reconciliation State
  const [physicalCashInput, setPhysicalCashInput] = useState("");
  const [reconciliationNote, setReconciliationNote] = useState("");
  const [shiftReconciliation, setShiftReconciliation] = useState({
    status: "Unreconciled",
    difference: 0,
    countedCash: null,
  });

  // Calculate Shift Totals
  const expectedCashInDrawer = transactions
    .filter((tx) => tx.paymentMethod === "Cash" && tx.status === "Completed")
    .reduce((sum, tx) => sum + tx.totalAmount, 0);

  const mobileMoneyReceived = transactions
    .filter(
      (tx) => tx.paymentMethod === "Mobile Money" && tx.status === "Completed",
    )
    .reduce((sum, tx) => sum + tx.totalAmount, 0);

  const handleReconcileSubmit = (e) => {
    e.preventDefault();
    const counted = parseFloat(physicalCashInput) || 0;
    const diff = counted - expectedCashInDrawer;

    setShiftReconciliation({
      status: diff === 0 ? "Balanced" : "Discrepancy",
      difference: diff,
      countedCash: counted,
    });

    setIsReconcileOpen(false);
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod =
      methodFilter === "All" || tx.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  return (
    <div className="sales-ledger-page">
      {/* Header */}
      <header className="page-header">
        <div>
          <h2>
            <Receipt className="title-icon" size={26} /> Sales & Cash Register
            Ledger
          </h2>
          <p>
            Track daily shift payments, cash flow, and perform register
            reconciliation.
          </p>
        </div>

        <button
          type="button"
          className="reconcile-trigger-btn"
          onClick={() => setIsReconcileOpen(true)}
        >
          <Scale size={18} /> Close & Reconcile Shift
        </button>
      </header>

      {/* Metrics */}
      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Expected Cash in Drawer</span>
            <div className="icon-wrapper green">
              <Banknote size={18} />
            </div>
          </div>
          <div className="metric-body">
            <h3>${expectedCashInDrawer.toFixed(2)}</h3>
            <span className="sub-text positive">
              Automated total from physical cash sales
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Mobile Money Received</span>
            <div className="icon-wrapper blue">
              <Smartphone size={18} />
            </div>
          </div>
          <div className="metric-body">
            <h3>${mobileMoneyReceived.toFixed(2)}</h3>
            <span className="sub-text blue-badge">
              Direct MoMo wallet settlement
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Shift Register Status</span>
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
              {shiftReconciliation.status === "Unreconciled" &&
                "Pending Closing"}
              {shiftReconciliation.status === "Balanced" && "Balanced ✓"}
              {shiftReconciliation.status === "Discrepancy" &&
                `${shiftReconciliation.difference > 0 ? "Overage" : "Shortage"}: $${Math.abs(
                  shiftReconciliation.difference,
                ).toFixed(2)}`}
            </h3>
            <span className="sub-text muted">
              {shiftReconciliation.status === "Unreconciled"
                ? "Shift active — physical cash count required at close"
                : `Counted Cash: $${shiftReconciliation.countedCash?.toFixed(2)}`}
            </span>
          </div>
        </div>
      </section>

      {/* Transactions Table */}
      <section className="ledger-card">
        <div className="ledger-toolbar">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search receipt # or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <Filter size={15} className="filter-icon" />
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
            >
              <option value="All">All Payment Methods</option>
              <option value="Cash">Cash</option>
              <option value="Mobile Money">Mobile Money</option>
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
                <th>Total Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td>
                    <span className="tx-id">{tx.id}</span>
                    <span className="tx-time">{tx.time}</span>
                  </td>
                  <td>
                    <span className="cust-name">{tx.customerName}</span>
                  </td>
                  <td>
                    <span className="item-count-badge">
                      {tx.itemsCount} items
                    </span>
                  </td>
                  <td className="amount-cell">${tx.totalAmount.toFixed(2)}</td>
                  <td>
                    <span
                      className={`method-chip ${
                        tx.paymentMethod === "Cash" ? "cash" : "momo"
                      }`}
                    >
                      {tx.paymentMethod === "Cash" ? (
                        <Banknote size={12} />
                      ) : (
                        <Smartphone size={12} />
                      )}
                      {tx.paymentMethod}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge success">
                      <CheckCircle2 size={12} /> {tx.status}
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
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SLIDE-OVER RECEIPT DRAWER */}
      {selectedTx && (
        <div className="receipt-overlay" onClick={() => setSelectedTx(null)}>
          <div className="receipt-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-title">
                <Receipt size={20} className="title-icon" />
                <div>
                  <h3>Receipt Details</h3>
                  <span className="drawer-sub">{selectedTx.id}</span>
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
                  <span className="meta-val">{selectedTx.customerName}</span>
                </div>
                <div>
                  <span className="meta-label">Date & Time</span>
                  <span className="meta-val">
                    {selectedTx.date} at {selectedTx.time}
                  </span>
                </div>
                <div>
                  <span className="meta-label">Cashier / Operator</span>
                  <span className="meta-val">{selectedTx.cashierName}</span>
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
                    {selectedTx.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.qty}</td>
                        <td>${item.unitPrice.toFixed(2)}</td>
                        <td className="right-align">
                          ${(item.qty * item.unitPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="receipt-summary-box">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>
                    ${(selectedTx.totalAmount - selectedTx.tax).toFixed(2)}
                  </span>
                </div>
                <div className="summary-row">
                  <span>Estimated Tax</span>
                  <span>${selectedTx.tax.toFixed(2)}</span>
                </div>
                <div className="summary-row total-row">
                  <span>Total Amount Paid</span>
                  <span>${selectedTx.totalAmount.toFixed(2)}</span>
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

      {/* END OF DAY RECONCILIATION MODAL */}
      {isReconcileOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsReconcileOpen(false)}
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Scale size={20} className="title-icon" />
                <h3>End-of-Day Register Reconciliation</h3>
              </div>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={() => setIsReconcileOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReconcileSubmit} className="reconcile-form">
              <div className="reconcile-comparison-box">
                <div>
                  <span className="box-label">Expected System Cash</span>
                  <span className="box-val">
                    ${expectedCashInDrawer.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="box-label">Mobile Money Wallet</span>
                  <span className="box-val blue-val">
                    ${mobileMoneyReceived.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Actual Physical Counted Cash ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Enter physical cash in till"
                  value={physicalCashInput}
                  onChange={(e) => setPhysicalCashInput(e.target.value)}
                  required
                />
              </div>

              {physicalCashInput !== "" && (
                <div
                  className={`discrepancy-calc-box ${
                    parseFloat(physicalCashInput) - expectedCashInDrawer === 0
                      ? "balanced"
                      : "discrepancy"
                  }`}
                >
                  {parseFloat(physicalCashInput) - expectedCashInDrawer ===
                  0 ? (
                    <span>
                      <CheckCircle2 size={16} /> Cash matches system count
                      perfectly!
                    </span>
                  ) : (
                    <span>
                      <AlertTriangle size={16} />{" "}
                      {parseFloat(physicalCashInput) - expectedCashInDrawer > 0
                        ? `Overage of +$${(
                            parseFloat(physicalCashInput) - expectedCashInDrawer
                          ).toFixed(2)}`
                        : `Shortage of -$${Math.abs(
                            parseFloat(physicalCashInput) -
                              expectedCashInDrawer,
                          ).toFixed(2)}`}
                    </span>
                  )}
                </div>
              )}

              <div className="form-group">
                <label>Notes / Explanations</label>
                <textarea
                  rows="3"
                  placeholder="Note any reasons for shortage or petty cash payouts..."
                  value={reconciliationNote}
                  onChange={(e) => setReconciliationNote(e.target.value)}
                ></textarea>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsReconcileOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="confirm-btn">
                  Complete Shift Closing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
