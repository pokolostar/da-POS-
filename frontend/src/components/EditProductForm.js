// src/components/EditProductForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EditProductForm({ product, categories, onProductUpdated, onCancel, API_URL }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || '',
        category: product.category || categories[0] || ''
      });
    }
  }, [product, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await axios.put(`${API_URL}/products/${product.id}`, {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category
      });
      
      onProductUpdated(response.data);
    } catch (error) {
      console.error('更新商品錯誤:', error);
      setErrorMessage(`更新失敗: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="edit-product-form">
      <h3>修改商品</h3>
      
      {errorMessage && (
        <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
          {errorMessage}
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="name">商品名稱:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="price">價格:</label>
        <input
          type="number"
          id="price"
          name="price"
          min="0"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="category">類別:</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={onCancel}>
          取消
        </button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '更新中...' : '保存'}
        </button>
      </div>
    </form>
  );
}

export default EditProductForm;