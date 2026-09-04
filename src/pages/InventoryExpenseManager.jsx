import React, { useState, useEffect } from "react";
import {
  Package,
  DollarSign,
  Plus,
  RefreshCw,
  TrendingDown,
  Layers,
  Search,
  X,
  Edit3,
  AlertTriangle,
  Receipt,
  Trash2,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { API_BASE_URL } from "../components/apiEnpoint";
import "../css/InventoryExpenseManager.css";
import toast from "react-hot-toast";

const CATEGORIES = [
  "Plumbing",
  "Paints",
  "Masonry",
  "Hardware",
  "Construction",
  "Electrical",
  "Building Materials & Cement",
  "Tools & Hardware",
  "Paints & Sealants",
  "Fasteners & Nails",
  "General Stock",
];

export default function InventoryExpenseManager() {
  const [activeTab, setActiveTab] = useState("inventory"); // 'inventory' | 'expenses'

  // Data States
  const [products, setProducts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isReverseExpenseOpen, setIsReverseExpenseOpen] = useState(false);

  // Selected Product & Expense for Modals
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Restock Input
  const [restockQty, setRestockQty] = useState("");
  const [restockType, setRestockType] = useState("Piece"); // ✨ NEW STATE FIELD: "Piece" or "Pack"

  // Edit Product Form State
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("Hardware");
  const [editCostPrice, setEditCostPrice] = useState("");
  const [editUnitPrice, setEditUnitPrice] = useState("");
  const [editStockQuantity, setEditStockQuantity] = useState("");
  const [editPackSellingPrice, setEditPackSellingPrice] = useState(""); // ✨ NEW STATE FIELD
  const [editLowStockThreshold, setEditLowStockThreshold] = useState("10");
  const [isSaving, setIsSaving] = useState(false);

  // New Expense Form State
  const [expenseCategory, setExpenseCategory] = useState("Generator Fuel");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expensePurpose, setExpensePurpose] = useState("");
  const [expenseMethod, setExpenseMethod] = useState("Cash");

  const token = localStorage.getItem("token");

  // Helper function for standard fetch calls
  const request = async (url, options = {}) => {
    const res = await fetch(`${API_BASE_URL}/api/product${url}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP error! status: ${res.status}`);
    }
    return res.json();
  };

  // --- FETCH INITIAL DATA ---
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [productsRes, expensesRes] = await Promise.all([
        request("/products"),
        request("/expenses"),
      ]);

      setProducts(productsRes.products || productsRes || []);
      setExpenses(expensesRes.expenses || expensesRes || []);
    } catch (error) {
      console.error("Error fetching data from server:", error);
      toast.error(error.message || "Failed to load data from server");
    } finally {
      setLoading(false);
    }
  };

  // Helper to open Edit Modal with populated data
  const handleOpenEditModal = (p) => {
    setSelectedProduct(p);
    setEditName(p.name || "");
    setEditCategory(p.category || "Hardware");
    setEditCostPrice(p.costPrice !== undefined ? p.costPrice : "");
    setEditUnitPrice(p.unitPrice !== undefined ? p.unitPrice : "");

    // ✨ NEW: Auto-fills the wholesale pack price state from the selected product object
    setEditPackSellingPrice(
      p.packSellingPrice !== undefined ? p.packSellingPrice : "",
    );

    setEditStockQuantity(p.stockQuantity !== undefined ? p.stockQuantity : "");
    setEditLowStockThreshold(
      p.lowStockThreshold !== undefined ? p.lowStockThreshold : 10,
    );
    setIsEditOpen(true);
  };

  // --- ACTIONS ---

  const handleRestockSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProduct) return;
    setIsSaving(true);
    const productId = selectedProduct._id || selectedProduct.id;
    const rawQty = parseInt(restockQty, 10) || 0;
    const unitsInPack = parseInt(selectedProduct.unitsPerPack, 10) || 1;

    // 🔄 Calculate total single units to send to the backend patch router
    const finalAddedStock =
      restockType === "Pack" ? rawQty * unitsInPack : rawQty;

    try {
      const res = await request(`/products/${productId}/restock`, {
        method: "PATCH",
        body: JSON.stringify({ addedQuantity: finalAddedStock }), // Sends the computed single unit count
      });

      const updatedProduct = res.product || res;

      setProducts((prev) =>
        prev.map((p) => ((p._id || p.id) === productId ? updatedProduct : p)),
      );

      toast.success("Restock successful");
      setIsSaving(false);
      setIsRestockOpen(false);
      setRestockQty("");
      setRestockType("Piece"); // Reset back to default standard selection tier
      setSelectedProduct(null);
    } catch (error) {
      setIsSaving(false);
      console.error("Error restocking product:", error);
      toast.error(error.message || "Failed to restock product");
    }
  };

  // 2. Update Product Details (PATCH /products/:productId/price)

  const handleEditProductSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    if (!selectedProduct) return;

    const productId = selectedProduct._id || selectedProduct.id;

    const payload = {
      name: editName,
      category: editCategory,
      costPrice: parseFloat(editCostPrice) || 0,
      unitPrice: parseFloat(editUnitPrice) || 0,
      packSellingPrice: parseFloat(editPackSellingPrice) || 0, // ✨ NEW: Maps straight to the updated backend router model
      stockQuantity: parseInt(editStockQuantity) || 0,
      lowStockThreshold: parseInt(editLowStockThreshold) || 10,
    };

    try {
      const res = await request(`/products/${productId}/price`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      const updatedProduct = res.product || res;

      setProducts((prev) =>
        prev.map((p) => ((p._id || p.id) === productId ? updatedProduct : p)),
      );
      setIsEditOpen(false);
      toast.success("Product updated successfully");
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.message || "Failed to update product details");
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Delete Product (DELETE /products/:productId)
  const handleDeleteProductSubmit = async () => {
    if (!selectedProduct) return;

    const productId = selectedProduct._id || selectedProduct.id;

    try {
      await request(`/products/${productId}`, {
        method: "DELETE",
      });

      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== productId));

      toast.success("Product deleted successfully");
      setIsDeleteOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(error.message || "Failed to delete product");
    }
  };

  // 4. Log New Operational Expense (POST /expenses)
  const handleAddExpenseSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    const formattedTime = today.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newExpensePayload = {
      date: formattedDate,
      time: formattedTime,
      category: expenseCategory,
      amount: parseFloat(expenseAmount) || 0,
      purpose: expensePurpose,
      paymentMethod: expenseMethod,
    };

    try {
      const res = await request("/expenses", {
        method: "POST",
        body: JSON.stringify(newExpensePayload),
      });

      const createdExpense = res.expense || res;

      setExpenses((prev) => [createdExpense, ...prev]);
      setIsSaving(false);
      toast.success("Expense recorded successfully");

      setIsAddExpenseOpen(false);
      setExpenseAmount("");
      setExpensePurpose("");
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error(error.message || "Failed to log expense");
    } finally {
      setIsSaving(false); // 2. Turn off loading regardless of success/error
    }
  };

  // 5. Reverse Expense (DELETE /expenses/:expenseId)
  const handleReverseExpenseSubmit = async () => {
    setIsSaving(true);
    if (!selectedExpense) return;

    const expenseId = selectedExpense._id || selectedExpense.id;

    try {
      await request(`/expenses/${expenseId}`, {
        method: "DELETE",
      });

      setExpenses((prev) => prev.filter((e) => (e._id || e.id) !== expenseId));

      toast.success("Expense reversed successfully");
      setIsSaving(false);
      setIsReverseExpenseOpen(false);
      setSelectedExpense(null);
    } catch (error) {
      console.error("Error reversing expense:", error);
      toast.error(error.message || "Failed to reverse expense");
    } finally {
      setIsSaving(false); // 2. Turn off loading regardless of success/error
    }
  };

  // Computed Values
  const lowStockCount = products.filter(
    (p) => p.stockQuantity <= (p.lowStockThreshold ?? 10),
  ).length;

  const totalInventoryValue = products.reduce(
    (sum, p) => sum + (p.stockQuantity || 0) * (p.unitPrice || 0),
    0,
  );

  const totalExpenses = expenses.reduce(
    (sum, e) => sum + (parseFloat(e.amount) || 0),
    0,
  );

  // Search Filter
  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    const code = p.productCode || p.sku || p._id || p.id || "";
    return (
      p.name?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term) ||
      code.toString().toLowerCase().includes(term)
    );
  });

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
            Update inventory stock levels, modify product details, and log store
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
              GHC
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
            <h3 className="amber-text">GHC{totalExpenses.toFixed(2)}</h3>
            <span className="sub-text muted">Operating overhead logged</span>
          </div>
        </div>
      </section>

      {/* BACKEND LOADING STATE */}
      {loading ? (
        <div className="manager-card loading-container">
          <Loader2 className="spinner-icon" size={38} />
          <p>Fetching inventory records and expense logs...</p>
        </div>
      ) : (
        <>
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
                      const key = p._id || p.id;
                      const displayCode = p.productCode || p.sku || key;
                      const isLow =
                        p.stockQuantity <= (p.lowStockThreshold ?? 10);
                      const margin = (p.unitPrice || 0) - (p.costPrice || 0);

                      return (
                        <tr key={key}>
                          <td>
                            <span className="item-name">{p.name}</span>
                            <span className="item-code">{displayCode}</span>
                          </td>
                          <td>
                            <span className="category-badge">{p.category}</span>
                          </td>
                          <td>
                            <span
                              className={`stock-badge ${isLow ? "low" : "ok"}`}
                            >
                              {isLow && <AlertTriangle size={12} />}
                              {p.stockQuantity} units
                            </span>
                          </td>
                          <td className="muted-cell">
                            GHC{Number(p.costPrice || 0).toFixed(2)}
                          </td>
                          <td className="price-cell">
                            GHC{Number(p.unitPrice || 0).toFixed(2)}
                          </td>
                          <td className="positive-text">
                            +GHC{Number(margin).toFixed(2)}
                          </td>
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
                                onClick={() => handleOpenEditModal(p)}
                              >
                                <Edit3 size={13} /> Edit
                              </button>
                              <button
                                type="button"
                                className="btn-delete"
                                onClick={() => {
                                  setSelectedProduct(p);
                                  setIsDeleteOpen(true);
                                }}
                              >
                                <Trash2 size={13} /> Delete
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
                      <th>Amount (GHC)</th>
                      <th>Purpose / Description</th>
                      <th>Payment Method</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp) => (
                      <tr key={exp._id || exp.id || Math.random()}>
                        <td>
                          <span className="item-name">{exp.date}</span>
                          <span className="item-code">{exp.time}</span>
                        </td>
                        <td>
                          <span className="exp-category-chip">
                            {exp.category}
                          </span>
                        </td>
                        <td className="amount-cell amber-text">
                          -GHC{Number(exp.amount || 0).toFixed(2)}
                        </td>
                        <td className="purpose-cell">{exp.purpose}</td>
                        <td>
                          <span className="method-chip">
                            {exp.paymentMethod}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-reverse"
                            onClick={() => {
                              setSelectedExpense(exp);
                              setIsReverseExpenseOpen(true);
                            }}
                          >
                            <RotateCcw size={13} /> Reverse
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}

      {/* ================= MODAL 1: RESTOCK PRODUCT ================= */}
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
                <div className="font-semibold text-base text-slate-200">
                  {selectedProduct.name}
                </div>
                <div className="info-sub mt-1">
                  Current Stock:{" "}
                  <strong className="text-emerald-400">
                    {selectedProduct.stockQuantity} units
                  </strong>
                  {selectedProduct.unitsPerPack && (
                    <span className="text-slate-400 text-xs block mt-0.5">
                      (Pack Size Configuration: {selectedProduct.unitsPerPack}{" "}
                      units / pack)
                    </span>
                  )}
                </div>
              </div>

              {/* ✨ NEW: Type Selector Toggle Row Field */}
              <div className="form-group mt-4">
                <label>Restock Unit Type *</label>
                <select
                  value={restockType}
                  onChange={(e) => setRestockType(e.target.value)}
                  className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white cursor-pointer"
                >
                  <option value="Piece">Pieces (Single Units)</option>
                  <option value="Pack">Packs (Whole Box / Bundles)</option>
                </select>
              </div>

              <div className="form-group mt-3">
                <label>
                  {restockType === "Pack"
                    ? "Number of Packs to Add *"
                    : "Additional Stock Quantity to Add *"}
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder={
                    restockType === "Pack" ? "e.g. 5 boxes" : "e.g. 25 units"
                  }
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  required
                />
              </div>

              {restockQty && (
                <div className="preview-calc-box mt-3 p-3 bg-slate-800/50 rounded border border-slate-700/50 flex flex-col gap-1">
                  <div className="text-xs text-slate-400 flex justify-between">
                    <span>Incoming Stock Conversion:</span>
                    <span className="font-semibold text-slate-200">
                      +
                      {restockType === "Pack"
                        ? (parseInt(restockQty, 10) || 0) *
                          (parseInt(selectedProduct.unitsPerPack, 10) || 1)
                        : parseInt(restockQty, 10) || 0}{" "}
                      single units
                    </span>
                  </div>
                  <div className="divider my-1 border-t border-slate-700" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-300">
                      Projected New Stock Level:
                    </span>
                    <strong className="text-emerald-400 text-lg">
                      {selectedProduct.stockQuantity +
                        (restockType === "Pack"
                          ? (parseInt(restockQty, 10) || 0) *
                            (parseInt(selectedProduct.unitsPerPack, 10) || 1)
                          : parseInt(restockQty, 10) || 0)}{" "}
                      units
                    </strong>
                  </div>
                </div>
              )}

              <div className="modal-actions mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsRestockOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="confirm-btn"
                  disabled={isSaving} // Blocks duplicate click submissions
                >
                  {isSaving ? "Restocking..." : "Confirm Restock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: EDIT PRODUCT DETAILS ================= */}
      {/* ================= MODAL 2: EDIT PRODUCT DETAILS ================= */}
      {isEditOpen && selectedProduct && (
        <div className="modal-overlay" onClick={() => setIsEditOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Edit3 size={18} className="title-icon" />
                <h3>Edit Product Details</h3>
              </div>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={() => setIsEditOpen(false)}
                disabled={isSaving}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditProductSubmit} className="modal-form">
              <div className="item-info-summary">
                <span className="info-title">
                  {selectedProduct.productCode ||
                    selectedProduct.sku ||
                    selectedProduct._id}
                </span>
              </div>

              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={isSaving}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  disabled={isSaving}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cost Price (GHC) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editCostPrice}
                    onChange={(e) => setEditCostPrice(e.target.value)}
                    disabled={isSaving}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Retail Selling Price (GHC) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editUnitPrice}
                    onChange={(e) => setEditUnitPrice(e.target.value)}
                    disabled={isSaving}
                    required
                  />
                </div>
              </div>

              {/* ✨ REVISED: Side-by-side Layout row showcasing Wholesale Pack Configuration */}
              <div className="form-row">
                <div className="form-group">
                  <label>Wholesale Price per Pack (GHC) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editPackSellingPrice}
                    onChange={(e) => setEditPackSellingPrice(e.target.value)}
                    placeholder="e.g. 46.00"
                    disabled={isSaving}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Current Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    value={editStockQuantity}
                    onChange={(e) => setEditStockQuantity(e.target.value)}
                    disabled={isSaving}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Low Stock Alert Level *</label>
                <input
                  type="number"
                  min="0"
                  value={editLowStockThreshold}
                  onChange={(e) => setEditLowStockThreshold(e.target.value)}
                  disabled={isSaving}
                  required
                />
              </div>

              {editUnitPrice && editCostPrice && (
                <div className="preview-calc-box">
                  <span>Expected Retail Profit Margin per Item:</span>
                  <strong className="positive-text">
                    +GHC{" "}
                    {(
                      parseFloat(editUnitPrice) - parseFloat(editCostPrice)
                    ).toFixed(2)}
                  </strong>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="confirm-btn"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving Changes..." : "Save Changes"}
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
                <label>Amount Spent (GHC) *</label>
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
                  {isSaving ? "Saving Changes..." : "Log Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: DELETE CONFIRMATION ================= */}
      {isDeleteOpen && selectedProduct && (
        <div className="modal-overlay" onClick={() => setIsDeleteOpen(false)}>
          <div className="modal-card sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Trash2 size={18} className="title-icon red-text" />
                <h3>Delete Product</h3>
              </div>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={() => setIsDeleteOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body-padding">
              <p className="delete-confirm-text">
                Are you sure you want to delete{" "}
                <strong>"{selectedProduct.name}"</strong>? This item will be
                permanently removed from your inventory DB.
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setIsDeleteOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-btn red-btn"
                onClick={handleDeleteProductSubmit}
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: REVERSE EXPENSE CONFIRMATION ================= */}
      {isReverseExpenseOpen && selectedExpense && (
        <div
          className="modal-overlay"
          onClick={() => setIsReverseExpenseOpen(false)}
        >
          <div className="modal-card sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <RotateCcw size={18} className="title-icon amber-text" />
                <h3>Reverse Expense Record</h3>
              </div>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={() => setIsReverseExpenseOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body-padding">
              <p className="delete-confirm-text">
                Are you sure you want to reverse the expense of{" "}
                <strong>
                  ${Number(selectedExpense.amount || 0).toFixed(2)}
                </strong>{" "}
                for <strong>"{selectedExpense.purpose}"</strong>?
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setIsReverseExpenseOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-btn amber-btn"
                onClick={handleReverseExpenseSubmit}
              >
                {isSaving ? "Reversing..." : " Confirm Reversal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
