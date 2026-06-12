import React, { useState } from 'react';
import { SearchIcon, PlusIcon, TrashIcon, CloseIcon, WarningIcon, CustomerIcon } from './Icons';

export default function CustomerManager({ customers = [], onAddCustomer, onDeleteCustomer }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const defaultForm = { full_name: '', email: '', phone: '' };
  const [formData, setFormData] = useState(defaultForm);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (data) => {
    if (!data.full_name.trim()) return "Full name is required.";
    if (!data.email.trim()) return "Email address is required.";
    // Simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) return "Please enter a valid email address.";
    if (!data.phone.trim()) return "Phone number is required.";
    if (data.phone.trim().length < 5) return "Phone number seems too short.";
    return null;
  };

  const handleOpenAdd = () => {
    setFormData(defaultForm);
    setError(null);
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const valError = validateForm(formData);
    if (valError) {
      setError(valError);
      return;
    }

    try {
      const result = await onAddCustomer(formData);
      if (result.success) {
        showSuccess(`Customer "${formData.full_name}" added successfully.`);
        setIsAddModalOpen(false);
        setFormData(defaultForm);
      } else {
        setError(result.message || "Failed to add customer.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    }
  };

  const handleDelete = async (customer) => {
    if (window.confirm(`Are you sure you want to delete customer "${customer.full_name}"? This action cannot be undone.`)) {
      try {
        const result = await onDeleteCustomer(customer.id);
        if (result.success) {
          showSuccess(`Customer "${customer.full_name}" deleted successfully.`);
        } else {
          alert(result.message || "Failed to delete customer.");
        }
      } catch (err) {
        alert("An unexpected error occurred.");
      }
    }
  };

  // Filter customers by name, email or phone
  const filteredCustomers = customers.filter(c =>
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  return (
    <div>
      {/* Content Header */}
      <div className="content-header">
        <div>
          <h2 className="header-title">Customer Directory</h2>
          <p className="header-subtitle">Manage registered clients, contacts, and profile information.</p>
        </div>
      </div>

      {/* Success Alert */}
      {success && (
        <div className="alert alert-success">
          <span>✨</span>
          <div>{success}</div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="actions-bar">
        <div className="search-input-wrapper">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, email or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <PlusIcon /> Add Customer
        </button>
      </div>

      {/* Customer Table */}
      <div className="content-card glass">
        {filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h4 className="empty-state-title">No Customers Found</h4>
            <p className="empty-state-desc">
              {searchQuery
                ? "No customers match your search. Try a different name or email."
                : "Start by registering your first customer to the directory."}
            </p>
            {!searchQuery && (
              <button className="btn btn-primary" onClick={handleOpenAdd}>
                Add First Customer
              </button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th>Registered On</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, index) => (
                  <tr key={customer.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{index + 1}</td>
                    <td style={{ fontWeight: 600 }}>{customer.full_name}</td>
                    <td>
                      <a
                        href={`mailto:${customer.email}`}
                        style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
                      >
                        {customer.email}
                      </a>
                    </td>
                    <td>{customer.phone}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {new Date(customer.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn-icon-only danger"
                        title="Delete Customer"
                        onClick={() => handleDelete(customer)}
                      >
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <div className="modal-header">
              <h3 className="modal-title">Register New Customer</h3>
              <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>
                <CloseIcon />
              </button>
            </div>

            {error && (
              <div className="alert alert-danger" style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem' }}>
                <WarningIcon style={{ width: '16px', height: '16px' }} />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  className="form-control"
                  placeholder="e.g. John Smith"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="e.g. john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Register Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
