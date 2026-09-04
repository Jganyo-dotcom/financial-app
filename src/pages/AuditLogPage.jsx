import React, { useState, useEffect, useMemo } from "react";
import {
  Activity,
  Search,
  RotateCcw,
  ShoppingBag,
  Package,
  Key,
  DollarSign,
  ShieldAlert,
  User,
  Clock,
  Globe,
  X,
  CheckCircle2,
  XCircle,
  FolderTree,
  Hash,
  Receipt,
  Tag,
  CreditCard,
  ListOrdered,
  RefreshCw,
  Calendar,
} from "lucide-react";

import "../css/AuditLogPage.css";
import { API_BASE_URL } from "../components/apiEnpoint";

export const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchAuditLogs = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${API_BASE_URL}/api/product/audit-logs`, {
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${token}`,
          },
        });
        const resData = await response.json();

        if (resData.success && Array.isArray(resData.data)) {
          setLogs(resData.data);
        } else if (Array.isArray(resData)) {
          setLogs(resData);
        }
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  // Dynamically extract unique actions for filter dropdown
  const uniqueActions = useMemo(() => {
    const actions = new Set(logs.map((log) => log.action).filter(Boolean));
    return Array.from(actions).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const query = searchQuery.toLowerCase();

      const actorName = log.userId?.name || "";
      const actorEmail = log.userId?.email || "";
      const action = log.action || "";
      const message = log.message || "";
      const status = log.status || "";
      const entityType = log.entityType || "";

      // Entity level search checks
      const targetName =
        typeof log.entityId === "object" && log.entityId
          ? log.entityId.fullName ||
            log.entityId.name ||
            log.entityId.productCode ||
            ""
          : "";

      const matchesSearch =
        !searchQuery ||
        action.toLowerCase().includes(query) ||
        message.toLowerCase().includes(query) ||
        actorName.toLowerCase().includes(query) ||
        actorEmail.toLowerCase().includes(query) ||
        status.toLowerCase().includes(query) ||
        entityType.toLowerCase().includes(query) ||
        targetName.toLowerCase().includes(query);

      const matchesType = actionFilter === "ALL" || log.action === actionFilter;

      const logDate = new Date(log.createdAt).getTime();
      const matchesStart =
        !startDate || logDate >= new Date(startDate).getTime();
      const matchesEnd =
        !endDate || logDate <= new Date(`${endDate}T23:59:59`).getTime();

      return matchesSearch && matchesType && matchesStart && matchesEnd;
    });
  }, [logs, searchQuery, actionFilter, startDate, endDate]);

  const resetFilters = () => {
    setSearchQuery("");
    setActionFilter("ALL");
    setStartDate("");
    setEndDate("");
  };

  const getActionBadge = (action, status) => {
    if (status === "Failed") {
      return {
        icon: <ShieldAlert className="badge-icon icon-rose" />,
        className: "badge-failed",
      };
    }

    switch (action?.toUpperCase()) {
      case "LOGIN":
      case "USER_LOGIN":
        return {
          icon: <Key className="badge-icon icon-indigo" />,
          className: "badge-indigo",
        };

      case "SALE":
      case "SALE_CREATED":
      case "SERVE_CUSTOMER":
      case "CUSTOMER_ADDED":
        return {
          icon: <ShoppingBag className="badge-icon icon-emerald" />,
          className: "badge-emerald",
        };

      case "STOCK":
      case "STOCK_ADJUSTED":
      case "CREATE_PRODUCT":
      case "CREATE_PRODUCT_BULK":
      case "UPDATE_PRODUCT":
        return {
          icon: <Package className="badge-icon icon-blue" />,
          className: "badge-blue",
        };

      case "CREATE_EXPENSE":
        return {
          icon: <Receipt className="badge-icon icon-amber" />,
          className: "badge-amber",
        };

      case "REVERSE_EXPENSE":
        return {
          icon: <RefreshCw className="badge-icon icon-rose" />,
          className: "badge-failed",
        };

      case "PRICE_OVERRIDE":
        return {
          icon: <DollarSign className="badge-icon icon-amber" />,
          className: "badge-amber",
        };

      default:
        return {
          icon: <Activity className="badge-icon icon-slate" />,
          className: "badge-slate",
        };
    }
  };

  const formatEntityId = (entity) => {
    if (!entity) return "None";
    if (typeof entity === "object") {
      return entity._id || "Populated Object";
    }
    return String(entity);
  };

  const getTargetName = (entity) => {
    if (!entity || typeof entity !== "object") return "N/A";
    return (
      entity.fullName ||
      entity.name ||
      entity.productCode ||
      entity.reference ||
      "N/A"
    );
  };

  return (
    <div className="audit-container">
      <div className="audit-wrapper">
        {/* Header */}
        <div className="audit-header">
          <div className="audit-title-group">
            <div className="audit-icon-badge">
              <Activity className="header-icon" />
            </div>
            <div>
              <h1 className="audit-title">Company Audit Logs</h1>
              <p className="audit-subtitle">
                Live action history recorded across your organization.
              </p>
            </div>
          </div>
          <span className="log-counter-badge">
            Showing {filteredLogs.length} of {logs.length}
          </span>
        </div>

        {/* Filters */}
        <div className="filter-toolbar">
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search message, user, status, target..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-input"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Actions</option>
            {uniqueActions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>

          {/* Compact Professional Date Range Selector */}
          <div className="date-range-group">
            <Calendar className="date-group-icon" />
            <div className="date-input-field">
              <span className="date-label">From</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="filter-date-input"
              />
            </div>
            <span className="date-separator">-</span>
            <div className="date-input-field">
              <span className="date-label">To</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="filter-date-input"
              />
            </div>
          </div>

          <button onClick={resetFilters} className="clear-btn">
            <RotateCcw className="reset-icon" /> Reset
          </button>
        </div>

        {/* Logs Feed */}
        {loading ? (
          <div className="status-state-msg">Loading audit feed...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="empty-state-msg">
            No events match your selected criteria.
          </div>
        ) : (
          <div className="logs-list">
            {filteredLogs.map((log) => {
              const { icon, className } = getActionBadge(
                log.action,
                log.status,
              );
              const actorName = log.userId?.name || "System User";
              const actorRole = log.userId?.role || "Staff";
              const isSuccess = log.status === "Successful";

              return (
                <div
                  key={log._id}
                  onClick={() => setSelectedLog(log)}
                  className="log-card"
                >
                  <div className="log-card-left">
                    <div className="log-icon-wrapper">{icon}</div>
                    <div className="log-content-main">
                      <div className="log-badge-group">
                        <span className={`log-type-badge ${className}`}>
                          {log.action}
                        </span>
                        <span
                          className={`log-status-badge ${
                            isSuccess ? "status-success" : "status-failed"
                          }`}
                        >
                          {isSuccess ? (
                            <CheckCircle2 className="status-icon" />
                          ) : (
                            <XCircle className="status-icon" />
                          )}
                          {log.status}
                        </span>
                      </div>
                      <p className="log-message">{log.message}</p>
                    </div>
                  </div>

                  <div className="log-card-right">
                    <span className="actor-info">
                      <User className="actor-icon" /> {actorName}
                      <span className="actor-role">({actorRole})</span>
                    </span>
                    <span className="log-time">
                      <Clock className="time-icon" />
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {selectedLog && (
          <div
            className="audit-modal-overlay"
            onClick={() => setSelectedLog(null)}
          >
            <div
              className="audit-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="modal-header">
                <div className="modal-header-left">
                  <div className="modal-icon-box">
                    {
                      getActionBadge(selectedLog.action, selectedLog.status)
                        .icon
                    }
                  </div>
                  <div>
                    <h3 className="modal-title">Audit Log Details</h3>
                    <p className="modal-id">ID: {selectedLog._id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="modal-close-btn"
                >
                  <X className="close-icon" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="modal-body">
                <div className="modal-message-box">
                  <span className="modal-label">Event Log Message</span>
                  <p className="modal-message-text">{selectedLog.message}</p>
                </div>

                <div className="modal-grid-2">
                  <div className="modal-info-card">
                    <span className="modal-label">Action Type</span>
                    <span
                      className={`log-type-badge ${
                        getActionBadge(selectedLog.action, selectedLog.status)
                          .className
                      }`}
                    >
                      {selectedLog.action}
                    </span>
                  </div>

                  <div className="modal-info-card">
                    <span className="modal-label">Status</span>
                    <span
                      className={`log-status-badge ${
                        selectedLog.status === "Successful"
                          ? "status-success"
                          : "status-failed"
                      }`}
                    >
                      {selectedLog.status === "Successful" ? (
                        <CheckCircle2 className="status-icon" />
                      ) : (
                        <XCircle className="status-icon" />
                      )}
                      {selectedLog.status}
                    </span>
                  </div>
                </div>

                {/* Executed By Section */}
                <div className="modal-info-card space-y">
                  <span className="modal-label">Executed By</span>
                  <div className="modal-grid-2 text-small">
                    <div>
                      <span className="sub-label">Name:</span>
                      <p className="val-bold flex-center">
                        <User className="small-icon" />
                        {selectedLog.userId?.name || "System User"}
                      </p>
                    </div>
                    <div>
                      <span className="sub-label">Role:</span>
                      <p className="val-indigo">
                        {selectedLog.userId?.role || "N/A"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="sub-label">Email:</span>
                      <p className="val-mono">
                        {selectedLog.userId?.email || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scope & Target Section */}
                <div className="modal-info-card space-y">
                  <span className="modal-label">Scope & Target</span>
                  <div className="modal-grid-2 text-small">
                    <div>
                      <span className="sub-label flex-center">
                        <FolderTree className="small-icon" /> Entity Type:
                      </span>
                      <p className="val-bold">
                        {selectedLog.entityType || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="sub-label flex-center">
                        <Globe className="small-icon" /> Path:
                      </span>
                      <p className="val-bold">{selectedLog.path || "N/A"}</p>
                    </div>

                    {typeof selectedLog.entityId === "object" &&
                      selectedLog.entityId !== null && (
                        <div className="col-span-2">
                          <span className="sub-label">
                            Target Name / Reference:
                          </span>
                          <p className="val-bold">
                            {getTargetName(selectedLog.entityId)}
                          </p>
                        </div>
                      )}

                    <div className="col-span-2">
                      <span className="sub-label flex-center">
                        <Hash className="small-icon" /> Entity ID:
                      </span>
                      <p className="val-mono">
                        {formatEntityId(selectedLog.entityId)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Extended Details: Sale / Customer Payload */}
                {typeof selectedLog.entityId === "object" &&
                  selectedLog.entityId?.fullName && (
                    <div className="modal-info-card space-y">
                      <span className="modal-label flex-center">
                        <CreditCard className="small-icon" /> Customer & Billing
                        Summary
                      </span>
                      <div className="modal-grid-2 text-small">
                        <div>
                          <span className="sub-label">Phone:</span>
                          <p className="val-mono">
                            {selectedLog.entityId.phone || "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="sub-label">Payment Method:</span>
                          <p className="val-bold">
                            {selectedLog.entityId.paymentMethod || "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="sub-label">Total Amount:</span>
                          <p className="val-bold">
                            ${selectedLog.entityId.totalAmount ?? 0}
                          </p>
                        </div>
                        <div>
                          <span className="sub-label">
                            Amount Paid / Spent:
                          </span>
                          <p className="val-indigo">
                            ${selectedLog.entityId.amountSpent ?? 0}
                          </p>
                        </div>
                      </div>

                      {/* Items Purchased List */}
                      {Array.isArray(selectedLog.entityId.items) &&
                        selectedLog.entityId.items.length > 0 && (
                          <div style={{ marginTop: "8px" }}>
                            <span
                              className="sub-label flex-center"
                              style={{ marginBottom: "4px" }}
                            >
                              <ListOrdered className="small-icon" /> Line Items
                              Purchased:
                            </span>
                            <div className="items-breakdown-list">
                              {selectedLog.entityId.items.map((item, idx) => (
                                <div key={idx} className="item-breakdown-row">
                                  <span>{item.name || "Item"}</span>
                                  <span className="val-mono">
                                    {item.qty} x ${item.unitPrice} = $
                                    {(item.qty * item.unitPrice).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                {/* Extended Details: Product Payload */}
                {typeof selectedLog.entityId === "object" &&
                  selectedLog.entityId?.productCode && (
                    <div className="modal-info-card space-y">
                      <span className="modal-label flex-center">
                        <Tag className="small-icon" /> Product Details
                      </span>
                      <div className="modal-grid-2 text-small">
                        <div>
                          <span className="sub-label">SKU Code:</span>
                          <p className="val-mono">
                            {selectedLog.entityId.productCode}
                          </p>
                        </div>
                        <div>
                          <span className="sub-label">Category:</span>
                          <p className="val-bold">
                            {selectedLog.entityId.category || "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="sub-label">Unit Price:</span>
                          <p className="val-bold">
                            ${selectedLog.entityId.unitPrice ?? 0}
                          </p>
                        </div>
                        <div>
                          <span className="sub-label">Current Stock:</span>
                          <p className="val-indigo">
                            {selectedLog.entityId.stockQuantity ?? 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                <div className="modal-time-footer">
                  <span>Recorded At:</span>
                  <span className="val-mono">
                    {new Date(selectedLog.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="modal-action-btn"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
