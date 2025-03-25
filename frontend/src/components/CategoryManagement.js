import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CategoryManagement({ onClose, onCategoryAdded }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const API_URL = 'http://192.168.31.155:3001/api';
  
  // 加載現有類別
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/categories`);
        setCategories(response.data);
      } catch (error) {
        setError('無法加載類別');
        console.error('加載類別錯誤:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // 添加新類別
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/categories`, { name: newCategory });
      setCategories([...categories, response.data]);
      setNewCategory('');
      if (onCategoryAdded) onCategoryAdded(response.data);
    } catch (error) {
      setError('添加類別失敗');
      console.error('添加類別錯誤:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 刪除類別
  const handleDeleteCategory = async (categoryId) => {
    try {
      setIsLoading(true);
      await axios.delete(`${API_URL}/categories/${categoryId}`);
      setCategories(categories.filter(category => category.id !== categoryId));
    } catch (error) {
      setError('刪除類別失敗');
      console.error('刪除類別錯誤:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="category-management">
      <div className="category-header">
        <h2>類別管理</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleAddCategory}>
        <div className="input-group">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="輸入新類別名稱"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !newCategory.trim()}>
            {isLoading ? '添加中...' : '添加類別'}
          </button>
        </div>
      </form>
      
      <div className="categories-list">
        <h3>現有類別</h3>
        {categories.length === 0 ? (
          <p>尚無類別</p>
        ) : (
          <ul>
            {categories.map(category => (
              <li key={category.id}>
                {category.name}
                <button 
                  className="delete-button"
                  onClick={() => handleDeleteCategory(category.id)}
                  disabled={isLoading}
                >
                  刪除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default CategoryManagement;