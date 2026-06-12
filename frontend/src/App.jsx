import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProductManager from './components/ProductManager';
import CustomerManager from './components/CustomerManager';
import OrderManager from './components/OrderManager';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function App() {
  const [currentView, setView] = useState('dashboard');

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(null);

  // Fetch base collections on initial mount
  const fetchAll = async () => {
    setLoading(true);
    setConnectionError(null);
    try {
      const [prodRes, custRes, ordRes] = await Promise.all([
        fetch(`${API_BASE_URL}/products`),
        fetch(`${API_BASE_URL}/customers`),
        fetch(`${API_BASE_URL}/orders`)
      ]);
      if (!prodRes.ok || !custRes.ok || !ordRes.ok) throw new Error("One or more API requests failed.");
      const [prodData, custData, ordData] = await Promise.all([
        prodRes.json(), custRes.json(), ordRes.json()
      ]);
      setProducts(prodData);
      setCustomers(custData);
      setOrders(ordData);
    } catch (err) {
      setConnectionError("Could not connect to the backend. Make sure Docker containers are running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Products CRUD handlers
  const handleAddProduct = async (data) => {
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
      });
      const json = await res.json();
      if (res.ok) { setProducts(prev => [...prev, json]); return { success: true }; }
      return { success: false, message: json.detail || "Error adding product" };
    } catch { return { success: false, message: "Network error" }; }
  };

  const handleUpdateProduct = async (id, data) => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
      });
      const json = await res.json();
      if (res.ok) { setProducts(prev => prev.map(p => p.id === id ? json : p)); return { success: true }; }
      return { success: false, message: json.detail || "Error updating product" };
    } catch { return { success: false, message: "Network error" }; }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
      if (res.status === 204 || res.ok) { setProducts(prev => prev.filter(p => p.id !== id)); return { success: true }; }
      const json = await res.json();
      return { success: false, message: json.detail || "Error deleting product" };
    } catch { return { success: false, message: "Network error" }; }
  };

  // Customers CRUD handlers
  const handleAddCustomer = async (data) => {
    try {
      const res = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
      });
      const json = await res.json();
      if (res.ok) { setCustomers(prev => [...prev, json]); return { success: true }; }
      return { success: false, message: json.detail || "Error adding customer" };
    } catch { return { success: false, message: "Network error" }; }
  };

  const handleDeleteCustomer = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/customers/${id}`, { method: 'DELETE' });
      if (res.status === 204 || res.ok) { setCustomers(prev => prev.filter(c => c.id !== id)); return { success: true }; }
      const json = await res.json();
      return { success: false, message: json.detail || "Error deleting customer" };
    } catch { return { success: false, message: "Network error" }; }
  };

  // Orders transaction handlers
  const handleCreateOrder = async (data) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
      });
      const json = await res.json();
      if (res.ok) {
        setOrders(prev => [json, ...prev]);
        // Re-fetch products so stock quantities are refreshed in the UI
        const prodRes = await fetch(`${API_BASE_URL}/products`);
        if (prodRes.ok) setProducts(await prodRes.json());
        return { success: true, order: json };
      }
      return { success: false, message: json.detail || "Error creating order" };
    } catch { return { success: false, message: "Network error" }; }
  };

  const handleCancelOrder = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}`, { method: 'DELETE' });
      if (res.status === 204 || res.ok) {
        setOrders(prev => prev.filter(o => o.id !== id));
        // Refresh products since stock is restored on cancel
        const prodRes = await fetch(`${API_BASE_URL}/products`);
        if (prodRes.ok) setProducts(await prodRes.json());
        return { success: true };
      }
      const json = await res.json();
      return { success: false, message: json.detail || "Error cancelling order" };
    } catch { return { success: false, message: "Network error" }; }
  };

  // View router component switch
  const renderView = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="spinner spinner-lg"></div>
          <p>Connecting to Stock Manager...</p>
        </div>
      );
    }
    if (connectionError) {
      return (
        <div className="empty-state" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
          <div className="empty-state-icon" style={{ color: 'var(--color-danger)' }}>⚠️</div>
          <h4 className="empty-state-title">Backend Connection Offline</h4>
          <p className="empty-state-desc">{connectionError}</p>
          <button className="btn btn-primary" onClick={fetchAll}>Retry Connection</button>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard products={products} customers={customers} orders={orders} setView={setView} />;
      case 'products':
        return <ProductManager products={products} onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} />;
      case 'customers':
        return <CustomerManager customers={customers} onAddCustomer={handleAddCustomer}
          onDeleteCustomer={handleDeleteCustomer} />;
      case 'orders':
        return <OrderManager orders={orders} customers={customers} products={products}
          onCreateOrder={handleCreateOrder} onCancelOrder={handleCancelOrder} />;
      default:
        return <Dashboard products={products} customers={customers} orders={orders} setView={setView} />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setView}>
      {renderView()}
    </Layout>
  );
}
