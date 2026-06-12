import React, { useState } from 'react';
import { PlusIcon, TrashIcon, CloseIcon, WarningIcon, SearchIcon } from './Icons';

export default function OrderManager({ orders = [], customers = [], products = [], onCreateOrder, onCancelOrder }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state for creating an order
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderLines, setOrderLines] = useState([{ product_id: '', quantity: 1 }]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 5000);
  };

  // ── Order lines helpers ─────────────────────────────────
  const addOrderLine = () => {
    setOrderLines(prev => [...prev, { product_id: '', quantity: 1 }]);
  };

  const removeOrderLine = (index) => {
    setOrderLines(prev => prev.filter((_, i) => i !== index));
  };

  const updateOrderLine = (index, field, value) => {
    setOrderLines(prev => prev.map((line, i) =>
      i === index ? { ...line, [field]: field === 'quantity' ? parseInt(value) || 1 : value } : line
    ));
  };

  // Calculate running total from current form selections
  const calculateRunningTotal = () => {
    return orderLines.reduce((total, line) => {
      const product = products.find(p => p.id === parseInt(line.product_id));
      if (product && line.quantity > 0) {
        return total + (product.price * line.quantity);
      }
      return total;
    }, 0);
  };

  // ── Form open/close ─────────────────────────────────────
  const handleOpenCreate = () => {
    setSelectedCustomerId('');
    setOrderLines([{ product_id: '', quantity: 1 }]);
    setError(null);
    setIsCreateModalOpen(true);
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  // ── Submit order ────────────────────────────────────────
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedCustomerId) {
      setError("Please select a customer.");
      return;
    }
    const validLines = orderLines.filter(l => l.product_id !== '');
    if (validLines.length === 0) {
      setError("Please add at least one product to the order.");
      return;
    }
    for (const line of validLines) {
      if (!line.quantity || line.quantity < 1) {
        setError("All product quantities must be at least 1.");
        return;
      }
      const product = products.find(p => p.id === parseInt(line.product_id));
      if (product && line.quantity > product.quantity) {
        setError(`Insufficient stock for "${product.name}". Only ${product.quantity} units available.`);
        return;
      }
    }

    const payload = {
      customer_id: parseInt(selectedCustomerId),
      items: validLines.map(l => ({
        product_id: parseInt(l.product_id),
        quantity: l.quantity
      }))
    };

    try {
      const result = await onCreateOrder(payload);
      if (result.success) {
        showSuccess(`Order #${result.order.id} created successfully. Total: $${result.order.total_amount.toFixed(2)}`);
        setIsCreateModalOpen(false);
      } else {
        setError(result.message || "Failed to create order.");
      }
    } catch {
      setError("An unexpected error occurred.");
    }
  };

  // ── Cancel order ────────────────────────────────────────
  const handleCancelOrder = async (order) => {
    if (window.confirm(`Cancel Order #${order.id}? This will restore the stock for all items.`)) {
      const result = await onCancelOrder(order.id);
      if (result.success) {
        showSuccess(`Order #${order.id} cancelled. Stock has been restored.`);
        if (isDetailModalOpen) setIsDetailModalOpen(false);
      } else {
        alert(result.message || "Failed to cancel order.");
      }
    }
  };

  const runningTotal = calculateRunningTotal();

  return (
    <div>
      {/* Header */}
      <div className="content-header">
        <div>
          <h2 className="header-title">Order Ledger</h2>
          <p className="header-subtitle">Create orders, track fulfillment, and manage stock deductions automatically.</p>
        </div>
      </div>

      {/* Success Alert */}
      {success && (
        <div className="alert alert-success">
          <span>✅</span>
          <div>{success}</div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="actions-bar" style={{ justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={handleOpenCreate}
          disabled={customers.length === 0 || products.length === 0}>
          <PlusIcon /> Create Order
        </button>
      </div>

      {/* Warnings if no customers or products */}
      {(customers.length === 0 || products.length === 0) && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <WarningIcon />
          <div>
            {customers.length === 0 && products.length === 0
              ? "You need at least one customer and one product before creating an order."
              : customers.length === 0
                ? "No customers found. Add a customer first before creating an order."
                : "No products found. Add a product first before creating an order."}
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="content-card glass">
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <h4 className="empty-state-title">No Orders Yet</h4>
            <p className="empty-state-desc">
              Orders you create will appear here. Each order automatically calculates totals and adjusts stock levels.
            </p>
            {customers.length > 0 && products.length > 0 && (
              <button className="btn btn-primary" onClick={handleOpenCreate}>
                Create First Order
              </button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <span className="badge badge-info">#{order.id}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{order.customer_name}</td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--color-accent)' }}>
                      ${order.total_amount.toFixed(2)}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => handleViewDetail(order)}
                        >
                          Details
                        </button>
                        <button
                          className="btn-icon-only danger"
                          title="Cancel Order"
                          onClick={() => handleCancelOrder(order)}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create Order Modal ────────────────────────────── */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Order</h3>
              <button className="modal-close" onClick={() => setIsCreateModalOpen(false)}>
                <CloseIcon />
              </button>
            </div>

            {error && (
              <div className="alert alert-danger" style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem' }}>
                <WarningIcon style={{ width: '16px', height: '16px' }} />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleCreateSubmit}>
              {/* Customer Selection */}
              <div className="form-group">
                <label className="form-label">Select Customer</label>
                <select
                  className="form-control"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  required
                >
                  <option value="">-- Choose a customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                  ))}
                </select>
              </div>

              {/* Order Items */}
              <div className="form-group">
                <label className="form-label" style={{ marginBottom: '0.75rem' }}>
                  Order Items
                </label>

                {orderLines.map((line, index) => {
                  const selectedProduct = products.find(p => p.id === parseInt(line.product_id));
                  return (
                    <div key={index} style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 100px auto',
                      gap: '0.75rem',
                      marginBottom: '0.75rem',
                      alignItems: 'center'
                    }}>
                      <select
                        className="form-control"
                        value={line.product_id}
                        onChange={(e) => updateOrderLine(index, 'product_id', e.target.value)}
                      >
                        <option value="">-- Select product --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                            {p.name} — ${p.price.toFixed(2)} (Stock: {p.quantity})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        max={selectedProduct ? selectedProduct.quantity : 9999}
                        value={line.quantity}
                        onChange={(e) => updateOrderLine(index, 'quantity', e.target.value)}
                        placeholder="Qty"
                      />

                      <button
                        type="button"
                        className="btn-icon-only danger"
                        onClick={() => removeOrderLine(index)}
                        disabled={orderLines.length === 1}
                        title="Remove line"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  );
                })}

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ marginTop: '0.5rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                  onClick={addOrderLine}
                >
                  <PlusIcon /> Add Another Product
                </button>
              </div>

              {/* Running Total */}
              {runningTotal > 0 && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Estimated Total</span>
                  <span style={{ color: 'var(--color-accent)', fontSize: '1.25rem', fontWeight: 700 }}>
                    ${runningTotal.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Order Detail Modal ────────────────────────────── */}
      {isDetailModalOpen && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Order #{selectedOrder.id}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  {new Date(selectedOrder.created_at).toLocaleString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <button className="modal-close" onClick={() => setIsDetailModalOpen(false)}>
                <CloseIcon />
              </button>
            </div>

            {/* Customer Info */}
            <div style={{
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.15)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>CUSTOMER</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedOrder.customer_name}</div>
            </div>

            {/* Items Table */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                ORDER ITEMS
              </div>
              <table className="custom-table" style={{ fontSize: '0.9rem' }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Unit Price</th>
                    <th>Qty</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 500 }}>{item.product_name}</td>
                      <td>${item.unit_price.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>${item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '1rem',
              marginBottom: '1.5rem'
            }}>
              <span style={{ fontWeight: 600, fontSize: '1rem' }}>Total Amount</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-accent)' }}>
                ${selectedOrder.total_amount.toFixed(2)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                className="btn btn-danger"
                onClick={() => handleCancelOrder(selectedOrder)}
              >
                <TrashIcon /> Cancel Order
              </button>
              <button className="btn btn-secondary" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
