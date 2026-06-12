import React from 'react';

export function CustomerPlaceholder() {
  return (
    <div>
      <div className="content-header">
        <div>
          <h2 className="header-title">Customer Directory</h2>
          <p className="header-subtitle">Manage client profiles, contact information, and order history.</p>
        </div>
      </div>
      
      <div className="content-card glass" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>👥</div>
        <h3 className="card-title" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Customer Management (Phase 2)</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
          This component will enable the register of business clients, complete profile tracking (name, email, phone), and links to order histories. It is scheduled to be unlocked in the next segment.
        </p>
        <div style={{ display: 'inline-flex', gap: '0.75rem', justifyContent: 'center' }}>
          <span className="badge badge-info" style={{ padding: '0.5rem 1rem' }}>POST /customers</span>
          <span className="badge badge-info" style={{ padding: '0.5rem 1rem' }}>GET /customers</span>
          <span className="badge badge-info" style={{ padding: '0.5rem 1rem' }}>DELETE /customers</span>
        </div>
      </div>
    </div>
  );
}

export function OrderPlaceholder() {
  return (
    <div>
      <div className="content-header">
        <div>
          <h2 className="header-title">Order Ledger</h2>
          <p className="header-subtitle">Track receipts, generate orders, and monitor warehouse dispatch status.</p>
        </div>
      </div>
      
      <div className="content-card glass" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🛒</div>
        <h3 className="card-title" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Order Management & Fulfillment (Phase 3)</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
          This system will orchestrate product checkout workflows, decrement stock upon checkout validation, auto-calculate subtotals, and link clients to order details.
        </p>
        <div style={{ display: 'inline-flex', gap: '0.75rem', justifyContent: 'center' }}>
          <span className="badge badge-info" style={{ padding: '0.5rem 1rem' }}>POST /orders</span>
          <span className="badge badge-info" style={{ padding: '0.5rem 1rem' }}>GET /orders</span>
          <span className="badge badge-info" style={{ padding: '0.5rem 1rem' }}>DELETE /orders</span>
        </div>
      </div>
    </div>
  );
}
