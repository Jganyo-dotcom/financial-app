import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Database,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Users,
  AlertCircle,
  Plus,
  X,
  ShoppingBag,
  Pencil,
  CreditCard,
  Receipt,
  DollarSign,
} from "lucide-react";
import "../css/CustomerEntry.css";

import { API_BASE_URL } from "../components/apiEnpoint";

export default function CustomerEntry() {
  const token = localStorage.getItem("token");

  // --- State Management ---
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [toast, setToast] = useState(null);

  // Pencil edit state for Amount Paid
  const [isEditingAmount, setIsEditingAmount] = useState(false);

  // Dynamic Products State
  const [products, setProducts] = useState([]);

  // Multi-Product Basket State
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [basket, setBasket] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    amountSpent: "", // Amount actually paid / entered
    paymentMethod: "Cash",
    customerType: "Walk-in",
    email: "",
    address: "",
    notes: "",
  });

  // Staged Queue State
  const [stagedCustomers, setStagedCustomers] = useState([]);

  // --- Payment Modal State ---
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCustomerForPayment, setSelectedCustomerForPayment] =
    useState(null);
  const [paymentRecord, setPaymentRecord] = useState({
    amount: "",
    method: "Cash",
    notes: "",
  });

  // --- Fetch Products from Backend on Mount ---
  useEffect(() => {
    const fetchInventoryProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/product/products`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await response.json();

        if (response.ok) {
          const fetchedData = Array.isArray(result)
            ? result
            : result.products || result.data || [];
          setProducts(fetchedData);
        } else {
          showToastNotification(
            result.message || "Failed to load products from database.",
            "error",
          );
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        showToastNotification(
          "Unable to reach backend server for products.",
          "error",
        );
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchInventoryProducts();
  }, [token]);

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Recalculate auto-total helper
  const updateAutoTotal = (updatedBasket) => {
    const newTotal = updatedBasket.reduce(
      (sum, item) => sum + item.qty * item.unitPrice,
      0,
    );
    if (!isEditingAmount) {
      setFormData((prev) => ({
        ...prev,
        amountSpent: newTotal ? newTotal.toFixed(2) : "",
      }));
    }
  };

  // Add Item to Basket
  const handleAddItemToBasket = () => {
    if (!selectedProductId) return;

    const selectedItem = products.find(
      (p) => (p._id || p.id) === selectedProductId,
    );
    if (!selectedItem) return;

    const productId = selectedItem._id || selectedItem.id;
    const existingIndex = basket.findIndex((i) => i.id === productId);
    let updatedBasket = [...basket];

    if (existingIndex > -1) {
      updatedBasket[existingIndex] = {
        ...updatedBasket[existingIndex],
        qty: updatedBasket[existingIndex].qty + parseInt(quantity, 10),
      };
    } else {
      updatedBasket.push({
        id: productId,
        product: productId,
        name: selectedItem.name || selectedItem.title || "Product",
        qty: parseInt(quantity, 10),
        unitPrice: Number(selectedItem.unitPrice || selectedItem.price || 0),
      });
    }

    setBasket(updatedBasket);
    updateAutoTotal(updatedBasket);

    // Reset selector
    setSelectedProductId("");
    setQuantity(1);
  };

  // Remove Item from Basket
  const handleRemoveFromBasket = (productId) => {
    const updatedBasket = basket.filter((item) => item.id !== productId);
    setBasket(updatedBasket);
    updateAutoTotal(updatedBasket);
  };

  // Trigger Toast Alert
  const showToastNotification = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Calculations for current form entry
  const currentBasketTotal = basket.reduce(
    (sum, item) => sum + item.qty * item.unitPrice,
    0,
  );
  const currentAmountPaid = parseFloat(formData.amountSpent || 0);
  const currentBalance = currentBasketTotal - currentAmountPaid;

  // Add Customer to Queue
  const handleAddToStage = (e) => {
    e.preventDefault();

    if (
      !formData.fullName.trim() ||
      !formData.phone.trim() ||
      formData.amountSpent === ""
    ) {
      showToastNotification("Please fill in Name, Phone, and Amount.", "error");
      return;
    }

    const newStagedCustomer = {
      id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      ...formData,
      items: basket,
      amountSpent: currentAmountPaid, // Amount Paid by customer
      totalAmount: parseFloat(currentBasketTotal.toFixed(2)),
      amountOwe: currentBalance > 0 ? parseFloat(currentBalance.toFixed(2)) : 0,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setStagedCustomers((prev) => [newStagedCustomer, ...prev]);

    // Reset Form & Basket
    setFormData({
      fullName: "",
      phone: "",
      amountSpent: "",
      paymentMethod: "Cash",
      customerType: "Walk-in",
      email: "",
      address: "",
      notes: "",
    });
    setBasket([]);
    setIsEditingAmount(false);

    showToastNotification(
      `Added ${newStagedCustomer.fullName} to review queue!`,
    );
  };

  // Remove Customer from Queue
  const handleRemoveStaged = (id) => {
    setStagedCustomers((prev) => prev.filter((item) => item.id !== id));
    showToastNotification("Customer removed from review queue.", "error");
  };

  // Open Record Payment Modal
  const handleOpenPaymentModal = (customer) => {
    setSelectedCustomerForPayment(customer);
    setPaymentRecord({
      amount: customer.amountOwe > 0 ? customer.amountOwe.toString() : "",
      method: "Cash",
      notes: "",
    });
    setIsPaymentModalOpen(true);
  };

  // Close Record Payment Modal
  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedCustomerForPayment(null);
  };

  // Submit Additional Payment
  const handleSaveRecordedPayment = (e) => {
    e.preventDefault();
    if (!selectedCustomerForPayment) return;

    const addedAmount = parseFloat(paymentRecord.amount);
    if (isNaN(addedAmount) || addedAmount <= 0) {
      showToastNotification("Please enter a valid payment amount.", "error");
      return;
    }

    setStagedCustomers((prev) =>
      prev.map((cust) => {
        if (cust.id === selectedCustomerForPayment.id) {
          const newAmountPaid = cust.amountSpent + addedAmount;
          const newAmountOwe = Math.max(0, cust.totalAmount - newAmountPaid);
          const updatedNotes = paymentRecord.notes
            ? `${cust.notes ? cust.notes + " | " : ""}Paid GH₵${addedAmount.toFixed(
                2,
              )} via ${paymentRecord.method}: ${paymentRecord.notes}`
            : cust.notes;

          return {
            ...cust,
            amountSpent: parseFloat(newAmountPaid.toFixed(2)),
            amountOwe: parseFloat(newAmountOwe.toFixed(2)),
            paymentMethod: paymentRecord.method,
            notes: updatedNotes,
          };
        }
        return cust;
      }),
    );

    showToastNotification(
      `Recorded payment of GH₵${addedAmount.toFixed(2)} for ${
        selectedCustomerForPayment.fullName
      }!`,
    );

    handleClosePaymentModal();
  };

  // Bulk Database Sync
  const handleSyncDatabase = async () => {
    if (stagedCustomers.length === 0) {
      showToastNotification("No staged records to sync!", "error");
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ customers: stagedCustomers }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to sync records.");
      }

      showToastNotification(
        `Successfully synced ${stagedCustomers.length} record(s) to Database!`,
        "success",
      );
      setStagedCustomers([]);
    } catch (err) {
      console.error("Sync Error:", err);
      showToastNotification(err.message || "Database sync failed.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const totalStagedRevenue = stagedCustomers.reduce(
    (sum, item) => sum + (item.amountSpent || 0),
    0,
  );

  return (
    <div className="customer-entry-page dark-theme">
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === "success" ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <header className="page-header">
        <div>
          <h2>
            <UserPlus className="title-icon" size={26} /> Customer Sales Entry
          </h2>
          <p>
            Record customer purchases and sync them to your central database.
          </p>
        </div>

        <div className="header-stats">
          <div className="stat-pill">
            <span className="pill-label">Staged Queue</span>
            <span className="pill-value">{stagedCustomers.length} Users</span>
          </div>
          <div className="stat-pill highlight">
            <span className="pill-label">Total Amount Paid</span>
            <span className="pill-value">
              GH₵{totalStagedRevenue.toFixed(2)}
            </span>
          </div>
        </div>
      </header>

      {/* Form Section */}
      <section className="form-card dark-card">
        <div className="card-header">
          <h3>New Purchase Entry</h3>
          <span className="badge">Primary Fields</span>
        </div>

        <form onSubmit={handleAddToStage} className="customer-form">
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="fullName"
                  placeholder="e.g. Ama Serwaa"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <div className="input-wrapper">
                <Phone size={16} className="input-icon" />
                <input
                  type="text"
                  name="phone"
                  placeholder="+233 XX XXX XXXX"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Product Selection */}
          <div className="form-group vault-section">
            <label>
              <ShoppingBag size={15} /> Select Purchased Items
            </label>
            <div className="vault-picker-row">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="vault-dropdown"
                disabled={isLoadingProducts || products.length === 0}
              >
                <option value="">
                  {isLoadingProducts
                    ? "Loading products from backend..."
                    : products.length === 0
                      ? "No products found in database"
                      : "-- Choose item from Inventory --"}
                </option>
                {products.map((prod) => {
                  const pId = prod._id || prod.id;
                  const price = Number(prod.unitPrice || prod.price || 0);
                  return (
                    <option key={pId} value={pId}>
                      {prod.name || prod.title} (GH₵{price.toFixed(2)})
                    </option>
                  );
                })}
              </select>

              <div className="qty-input-wrapper">
                <label className="sub-label">Qty:</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="qty-input"
                />
              </div>

              <button
                type="button"
                className="add-item-btn"
                onClick={handleAddItemToBasket}
                disabled={!selectedProductId}
              >
                <Plus size={16} /> Add Item
              </button>
            </div>

            {/* Basket Display */}
            {basket.length > 0 && (
              <div className="basket-chips">
                {basket.map((item) => (
                  <div key={item.id} className="basket-chip">
                    <span>
                      <strong>{item.qty}x</strong> {item.name} (GH₵
                      {(item.qty * item.unitPrice).toFixed(2)})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFromBasket(item.id)}
                      className="remove-chip-btn"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transaction Financial Summary Badge */}
          {basket.length > 0 && (
            <div className="payment-summary-bar">
              <div>
                Total Bill: <strong>GH₵{currentBasketTotal.toFixed(2)}</strong>
              </div>
              <div>
                Paid: <strong>GH₵{currentAmountPaid.toFixed(2)}</strong>
              </div>
              <div>
                {currentBalance > 0 ? (
                  <span className="debt-text">
                    Balance Due (Debt): GH₵{currentBalance.toFixed(2)}
                  </span>
                ) : currentBalance < 0 ? (
                  <span className="change-text">
                    Change Due: GH₵{Math.abs(currentBalance).toFixed(2)}
                  </span>
                ) : (
                  <span className="paid-text">Fully Paid</span>
                )}
              </div>
            </div>
          )}

          {/* Row 3: Amount Paid */}
          <div className="form-row three-col">
            <div className="form-group">
              <label>Amount Paid (GH₵) *</label>
              <div className="input-wrapper editable-amount-wrapper">
                <input
                  type="number"
                  step="0.01"
                  name="amountSpent"
                  placeholder="0.00"
                  value={formData.amountSpent}
                  onChange={handleInputChange}
                  readOnly={!isEditingAmount}
                  style={{ paddingLeft: "12px" }}
                  required
                />
                <button
                  type="button"
                  className={`pencil-btn ${isEditingAmount ? "active" : ""}`}
                  onClick={() => setIsEditingAmount(!isEditingAmount)}
                  title={
                    isEditingAmount
                      ? "Lock paid amount"
                      : "Edit paid amount manually"
                  }
                >
                  <Pencil size={15} />
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
              >
                <option value="Cash">Cash</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Card">Credit/Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <div className="form-group">
              <label>Customer Type</label>
              <select
                name="customerType"
                value={formData.customerType}
                onChange={handleInputChange}
              >
                <option value="Walk-in">Walk-in</option>
                <option value="Regular">Regular</option>
                <option value="Wholesale">Wholesale</option>
              </select>
            </div>
          </div>

          {/* Collapsible Details */}
          <div className="collapsible-section">
            <button
              type="button"
              className="toggle-details-btn"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span>
                {showAdvanced
                  ? "Hide Extra Details"
                  : "+ Add Extra Details (Email, Address, Notes)"}
              </span>
              {showAdvanced ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            {showAdvanced && (
              <div className="advanced-fields">
                <div className="form-row">
                  <div className="form-group">
                    <label>Email Address</label>
                    <div className="input-wrapper">
                      <Mail size={16} className="input-icon" />
                      <input
                        type="email"
                        name="email"
                        placeholder="customer@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Location / Address</label>
                    <div className="input-wrapper">
                      <MapPin size={16} className="input-icon" />
                      <input
                        type="text"
                        name="address"
                        placeholder="City, Street or Landmark"
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Purchase Notes</label>
                  <textarea
                    name="notes"
                    rows="2"
                    placeholder="e.g. Special order requests..."
                    value={formData.notes}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
            )}
          </div>

          <div className="form-action-row">
            <button type="submit" className="stage-customer-btn">
              <UserPlus size={18} />
              <span>Add to Review Queue</span>
            </button>
          </div>
        </form>
      </section>

      {/* Review Queue Table */}
      <section className="staging-section dark-card">
        <div className="staging-header">
          <div>
            <h3>Review Queue</h3>
            <p>
              Review customer entries below before syncing to central database.
            </p>
          </div>

          <button
            className="sync-db-btn"
            onClick={handleSyncDatabase}
            disabled={isSyncing || stagedCustomers.length === 0}
          >
            <Database size={18} className={isSyncing ? "spin" : ""} />
            <span>
              {isSyncing
                ? "Syncing..."
                : `Sync ${stagedCustomers.length} Records`}
            </span>
          </button>
        </div>

        {stagedCustomers.length === 0 ? (
          <div className="empty-queue-state">
            <Users size={48} className="empty-icon" />
            <h4>No Customers in Queue</h4>
            <p>
              Add customer purchases above to collect them here for final
              review.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="customer-table">
              <thead>
                <tr>
                  <th>Customer Info</th>
                  <th>Contact</th>
                  <th>Items Purchased</th>
                  <th>Payment</th>
                  <th>Total / Paid / Debt</th>
                  <th>Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stagedCustomers.map((cust) => (
                  <tr key={cust.id}>
                    <td>
                      <div className="cust-identity">
                        <span className="cust-name">{cust.fullName}</span>
                        <span className="cust-id">
                          {cust.id} • {cust.timestamp}
                        </span>
                      </div>
                    </td>
                    <td>{cust.phone}</td>
                    <td>
                      {cust.items && cust.items.length > 0 ? (
                        <div className="purchased-items-list">
                          {cust.items.map((it, idx) => (
                            <span key={idx} className="purchased-badge">
                              {it.qty}x {it.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted">No items selected</span>
                      )}
                    </td>
                    <td>
                      <span className="tag-badge">{cust.paymentMethod}</span>
                    </td>
                    <td className="amount-cell">
                      <div>Total: GH₵{(cust.totalAmount || 0).toFixed(2)}</div>
                      <div>
                        Paid: <strong>GH₵{cust.amountSpent.toFixed(2)}</strong>
                      </div>
                      {cust.amountOwe > 0 && (
                        <div
                          style={{
                            color: "#ef4444",
                            fontSize: "0.85rem",
                            fontWeight: "bold",
                          }}
                        >
                          Debt: GH₵{cust.amountOwe.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="extra-info-cell">
                      {cust.email && (
                        <span className="info-chip">
                          <Mail size={12} /> {cust.email}
                        </span>
                      )}
                      {cust.notes && (
                        <p className="notes-preview">"{cust.notes}"</p>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons-group">
                        <button
                          className="record-pay-btn"
                          onClick={() => handleOpenPaymentModal(cust)}
                          title="Record Payment"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "6px 10px",
                            backgroundColor: "#10b981",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            fontWeight: "500",
                            marginRight: "6px",
                          }}
                        >
                          <CreditCard size={14} /> Pay
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => handleRemoveStaged(cust.id)}
                          title="Remove from queue"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* --- RECORD PAYMENT MODAL --- */}
      {isPaymentModalOpen && selectedCustomerForPayment && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
          onClick={handleClosePaymentModal}
        >
          <div
            className="modal-content dark-card"
            style={{
              backgroundColor: "#1e293b",
              color: "#f8fafc",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "480px",
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)",
              border: "1px solid #334155",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #334155",
                paddingBottom: "12px",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  margin: 0,
                  fontSize: "1.2rem",
                }}
              >
                <Receipt size={20} style={{ color: "#10b981" }} /> Record
                Payment
              </h3>
              <button
                type="button"
                onClick={handleClosePaymentModal}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Customer Brief */}
            <div
              style={{
                backgroundColor: "#0f172a",
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "0.9rem",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  marginBottom: "4px",
                  color: "#38bdf8",
                }}
              >
                {selectedCustomerForPayment.fullName} (
                {selectedCustomerForPayment.phone})
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#cbd5e1",
                }}
              >
                <span>
                  Total Bill: GH₵
                  {(selectedCustomerForPayment.totalAmount || 0).toFixed(2)}
                </span>
                <span>
                  Paid: GH₵
                  {(selectedCustomerForPayment.amountSpent || 0).toFixed(2)}
                </span>
              </div>
              <div
                style={{
                  marginTop: "4px",
                  fontWeight: "bold",
                  color: "#f87171",
                }}
              >
                Remaining Debt: GH₵
                {(selectedCustomerForPayment.amountOwe || 0).toFixed(2)}
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveRecordedPayment}>
              <div className="form-group" style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "0.85rem",
                  }}
                >
                  Payment Amount (GH₵) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={paymentRecord.amount}
                  onChange={(e) =>
                    setPaymentRecord({
                      ...paymentRecord,
                      amount: e.target.value,
                    })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "6px",
                    color: "#fff",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "0.85rem",
                  }}
                >
                  Payment Method
                </label>
                <select
                  value={paymentRecord.method}
                  onChange={(e) =>
                    setPaymentRecord({
                      ...paymentRecord,
                      method: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "6px",
                    color: "#fff",
                  }}
                >
                  <option value="Cash">Cash</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Card">Credit/Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "0.85rem",
                  }}
                >
                  Payment Notes / Reference (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Part payment received via MoMo..."
                  value={paymentRecord.notes}
                  onChange={(e) =>
                    setPaymentRecord({
                      ...paymentRecord,
                      notes: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "6px",
                    color: "#fff",
                    resize: "vertical",
                  }}
                ></textarea>
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
                  onClick={handleClosePaymentModal}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "#334155",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
