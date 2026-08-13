import React, { useState } from "react";
import {
  PackagePlus,
  Boxes,
  Plus,
  Trash2,
  UploadCloud,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Calculator,
} from "lucide-react";
import { API_BASE_URL } from "../components/apiEnpoint";
import "../css/BulkInventory.css";

const CATEGORIES = [
  "Pipes & Plumbing",
  "Building Materials & Cement",
  "Electrical & Wiring",
  "Tools & Hardware",
  "Paints & Sealants",
  "Fasteners & Nails",
  "General Stock",
];

export default function BulkInventory() {
  // Main Form State
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "Pipes & Plumbing",
    packCount: "",
    unitsPerPack: "1",
    costPerPack: "",
    sellingPricePerUnit: "",
  });

  // Staged Batch List
  const [stagedItems, setStagedItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const token = localStorage.getItem("token")

  // Form Input Change Handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Real-Time Calculations
  const packCount = parseFloat(formData.packCount) || 0;
  const unitsPerPack = parseFloat(formData.unitsPerPack) || 1;
  const costPerPack = parseFloat(formData.costPerPack) || 0;
  const sellingPricePerUnit = parseFloat(formData.sellingPricePerUnit) || 0;

  const totalUnits = packCount * unitsPerPack;
  const totalCost = packCount * costPerPack;
  const unitCost = unitsPerPack > 0 ? costPerPack / unitsPerPack : 0;
  const totalRevenue = totalUnits * sellingPricePerUnit;
  const totalProfit = totalRevenue - totalCost;
  const profitMargin =
    totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const markupPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  // Margin Status Helper
  const getMarginHealth = (margin) => {
    if (margin >= 30) return { label: "High Margin", color: "health-green" };
    if (margin >= 15) return { label: "Moderate", color: "health-yellow" };
    if (margin > 0) return { label: "Low Margin", color: "health-orange" };
    return { label: "Loss / Zero", color: "health-red" };
  };

  // Smart Price Suggester (+X% Target Markup)
  const applyTargetMarkup = (targetPercent) => {
    if (unitCost <= 0) return;
    const suggestedUnitSelling = unitCost * (1 + targetPercent / 100);
    setFormData((prev) => ({
      ...prev,
      sellingPricePerUnit: suggestedUnitSelling.toFixed(2),
    }));
  };

  // Add Item to Staging Queue
  const handleStageItem = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || packCount <= 0 || costPerPack <= 0) {
      triggerNotification(
        "error",
        "Please fill in product name, pack count, and cost price.",
      );
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      name: formData.name,
      sku: formData.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category: formData.category,
      packCount,
      unitsPerPack,
      totalUnits,
      costPerPack,
      unitCost,
      sellingPricePerUnit,
      totalCost,
      totalRevenue,
      totalProfit,
      profitMargin,
    };

    setStagedItems((prev) => [newItem, ...prev]);
    triggerNotification("success", `Added "${formData.name}" to batch queue.`);

    // Reset Form
    setFormData({
      name: "",
      sku: "",
      category: "Pipes & Plumbing",
      packCount: "",
      unitsPerPack: "1",
      costPerPack: "",
      sellingPricePerUnit: "",
    });
  };

  // Remove Staged Item
  const handleRemoveStaged = (id) => {
    setStagedItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Trigger Toast Notification
  const triggerNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  // Overall Batch Metrics
  const batchTotalCost = stagedItems.reduce(
    (acc, item) => acc + item.totalCost,
    0,
  );
  const batchTotalRevenue = stagedItems.reduce(
    (acc, item) => acc + item.totalRevenue,
    0,
  );
  const batchTotalProfit = batchTotalRevenue - batchTotalCost;

  // Final Submit to Backend via Fetch API
  const handleBackendImport = async () => {
    if (stagedItems.length === 0) return;

    setIsSubmitting(true);
    try {
      const payload = {
        items: stagedItems.map((item) => ({
          name: item.name,
          sku: item.sku,
          category: item.category,
          packsPurchased: item.packCount,
          unitsPerPack: item.unitsPerPack,
          totalQuantity: item.totalUnits,
          costPricePerPack: item.costPerPack,
          unitCostPrice: Number(item.unitCost.toFixed(2)),
          unitSellingPrice: Number(item.sellingPricePerUnit),
          expectedProfit: Number(item.totalProfit.toFixed(2)),
        })),
      };

      const response = await fetch(`${API_BASE_URL}/api/product/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization":`Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to sync inventory with backend server.",
        );
      }

      triggerNotification(
        "success",
        `Successfully imported ${stagedItems.length} products to inventory!`,
      );
      setStagedItems([]);
    } catch (err) {
      triggerNotification(
        "error",
        err.message || "Failed to sync inventory with backend server.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const marginHealth = getMarginHealth(profitMargin);

  return (
    <div className="bulk-inventory-page">
      {/* Toast Notification */}
      {notification && (
        <div className={`toast-notification ${notification.type}`}>
          {notification.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="bulk-header">
        <div>
          <h2>
            <PackagePlus size={26} className="title-icon" />
            Bulk Stock Import & Profit Calculator
          </h2>
          <p>
            Log newly purchased bulk stock, analyze unit cost margins, and stage
            items before syncing to backend database.
          </p>
        </div>

        {/* Batch Overview Quick Stats */}
        {stagedItems.length > 0 && (
          <div className="batch-quick-summary">
            <div className="summary-pill">
              <span className="pill-label">Staged Items</span>
              <span className="pill-value">{stagedItems.length}</span>
            </div>
            <div className="summary-pill">
              <span className="pill-label">Total Outlay</span>
              <span className="pill-value">
                $
                {batchTotalCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="summary-pill profit-pill">
              <span className="pill-label">Est. Net Profit</span>
              <span className="pill-value">
                $
                {batchTotalProfit.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="bulk-grid">
        {/* LEFT COLUMN: Entry Form */}
        <div className="entry-card">
          <div className="card-header">
            <h3>Product Purchase Entry</h3>
            <span className="badge">Single / Pack Entry</span>
          </div>

          <form onSubmit={handleStageItem} className="entry-form">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                name="name"
                placeholder="e.g., PVC Pipe 3/4 Inch (10ft)"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>SKU / Product Code (Optional)</label>
                <input
                  type="text"
                  name="sku"
                  placeholder="AUTO-GENERATED IF BLANK"
                  value={formData.sku}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row three-col">
              <div className="form-group">
                <label>Pack Count *</label>
                <input
                  type="number"
                  name="packCount"
                  min="1"
                  placeholder="e.g. 5 boxes"
                  value={formData.packCount}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Units per Pack *</label>
                <input
                  type="number"
                  name="unitsPerPack"
                  min="1"
                  placeholder="e.g. 24 per box"
                  value={formData.unitsPerPack}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Cost per Pack ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="costPerPack"
                  placeholder="e.g. 120.00"
                  value={formData.costPerPack}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Price Suggester Feature */}
            <div className="price-suggester-box">
              <div className="suggester-title">
                <Sparkles size={16} />
                <span>Smart Target Pricing (Auto-fill Selling Price):</span>
              </div>
              <div className="suggester-buttons">
                <button type="button" onClick={() => applyTargetMarkup(25)}>
                  +25% Markup
                </button>
                <button type="button" onClick={() => applyTargetMarkup(35)}>
                  +35% Markup
                </button>
                <button type="button" onClick={() => applyTargetMarkup(50)}>
                  +50% Markup
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Target Selling Price per Unit ($) *</label>
              <input
                type="number"
                step="0.01"
                name="sellingPricePerUnit"
                placeholder="e.g. 7.50"
                value={formData.sellingPricePerUnit}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="add-to-stage-btn">
              <Plus size={18} />
              Calculate & Add to Batch Queue
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Real-Time Calculator Breakdown Card */}
        <div className="calculator-preview-card">
          <div className="card-header">
            <h3>
              <Calculator size={20} /> Live Margin Analysis
            </h3>
            {totalCost > 0 && (
              <span className={`health-badge ${marginHealth.color}`}>
                {marginHealth.label}
              </span>
            )}
          </div>

          <div className="metrics-list">
            <div className="metric-row">
              <span className="metric-label">Total Inventory Units:</span>
              <span className="metric-val">
                {totalUnits.toLocaleString()} units
              </span>
            </div>

            <div className="metric-row">
              <span className="metric-label">Unit Purchase Cost:</span>
              <span className="metric-val">${unitCost.toFixed(2)} / unit</span>
            </div>

            <div className="metric-row">
              <span className="metric-label">Total Purchase Outlay:</span>
              <span className="metric-val highlight-cost">
                $
                {totalCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="metric-row">
              <span className="metric-label">Expected Gross Revenue:</span>
              <span className="metric-val">
                $
                {totalRevenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="divider" />

            <div className="metric-row main-profit-row">
              <span className="metric-label">Est. Net Profit:</span>
              <span
                className={`metric-val ${
                  totalProfit >= 0 ? "text-green" : "text-red"
                }`}
              >
                $
                {totalProfit.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="profit-bar-container">
              <div className="bar-labels">
                <span>Profit Margin: {profitMargin.toFixed(1)}%</span>
                <span>Markup: {markupPercent.toFixed(1)}%</span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: `${Math.min(Math.max(profitMargin, 0), 100)}%`,
                    backgroundColor:
                      profitMargin >= 30
                        ? "#10b981"
                        : profitMargin >= 15
                          ? "#f59e0b"
                          : "#ef4444",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="calculator-info-box">
            <AlertCircle size={16} />
            <p>
              Prices exclude local tax & shipping costs. Ensure your target
              selling price covers store overheads.
            </p>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Staged Items Queue & Backend Sync */}
      <div className="staging-section">
        <div className="staging-header">
          <div>
            <h3>Batch Import Queue ({stagedItems.length})</h3>
            <p>
              Review items before committing changes to your inventory database.
            </p>
          </div>

          {stagedItems.length > 0 && (
            <button
              className="sync-backend-btn"
              onClick={handleBackendImport}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={18} className="spin" />
                  Syncing to Database...
                </>
              ) : (
                <>
                  <UploadCloud size={18} />
                  Import All ({stagedItems.length}) to Backend
                </>
              )}
            </button>
          )}
        </div>

        {stagedItems.length === 0 ? (
          <div className="empty-staging-state">
            <Boxes size={48} className="empty-icon" />
            <h4>Your Batch Queue is Empty</h4>
            <p>
              Use the form above to calculate profit margins and stage items for
              bulk backend import.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="staging-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Packs / Units</th>
                  <th>Total Cost</th>
                  <th>Selling Price</th>
                  <th>Expected Profit</th>
                  <th>Margin</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stagedItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="table-product-cell">
                        <span className="product-title">{item.name}</span>
                        <span className="product-sku">{item.sku}</span>
                      </div>
                    </td>
                    <td>
                      <span className="category-tag">{item.category}</span>
                    </td>
                    <td>
                      {item.packCount} pk ({item.totalUnits} pcs)
                    </td>
                    <td>${Number(item.totalCost).toFixed(2)}</td>
                    <td>
                      ${Number(item.sellingPricePerUnit).toFixed(2)} / unit
                    </td>
                    <td className="text-green font-semibold">
                      +${Number(item.totalProfit).toFixed(2)}
                    </td>
                    <td>
                      <span
                        className={`margin-pill ${
                          getMarginHealth(item.profitMargin).color
                        }`}
                      >
                        {Number(item.profitMargin).toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <button
                        className="delete-item-btn"
                        onClick={() => handleRemoveStaged(item.id)}
                        title="Remove item"
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
      </div>
    </div>
  );
}
