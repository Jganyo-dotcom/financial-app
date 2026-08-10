import React, { useState } from "react";
import {
  Package,
  DollarSign,
  Plus,
  RefreshCw,
  Tag,
  TrendingDown,
  Layers,
  Search,
  Filter,
  X,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  Truck,
  Zap,
  User,
  Calendar,
} from "lucide-react";
import "../css/InventoryExpenseManager.css";

// Initial Mock Inventory Products
const INITIAL_PRODUCTS = [
  {
    id: "PRD-101",
    name: "PVC Pipe 4-Inch (6m)",
    category: "Plumbing",
    stockQuantity: 42,
    unitPrice: 45.0,
    costPrice: 30.0,
    lowStockThreshold: 15,
  },
  {
    id: "PRD-102",
    name: "Emulsion Paint White (20L)",
    category: "Paints",
    stockQuantity: 8,
    unitPrice: 395.0,
    costPrice: 290.0,
    lowStockThreshold: 10, // Low stock warning
  },
  {
    id: "PRD-103",
    name: "Cement Bag 50kg (32.5R)",
    category: "Masonry",
    stockQuantity: 120,
    unitPrice: 85.0,
    costPrice: 68.0,
    lowStockThreshold: 30,
  },
  {
    id: "PRD-104",
    name: "Roofing Nails (1kg pack)",
    category: "Hardware",
    stockQuantity: 5,
    unitPrice: 25.0,
    costPrice: 16.0,
    lowStockThreshold: 12, // Low stock warning
  },
  {
    id: "PRD-105",
    name: "High-Tensile Steel Rod 12mm",
    category: "Construction",
    stockQuantity: 85,
    unitPrice: 80.0,
    costPrice: 58.0,
    lowStockThreshold: 20,
  },
];

// Initial Mock Operational Expenses
const INITIAL_EXPENSES = [
  {
    id: "EXP-301",
    date: "2026-08-10",
    time: "11:15 AM",
    category: "Generator Fuel",
    amount: 180.0,
    purpose:
      "Purchased 15L Diesel for store backup generator during power outage.",
    paymentMethod: "Cash",
    loggedBy: "Store Manager",
  },
  {
    id: "EXP-302",
    date: "2026-08-09",
    time: "03:30 PM",
    category: "Transport & Offloading",
    amount: 250.0,
    purpose: "Offloading fee for cement truck batch #402.",
    paymentMethod: "Mobile Money",
    loggedBy: "Store Manager",
  },
  {
    id: "EXP-303",
    date: "2026-08-07",
    time: "09:00 AM",
    category: "Store Utilities",
    amount: 420.0,
    purpose: "Electricity ECG prepaid token purchase for August.",
    paymentMethod: "Mobile Money",
    loggedBy: "Admin",
  },
];

export default function InventoryExpenseManager() {
  const [activeTab, setActiveTab] = useState("inventory"); // 'inventory' | 'expenses'

  // Data States
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // Active Selected Product for Modals
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form Field Inputs
  const [restockQty, setRestockQty] = useState("");
  const [newSellingPrice, setNewSellingPrice] = useState("");
  const [newCostPrice, setNewCostPrice] = useState("");

  // New Expense Form State
  const [expenseCategory, setExpenseCategory] = useState("Generator Fuel");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expensePurpose, setExpensePurpose] = useState("");
  const [expenseMethod, setExpenseMethod] = useState("Cash");

  // New Product Form State
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Hardware");
  const [newProdStock, setNewProdStock] = useState("");
  const [newProdUnitPrice, setNewProdUnitPrice] = useState("");
  const [newProdCostPrice, setNewProdCostPrice] = useState("");

  // --- ACTIONS ---

  // 1. Add Stock Quantity
  const handleRestockSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const addedStock = parseInt(restockQty) || 0;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProduct.id
          ? { ...p, stockQuantity: p.stockQuantity + addedStock }
          : p,
      ),
    );

    setIsRestockOpen(false);
    setRestockQty("");
    setSelectedProduct(null);
  };

  // 2. Update Product Retail & Cost Prices
  const handlePriceSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const updatedPrice =
      parseFloat(newSellingPrice) || selectedProduct.unitPrice;
    const updatedCost = parseFloat(newCostPrice) || selectedProduct.costPrice;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProduct.id
          ? { ...p, unitPrice: updatedPrice, costPrice: updatedCost }
          : p,
      ),
    );

    setIsPriceOpen(false);
    setNewSellingPrice("");
    setNewCostPrice("");
    setSelectedProduct(null);
  };

  // 3. Add Brand New Product
  const handleAddProductSubmit = (e) => {
    e.preventDefault();
    const newProduct = {
      id: `PRD-${100 + products.length + 1}`,
      name: newProdName,
      category: newProdCategory,
      stockQuantity: parseInt(newProdStock) || 0,
      unitPrice: parseFloat(newProdUnitPrice) || 0,
      costPrice: parseFloat(newProdCostPrice) || 0,
      lowStockThreshold: 10,
    };

    setProducts([newProduct, ...products]);
    setIsAddProductOpen(false);
    setNewProdName("");
    setNewProdStock("");
    setNewProdUnitPrice("");
    setNewProdCostPrice("");
  };

  // 4. Log New Operational Expense
  const handleAddExpenseSubmit = (e) => {
    e.preventDefault();
    const today = new Date();
    const newExp = {
      id: `EXP-${300 + expenses.length + 1}`,
      date: today.toISOString().split("T")[0],
      time: today.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      category: expenseCategory,
      amount: parseFloat(expenseAmount) || 0,
      purpose: expensePurpose,
      paymentMethod: expenseMethod,
      loggedBy: "Store Manager",
    };

    setExpenses([newExp, ...expenses]);
    setIsAddExpenseOpen(false);
    setExpenseAmount("");
    setExpensePurpose("");
  };

  // Computed Values
  const lowStockCount = products.filter(
    (p) => p.stockQuantity <= p.lowStockThreshold,
  ).length;

  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.stockQuantity * p.unitPrice,
    0,
  );

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Search Filter
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="manager-page">
      {/* Page Header */}
      <header className="page-header">
        <div>
          <h2>
            <Layers className="title-icon" size={26} /> Stock & Operational
            Control
          </h2>
          <p>
            Update inventory stock levels, adjust prices, and log store
            expenses.
          </p>
        </div>

        {/* Tab Navigation Controls */}
        <div className="tab-buttons">
          <button
            type="button"
            className={`tab-btn ${activeTab === "inventory" ? "active" : ""}`}
            onClick={() => setActiveTab("inventory")}
          >
            <Package size={16} /> Products & Stock
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "expenses" ? "active" : ""}`}
            onClick={() => setActiveTab("expenses")}
          >
            <TrendingDown size={16} /> Expense Ledger
          </button>
        </div>
      </header>

      {/* METRICS ROW */}
      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Products in DB</span>
            <div className="icon-wrapper blue">
              <Package size={18} />
            </div>
          </div>
          <div className="metric-body">
            <h3>{products.length} Items</h3>
            <span className="sub-text blue-badge">
              Active catalog in inventory
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Low Stock Alerts</span>
            <div
              className={`icon-wrapper ${lowStockCount > 0 ? "red" : "green"}`}
            >
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="metric-body">
            <h3 className={lowStockCount > 0 ? "red-text" : "green-text"}>
              {lowStockCount} Items
            </h3>
            <span className="sub-text muted">
              {lowStockCount > 0
                ? "Requires immediate restocking"
                : "All stock levels healthy"}
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Inventory Retail Value</span>
            <div className="icon-wrapper green">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="metric-body">
            <h3>
              $
              {totalInventoryValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </h3>
            <span className="sub-text positive">Total selling potential</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Recorded Expenses</span>
            <div className="icon-wrapper amber">
              <Receipt size={18} />
            </div>
          </div>
          <div className="metric-body">
            <h3 className="amber-text">${totalExpenses.toFixed(2)}</h3>
            <span className="sub-text muted">Operating overhead logged</span>
          </div>
        </div>
      </section>

      {/* TAB 1: INVENTORY & STOCK MANAGEMENT */}
      {activeTab === "inventory" && (
        <section className="manager-card">
          <div className="card-toolbar">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search product name, category, or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="primary-action-btn"
              onClick={() => setIsAddProductOpen(true)}
            >
              <Plus size={16} /> Add New Product
            </button>
          </div>

          <div className="table-responsive">
            <table className="manager-table">
              <thead>
                <tr>
                  <th>Product Code & Name</th>
                  <th>Category</th>
                  <th>In Stock</th>
                  <th>Unit Cost</th>
                  <th>Selling Price</th>
                  <th>Margin</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const isLow = p.stockQuantity <= p.lowStockThreshold;
                  const margin = p.unitPrice - p.costPrice;
                  return (
                    <tr key={p.id}>
                      <td>
                        <span className="item-name">{p.name}</span>
                        <span className="item-code">{p.id}</span>
                      </td>
                      <td>
                        <span className="category-badge">{p.category}</span>
                      </td>
                      <td>
                        <span className={`stock-badge ${isLow ? "low" : "ok"}`}>
                          {isLow && <AlertTriangle size={12} />}
                          {p.stockQuantity} units
                        </span>
                      </td>
                      <td className="muted-cell">${p.costPrice.toFixed(2)}</td>
                      <td className="price-cell">${p.unitPrice.toFixed(2)}</td>
                      <td className="positive-text">+${margin.toFixed(2)}</td>
                      <td>
                        <div className="action-button-group">
                          <button
                            type="button"
                            className="btn-restock"
                            onClick={() => {
                              setSelectedProduct(p);
                              setIsRestockOpen(true);
                            }}
                          >
                            <RefreshCw size={13} /> Add Stock
                          </button>
                          <button
                            type="button"
                            className="btn-price"
                            onClick={() => {
                              setSelectedProduct(p);
                              setNewSellingPrice(p.unitPrice);
                              setNewCostPrice(p.costPrice);
                              setIsPriceOpen(true);
                            }}
                          >
                            <Tag size={13} /> Edit Price
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: EXPENSE TRACKER LEDGER */}
      {activeTab === "expenses" && (
        <section className="manager-card">
          <div className="card-toolbar">
            <h3>Operational Expenses & Purpose Log</h3>
            <button
              type="button"
              className="primary-action-btn amber"
              onClick={() => setIsAddExpenseOpen(true)}
            >
              <Plus size={16} /> Record New Expense
            </button>
          </div>

          <div className="table-responsive">
            <table className="manager-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Category</th>
                  <th>Amount ($)</th>
                  <th>Purpose / Description</th>
                  <th>Payment Method</th>
                  <th>Logged By</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td>
                      <span className="item-name">{exp.date}</span>
                      <span className="item-code">{exp.time}</span>
                    </td>
                    <td>
                      <span className="exp-category-chip">{exp.category}</span>
                    </td>
                    <td className="amount-cell amber-text">
                      -${exp.amount.toFixed(2)}
                    </td>
                    <td className="purpose-cell">{exp.purpose}</td>
                    <td>
                      <span className="method-chip">{exp.paymentMethod}</span>
                    </td>
                    <td>
                      <span className="logged-by-text">{exp.loggedBy}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ================= MODAL 1: RESTOCK PRODUCT ================= */}
      {isRestockOpen && selectedProduct && (
        <div className="modal-overlay" onClick={() => setIsRestockOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <RefreshCw size={18} className="title-icon" />
                <h3>Restock Product</h3>
              </div>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={() => setIsRestockOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="modal-form">
              <div className="item-info-summary">
                <span className="info-title">{selectedProduct.name}</span>
                <span className="info-sub">
                  Current Stock:{" "}
                  <strong>{selectedProduct.stockQuantity} units</strong>
                </span>
              </div>

              <div className="form-group">
                <label>Additional Stock Quantity to Add *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 25"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  required
                />
              </div>

              {restockQty && (
                <div className="preview-calc-box">
                  <span>New Total Stock Level:</span>
                  <strong>
                    {selectedProduct.stockQuantity +
                      (parseInt(restockQty) || 0)}{" "}
                    units
                  </strong>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsRestockOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="confirm-btn">
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: UPDATE PRICES ================= */}
      {isPriceOpen && selectedProduct && (
        <div className="modal-overlay" onClick={() => setIsPriceOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Tag size={18} className="title-icon" />
                <h3>Update Pricing</h3>
              </div>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={() => setIsPriceOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePriceSubmit} className="modal-form">
              <div className="item-info-summary">
                <span className="info-title">{selectedProduct.name}</span>
                <span className="info-sub">{selectedProduct.id}</span>
              </div>

              <div className="form-group">
                <label>Unit Cost Price ($) [Purchase Price]</label>
                <input
                  type="number"
                  step="0.01"
                  value={newCostPrice}
                  onChange={(e) => setNewCostPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Retail Selling Price ($) [Customer Price] *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newSellingPrice}
                  onChange={(e) => setNewSellingPrice(e.target.value)}
                  required
                />
              </div>

              {newSellingPrice && newCostPrice && (
                <div className="preview-calc-box">
                  <span>Expected Profit Margin per Item:</span>
                  <strong className="positive-text">
                    +$
                    {(
                      parseFloat(newSellingPrice) - parseFloat(newCostPrice)
                    ).toFixed(2)}
                  </strong>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsPriceOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="confirm-btn">
                  Save Price Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: RECORD EXPENSE ================= */}
      {isAddExpenseOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsAddExpenseOpen(false)}
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <TrendingDown size={18} className="title-icon amber" />
                <h3>Record Operational Expense</h3>
              </div>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={() => setIsAddExpenseOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="modal-form">
              <div className="form-group">
                <label>Expense Category *</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                >
                  <option value="Generator Fuel">Generator Fuel</option>
                  <option value="Store Utilities">
                    Store Utilities (Power/Water)
                  </option>
                  <option value="Transport & Offloading">
                    Transport & Offloading
                  </option>
                  <option value="Store Maintenance">
                    Store Repairs & Maintenance
                  </option>
                  <option value="Staff Meals & Refreshments">
                    Staff Meals & Refreshments
                  </option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div className="form-group">
                <label>Amount Spent ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment Channel</label>
                <select
                  value={expenseMethod}
                  onChange={(e) => setExpenseMethod(e.target.value)}
                >
                  <option value="Cash">Physical Cash from Drawer</option>
                  <option value="Mobile Money">Mobile Money</option>
                </select>
              </div>

              <div className="form-group">
                <label>Purpose / Explanation *</label>
                <textarea
                  rows="3"
                  placeholder="State specifically what this cash/money was used for..."
                  value={expensePurpose}
                  onChange={(e) => setExpensePurpose(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsAddExpenseOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="confirm-btn amber-btn">
                  Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: ADD NEW PRODUCT ================= */}
      {isAddProductOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsAddProductOpen(false)}
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Package size={18} className="title-icon" />
                <h3>Add New Product to Catalog</h3>
              </div>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={() => setIsAddProductOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="modal-form">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. PVC Elbow Joint 2-Inch"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                >
                  <option value="Plumbing">Plumbing</option>
                  <option value="Paints">Paints</option>
                  <option value="Masonry">Masonry</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Construction">Construction</option>
                  <option value="Electrical">Electrical</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Initial Stock Qty *</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newProdCostPrice}
                    onChange={(e) => setNewProdCostPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Retail Selling Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newProdUnitPrice}
                  onChange={(e) => setNewProdUnitPrice(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsAddProductOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="confirm-btn">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
