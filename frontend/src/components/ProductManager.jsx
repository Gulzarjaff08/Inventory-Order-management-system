import React, { useState } from 'react';
import { SearchIcon, PlusIcon, EditIcon, TrashIcon, CloseIcon, WarningIcon } from './Icons';

export default function ProductManager({ products = [], onAddProduct, onUpdateProduct, onDeleteProduct }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Alert Feedbacks
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form State
  const defaultForm = { name: '', sku: '', price: '', quantity: '' };
  const [formData, setFormData] = useState(defaultForm);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? (value === '' ? '' : parseInt(value)) : name === 'price' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };

  const validateForm = (data) => {
    if (!data.name.trim()) return "Product Name is required.";
    if (!data.sku.trim()) return "Product SKU is required.";
    if (data.price === '' || isNaN(data.price) || data.price < 0) return "Price must be a positive number.";
    if (data.quantity === '' || isNaN(data.quantity) || data.quantity < 0) return "Stock quantity cannot be negative.";
    return null;
  };

  const handleOpenAdd = () => {
    setFormData(defaultForm);
    setError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: product.quantity
    });
    setError(null);
    setIsEditModalOpen(true);
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
      const result = await onAddProduct(formData);
      if (result.success) {
        showSuccess(`Product "${formData.name}" added successfully.`);
        setIsAddModalOpen(false);
        setFormData(defaultForm);
      } else {
        setError(result.message || "Failed to add product.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    const valError = validateForm(formData);
    if (valError) {
      setError(valError);
      return;
    }

    try {
      const result = await onUpdateProduct(selectedProduct.id, formData);
      if (result.success) {
        showSuccess(`Product "${formData.name}" updated successfully.`);
        setIsEditModalOpen(false);
        setSelectedProduct(null);
      } else {
        setError(result.message || "Failed to update product.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    }
  };

  const handleDelete = async (product) => {
    if (window.confirm(`Are you sure you want to delete the product "${product.name}"?`)) {
      try {
        const result = await onDeleteProduct(product.id);
        if (result.success) {
          showSuccess(`Product "${product.name}" deleted successfully.`);
        } else {
          alert(result.message || "Failed to delete product.");
        }
      } catch (err) {
        alert("An unexpected error occurred.");
      }
    }
  };

  // Filter products based on search query
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Content Header */}
      <div className="content-header">
        <div>
          <h2 className="header-title">Product Catalog</h2>
          <p className="header-subtitle">Manage products, stock quantities, pricing, and SKUs.</p>
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
            placeholder="Search by name or SKU..." 
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <PlusIcon /> Add Product
        </button>
      </div>

      {/* Catalog Table */}
      <div className="content-card glass">
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h4 className="empty-state-title">No Products Found</h4>
            <p className="empty-state-desc">
              {searchQuery ? "Try refining your search query." : "Start by adding a new product to your inventory database."}
            </p>
            {!searchQuery && (
              <button className="btn btn-primary" onClick={handleOpenAdd}>
                Add First Product
              </button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU Code</th>
                  <th>Price</th>
                  <th>In Stock</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td style={{ fontWeight: 600 }}>{product.name}</td>
                    <td><code>{product.sku}</code></td>
                    <td>${Number(product.price).toFixed(2)}</td>
                    <td style={{ fontWeight: 500 }}>{product.quantity}</td>
                    <td>
                      {product.quantity === 0 ? (
                        <span className="badge badge-danger">Out of stock</span>
                      ) : product.quantity <= 5 ? (
                        <span className="badge badge-warning">Low stock</span>
                      ) : (
                        <span className="badge badge-success">Available</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                        <button 
                          className="btn-icon-only" 
                          title="Edit Product"
                          onClick={() => handleOpenEdit(product)}
                        >
                          <EditIcon />
                        </button>
                        <button 
                          className="btn-icon-only danger" 
                          title="Delete Product"
                          onClick={() => handleDelete(product)}
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

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <div className="modal-header">
              <h3 className="modal-title">Add New Product</h3>
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
                <label className="form-label">Product Name</label>
                <input 
                  type="text" 
                  name="name"
                  className="form-control" 
                  placeholder="e.g. Wireless Mouse" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">SKU / Code</label>
                <input 
                  type="text" 
                  name="sku"
                  className="form-control" 
                  placeholder="e.g. MOUSE-WRLS-01" 
                  value={formData.sku}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Price ($)</label>
                  <input 
                    type="number" 
                    name="price"
                    step="0.01"
                    min="0"
                    className="form-control" 
                    placeholder="29.99" 
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Stock Quantity</label>
                  <input 
                    type="number" 
                    name="quantity"
                    min="0"
                    className="form-control" 
                    placeholder="100" 
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <div className="modal-header">
              <h3 className="modal-title">Edit Product Details</h3>
              <button className="modal-close" onClick={() => setIsEditModalOpen(false)}>
                <CloseIcon />
              </button>
            </div>
            
            {error && (
              <div className="alert alert-danger" style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem' }}>
                <WarningIcon style={{ width: '16px', height: '16px' }} />
                <div>{error}</div>
              </div>
            )}
            
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input 
                  type="text" 
                  name="name"
                  className="form-control" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">SKU / Code</label>
                <input 
                  type="text" 
                  name="sku"
                  className="form-control" 
                  value={formData.sku}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Price ($)</label>
                  <input 
                    type="number" 
                    name="price"
                    step="0.01"
                    min="0"
                    className="form-control" 
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Stock Quantity</label>
                  <input 
                    type="number" 
                    name="quantity"
                    min="0"
                    className="form-control" 
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
