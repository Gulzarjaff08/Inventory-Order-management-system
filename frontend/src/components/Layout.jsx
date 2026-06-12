import React from 'react';
import { DashboardIcon, ProductIcon, CustomerIcon, OrderIcon } from './Icons';

export default function Layout({ children, currentView, setView }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'products', label: 'Products', icon: <ProductIcon /> },
    { id: 'customers', label: 'Customers', icon: <CustomerIcon /> },
    { id: 'orders', label: 'Orders', icon: <OrderIcon /> }
  ];

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <h1 className="brand-name">Stock Manager</h1>
        </div>
        
        <nav style={{ flexGrow: 1 }}>
          <ul className="nav-menu">
            {menuItems.map(item => (
              <li key={item.id}>
                <a 
                  className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                  onClick={() => setView(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <p>v1.0.0</p>
          <p style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>Active Session</p>
        </div>
      </aside>
      
      {/* Main Content Pane */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
