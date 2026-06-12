import React from 'react';
import { ProductIcon, CustomerIcon, OrderIcon, WarningIcon } from './Icons';

export default function Dashboard({ products = [], customers = [], orders = [], setView }) {
  // Constants
  const LOW_STOCK_THRESHOLD = 5;
  
  // Calculate statistics
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.quantity <= LOW_STOCK_THRESHOLD);
  const lowStockCount = lowStockProducts.length;

  // Real counts
  const totalCustomers = customers.length;
  const totalOrders = orders.length;

  return (
    <div>
      <div className="content-header">
        <div>
          <h2 className="header-title">Overview Dashboard</h2>
          <p className="header-subtitle">Real-time status of products, stock levels, and operations.</p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card glass primary" onClick={() => setView('products')} style={{ cursor: 'pointer' }}>
          <div className="stat-card-glow" />
          <div className="stat-title">Total Products</div>
          <div className="stat-value">{totalProducts}</div>
          <div className="stat-desc">Active items in catalog</div>
        </div>

        <div className="stat-card glass accent" onClick={() => setView('customers')} style={{ cursor: 'pointer' }}>
          <div className="stat-title">Total Customers</div>
          <div className="stat-value">{totalCustomers}</div>
          <div className="stat-desc">Registered clients</div>
        </div>

        <div className="stat-card glass secondary" onClick={() => setView('orders')} style={{ cursor: 'pointer' }}>
          <div className="stat-title">Total Orders</div>
          <div className="stat-value">{totalOrders}</div>
          <div className="stat-desc">Processed orders</div>
        </div>

        <div className="stat-card glass warning">
          <div className="stat-card-glow" style={{ background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)' }} />
          <div className="stat-title" style={{ color: lowStockCount > 0 ? 'var(--color-warning)' : 'var(--text-secondary)' }}>
            Low Stock Alerts
          </div>
          <div className="stat-value" style={{ color: lowStockCount > 0 ? 'var(--color-warning)' : 'var(--text-primary)' }}>
            {lowStockCount}
          </div>
          <div className="stat-desc">
            {lowStockCount > 0 ? (
              <span className="danger">Requires immediate restock</span>
            ) : (
              "Inventory levels healthy"
            )}
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="content-card glass">
        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {lowStockCount > 0 && <WarningIcon style={{ color: 'var(--color-warning)' }} />}
          Low Stock Inventory ({lowStockCount})
        </h3>

        {lowStockCount === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✅</p>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>All items are well stocked</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>No products have quantities below {LOW_STOCK_THRESHOLD} units.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map(product => (
                  <tr key={product.id}>
                    <td style={{ fontWeight: 600 }}>{product.name}</td>
                    <td><code style={{ fontSize: '0.8rem' }}>{product.sku}</code></td>
                    <td>${Number(product.price).toFixed(2)}</td>
                    <td style={{ fontWeight: 600, color: product.quantity === 0 ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                      {product.quantity}
                    </td>
                    <td>
                      {product.quantity === 0 ? (
                        <span className="badge badge-danger">Out of stock</span>
                      ) : (
                        <span className="badge badge-warning">Low stock</span>
                      )}
                    </td>
                    <td>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => setView('products')}
                      >
                        Restock
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
