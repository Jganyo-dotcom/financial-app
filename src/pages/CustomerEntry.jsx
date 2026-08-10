import React, { useState } from "react";
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
  DollarSign,
  Users,
  AlertCircle,
  Plus,
  X,
  ShoppingBag,
} from "lucide-react";
import "../css/CustomerEntry.css";

// Vault Products Inventory Mock
const VAULT_PRODUCTS = [
  { id: "P-101", name: "Cement Bag 50kg (32.5R)", price: 85.0 },
  { id: "P-102", name: "PVC Pipe 4-Inch (6m)", price: 45.0 },
  { id: "P-103", name: "Emulsion Paint White (20L)", price: 280.0 },
  { id: "P-104", name: "Roofing Nails (1kg pack)", price: 25.0 },
  { id: "P-105", name: "High-Tensile Steel Rod 12mm", price: 65.0 },
  { id: "P-106", name: "Copper Electrical Wire 2.5mm", price: 320.0 },
];

export default function CustomerEntry() {
  // --- State Management ---
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState(null);

  // Multi-Product Basket State
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [basket, setBasket] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    amountSpent: "",
    paymentMethod: "Cash",
    customerType: "Walk-in",
    email: "",
    address: "",
    notes: "",
  });

  // Staged Queue State
  const [stagedCustomers, setStagedCustomers] = useState([
    {
      id: "CUST-1001",
      fullName: "Kofi Mensah",
      phone: "+233 24 123 4567",
      items: [
        {
          id: "P-101",
          name: "Cement Bag 50kg (32.5R)",
          qty: 10,
          unitPrice: 85.0,
        },
      ],
      amountSpent: 850.0,
      paymentMethod: "Mobile Money",
      customerType: "Regular",
      email: "kofi.mensah@email.com",
      address: "Accra, Ghana",
      notes: "Express delivery required",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add Item to Basket
  const handleAddItemToBasket = () => {
    if (!selectedProductId) return;

    const vaultItem = VAULT_PRODUCTS.find((p) => p.id === selectedProductId);
    if (!vaultItem) return;

    const existingIndex = basket.findIndex((i) => i.id === vaultItem.id);
    let updatedBasket = [...basket];

    if (existingIndex > -1) {
      updatedBasket[existingIndex].qty += parseInt(quantity, 10);
    } else {
      updatedBasket.push({
        id: vaultItem.id,
        name: vaultItem.name,
        qty: parseInt(quantity, 10),
        unitPrice: vaultItem.price,
      });
    }

    setBasket(updatedBasket);

    // Auto-calculate Total Amount
    const newTotal = updatedBasket.reduce(
      (sum, item) => sum + item.qty * item.unitPrice,
      0,
    );
    setFormData((prev) => ({ ...prev, amountSpent: newTotal.toFixed(2) }));

    // Reset Selector
    setSelectedProductId("");
    setQuantity(1);
  };

  // Remove Item from Basket
  const handleRemoveFromBasket = (productId) => {
    const updatedBasket = basket.filter((item) => item.id !== productId);
    setBasket(updatedBasket);

    const newTotal = updatedBasket.reduce(
      (sum, item) => sum + item.qty * item.unitPrice,
      0,
    );
    setFormData((prev) => ({
      ...prev,
      amountSpent: newTotal ? newTotal.toFixed(2) : "",
    }));
  };

  // Trigger Toast Alert
  const showToastNotification = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Add Customer to Queue
  const handleAddToStage = (e) => {
    e.preventDefault();

    if (
      !formData.fullName.trim() ||
      !formData.phone.trim() ||
      !formData.amountSpent
    ) {
      showToastNotification(
        "Please fill in Name, Phone, and Amount spent.",
        "error",
      );
      return;
    }

    const newStagedCustomer = {
      id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      ...formData,
      items: basket,
      amountSpent: parseFloat(formData.amountSpent),
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

    showToastNotification(
      `Added ${newStagedCustomer.fullName} to review queue!`,
    );
  };

  // Remove Customer from Queue
  const handleRemoveStaged = (id) => {
    setStagedCustomers((prev) => prev.filter((item) => item.id !== id));
    showToastNotification("Customer removed from review queue.", "error");
  };

  // Bulk Sync
  const handleSyncDatabase = async () => {
    if (stagedCustomers.length === 0) {
      showToastNotification("No staged records to sync!", "error");
      return;
    }

    setIsSyncing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      showToastNotification(
        `Synced ${stagedCustomers.length} record(s) to Database!`,
        "success",
      );
      setStagedCustomers([]);
    } catch (err) {
      showToastNotification("Database sync failed.", "error");
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
      {/* Toast Notification */}
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

      {/* Header */}
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
            <span className="pill-label">Total Amount</span>
            <span className="pill-value">${totalStagedRevenue.toFixed(2)}</span>
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
          {/* Row 1: Name & Phone */}
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

          {/* Row 2: Vault Multi-Product Selection */}
          <div className="form-group vault-section">
            <label>
              <ShoppingBag size={15} /> Select Purchased Vault Items
            </label>
            <div className="vault-picker-row">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="vault-dropdown"
              >
                <option value="">-- Choose item from Vault --</option>
                {VAULT_PRODUCTS.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name} (${prod.price.toFixed(2)})
                  </option>
                ))}
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

            {/* Basket Chips Display */}
            {basket.length > 0 && (
              <div className="basket-chips">
                {basket.map((item) => (
                  <div key={item.id} className="basket-chip">
                    <span>
                      <strong>{item.qty}x</strong> {item.name} ($
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

          {/* Row 3: Amount & Payment Method */}
          <div className="form-row three-col">
            <div className="form-group">
              <label>Total Amount ($) *</label>
              <div className="input-wrapper">
                <DollarSign size={16} className="input-icon" />
                <input
                  type="number"
                  step="0.01"
                  name="amountSpent"
                  placeholder="0.00"
                  value={formData.amountSpent}
                  onChange={handleInputChange}
                  required
                />
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

          {/* Action Row with Compact Button */}
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
              Add customer purchases above. They will collect here for final
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
                  <th>Amount</th>
                  <th>Details</th>
                  <th>Action</th>
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
                      ${cust.amountSpent.toFixed(2)}
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
                      <button
                        className="delete-btn"
                        onClick={() => handleRemoveStaged(cust.id)}
                        title="Remove from queue"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
