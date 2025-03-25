import React, { useState } from 'react';
import axios from 'axios';

function AddProductForm({ onProductAdded, categories, API_URL }) {
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: categories[0] || ''
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: name === 'price' ? value : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    // 確保價格是有效的數字
    const productToSubmit = {
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      category: newProduct.category
    };

    // 驗證數據
    if (!productToSubmit.name) {
      setErrorMessage('商品名稱不能為空');
      setIsSubmitting(false);
      return;
    }

    if (isNaN(productToSubmit.price) || productToSubmit.price <= 0) {
      setErrorMessage('請輸入有效的價格');
      setIsSubmitting(false);
      return;
    }

    if (!productToSubmit.category) {
      setErrorMessage('請選擇類別');
      setIsSubmitting(false);
      return;
    }

    try {
      // 顯示更多診斷信息
      console.log('正在提交商品數據:', productToSubmit);
      console.log('API URL:', `${API_URL}/products`);
      
      const response = await axios.post(`${API_URL}/products`, productToSubmit);
      console.log('服務器響應:', response.data);
      
      onProductAdded(response.data);
      setNewProduct({ name: '', price: '', category: categories[0] || '' });
      setIsFormVisible(false);
    } catch (error) {
      console.error('添加商品錯誤:', error);
      
      if (error.response) {
        // 服務器返回了錯誤響應
        console.error('錯誤狀態碼:', error.response.status);
        console.error('錯誤數據:', error.response.data);
        setErrorMessage(`添加商品失敗: ${error.response.data.message || '未知錯誤'}`);
      } else if (error.request) {
        // 請求已發送但沒有收到響應
        console.error('沒有收到響應:', error.request);
        setErrorMessage('伺服器無響應，請檢查網絡連接');
      } else {
        // 請求設置時發生錯誤
        console.error('請求錯誤:', error.message);
        setErrorMessage(`請求錯誤: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-product-section">
      {!isFormVisible ? (
        <button className="add-product-button" onClick={() => setIsFormVisible(true)}>
          新增商品
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="add-product-form">
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
              value={newProduct.name}
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
              value={newProduct.price}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">類別:</label>
            <select
              id="category"
              name="category"
              value={newProduct.category}
              onChange={handleChange}
              required
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={() => {
              setIsFormVisible(false);
              setErrorMessage('');
            }}>
              取消
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '提交中...' : '保存'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default AddProductForm;