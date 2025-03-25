import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import ProductList from './components/ProductList';
import OrderPanel from './components/OrderPanel';
import OrderHistory from './components/OrderHistory';
import { Helmet } from 'react-helmet';

// 創建模態對話框組件
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

// 創建類別管理組件
const CategoryManagement = ({ onClose, onCategoryAdded }) => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 修改為相對路徑
  const API_URL = '/api';
  
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
  }, [API_URL]);
  
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
      setError(error.response?.data?.message || '刪除類別失敗');
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
};

// 創建產品管理組件
const ProductManagement = ({ onClose, onProductAdded, categories }) => {
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: categories.length > 0 ? categories[0].name : ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 修改為相對路徑
  const API_URL = '/api';
  
  useEffect(() => {
    if (categories.length > 0 && !newProduct.category) {
      setNewProduct(prev => ({ ...prev, category: categories[0].name }));
    }
  }, [categories, newProduct.category]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      setError('所有欄位都是必填的');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/products`, {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        category: newProduct.category
      });
      
      if (onProductAdded) onProductAdded(response.data);
      
      // 重置表單
      setNewProduct({
        name: '',
        price: '',
        category: categories.length > 0 ? categories[0].name : ''
      });
      
      setError('');
    } catch (error) {
      setError('添加產品失敗');
      console.error('添加產品錯誤:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="product-management">
      <div className="category-header">
        <h2>新增商品</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label htmlFor="name">商品名稱</label>
          <input
            type="text"
            id="name"
            name="name"
            value={newProduct.name}
            onChange={handleChange}
            placeholder="輸入商品名稱"
            disabled={isLoading}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="price">價格</label>
          <input
            type="number"
            id="price"
            name="price"
            value={newProduct.price}
            onChange={handleChange}
            placeholder="輸入價格"
            min="0"
            step="1"
            disabled={isLoading}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">類別</label>
          <select
            id="category"
            name="category"
            value={newProduct.category}
            onChange={handleChange}
            disabled={isLoading || categories.length === 0}
            required
          >
            {categories.length === 0 ? (
              <option value="">暫無類別</option>
            ) : (
              categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))
            )}
          </select>
        </div>
        
        <button
          type="submit"
          className="submit-button"
          disabled={isLoading || !newProduct.name || !newProduct.price || !newProduct.category}
        >
          {isLoading ? '添加中...' : '添加商品'}
        </button>
      </form>
    </div>
  );
};

// 管理工具組件
const AdminTools = ({ onClose, onProductAdded }) => {
  const [activeTab, setActiveTab] = useState('category');
  const [categories, setCategories] = useState([]);
  
  // 修改為相對路徑
  const API_URL = '/api';
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error('獲取類別錯誤:', error);
      }
    };
    
    fetchCategories();
  }, [API_URL]);
  
  const handleCategoryAdded = (newCategory) => {
    setCategories([...categories, newCategory]);
  };
  
  const handleProductAdded = (newProduct) => {
    // 不再使用 window.location.reload(), 而是通過回調通知父組件
    if (onProductAdded) {
      onProductAdded(newProduct);
    }
  };
  
  return (
    <div className="admin-tools">
      <div className="category-header">
        <h2>管理工具</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="tab-buttons">
        <button
          className={`tab-button ${activeTab === 'category' ? 'active' : ''}`}
          onClick={() => setActiveTab('category')}
        >
          類別管理
        </button>
        <button
          className={`tab-button ${activeTab === 'product' ? 'active' : ''}`}
          onClick={() => setActiveTab('product')}
        >
          新增商品
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'category' ? (
          <CategoryManagement 
            onClose={() => setActiveTab('product')} 
            onCategoryAdded={handleCategoryAdded} 
          />
        ) : (
          <ProductManagement 
            onClose={() => setActiveTab('category')} 
            onProductAdded={handleProductAdded}
            categories={categories}
          />
        )}
      </div>
    </div>
  );
};

function App() {
  const [products, setProducts] = useState([]);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 修改為相對路徑
  const API_URL = '/api';

  // 獲取產品數據 - 不再需要過濾已刪除的產品，因為後端會處理
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      console.log(`從伺服器獲取了 ${response.data.length} 個產品`);
      setProducts(response.data);
    } catch (error) {
      console.error('獲取產品錯誤:', error);
    }
  };

  // 組件載入時獲取產品
  useEffect(() => {
    fetchProducts();
  }, [API_URL]);

  // 獲取訂單歷史
  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const response = await axios.get(`${API_URL}/orders`);
        setOrderHistory(response.data);
      } catch (error) {
        console.error('獲取訂單歷史錯誤:', error);
      }
    };
    
    fetchOrderHistory();
  }, [API_URL]);

  // 處理新增產品
  const handleProductAdded = (newProduct) => {
    // 直接將新產品添加到產品列表，而不是重新加載整個頁面
    setProducts(prevProducts => [...prevProducts, newProduct]);
  };

  // 添加商品到訂單
  const addToOrder = (product) => {
    setCurrentOrder(prevOrder => {
      const existingItem = prevOrder.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevOrder.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prevOrder, { ...product, quantity: 1 }];
      }
    });
  };

  // 從訂單中移除商品
  const removeFromOrder = (productId) => {
    setCurrentOrder(prevOrder => {
      const existingItem = prevOrder.find(item => item.id === productId);
      
      if (existingItem && existingItem.quantity > 1) {
        return prevOrder.map(item => 
          item.id === productId 
            ? { ...item, quantity: item.quantity - 1 } 
            : item
        );
      } else {
        return prevOrder.filter(item => item.id !== productId);
      }
    });
  };

  // 計算總金額
  const calculateTotal = () => {
    return currentOrder.reduce((sum, item) => {
      const price = typeof item.price === 'number' ? item.price : parseFloat(item.price);
      return sum + (price * item.quantity);
    }, 0);
  };

  // 編輯產品
  const handleEditProduct = (product) => {
    setProductToEdit({...product});
    setIsEditModalOpen(true);
    setError('');
  };

  // 更新產品 - 直接使用有效的方法
  const handleUpdateProduct = async (updatedProduct) => {
    setIsLoading(true);
    setError('');
    try {
      // 確保價格是數字類型
      const productToSubmit = {
        ...updatedProduct,
        price: typeof updatedProduct.price === 'number' 
          ? updatedProduct.price 
          : parseFloat(updatedProduct.price)
      };
      
      // 直接使用 POST 到 /products 端點，添加標記表示這是更新操作
      const url = `${API_URL}/products`;
      console.log('正在發送更新請求到:', url);
      console.log('更新數據:', productToSubmit);
      
      const response = await axios.post(url, {
        ...productToSubmit,
        _method: 'update'  // 標記這是更新操作
      });
      
      console.log('更新成功:', response.data);
      
      // 更新本地產品列表
      setProducts(products.map(p => p.id === productToSubmit.id ? response.data : p));
      setIsEditModalOpen(false);
      setProductToEdit(null);
      
      // 更新成功提示
      alert('商品更新成功！');
      
    } catch (error) {
      console.error('更新產品錯誤:', error);
      
      if (error.response) {
        console.error('錯誤詳情:', error.response.status, error.response.data);
        setError(`更新失敗: ${error.response.status} - ${error.response.statusText}`);
      } else {
        setError(`更新失敗: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 刪除產品 - 簡化的版本，使用後端軟刪除功能
  const handleDeleteProduct = async (productId) => {
    try {
      // 找到要刪除的產品
      const product = products.find(p => p.id === productId);
      if (!product) {
        alert('找不到要刪除的產品');
        return;
      }
      
      // 發送刪除請求
      await axios.delete(`${API_URL}/products/${productId}`);
      
      // 從 UI 中移除產品
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
      
      alert('商品刪除成功！');
    } catch (error) {
      console.error('刪除產品錯誤:', error);
      
      if (error.response && error.response.data) {
        alert(`刪除失敗: ${error.response.data.message}`);
      } else {
        alert(`刪除失敗: ${error.message}`);
      }
    }
  };

  // 完成訂單
  const completeOrder = async () => {
    if (currentOrder.length === 0) return;
    
    const orderData = {
      items: currentOrder,
      total: calculateTotal()
    };
    
    try {
      await axios.post(`${API_URL}/orders`, orderData);
      
      // 刷新訂單歷史
      const response = await axios.get(`${API_URL}/orders`);
      setOrderHistory(response.data);
      
      // 清空當前訂單
      setCurrentOrder([]);
    } catch (error) {
      console.error('提交訂單錯誤:', error);
      alert(`提交訂單失敗: ${error.message}`);
    }
  };

  // 取消訂單
  const cancelOrder = () => {
    setCurrentOrder([]);
  };
  
  // 打開管理工具
  const openAdminModal = () => {
    setIsAdminModalOpen(true);
  };
  
  // 關閉管理工具
  const closeAdminModal = () => {
    setIsAdminModalOpen(false);
    // 關閉時重新獲取產品列表，確保顯示最新數據
    fetchProducts();
  };

  return (
    <div className="App">
      {/* 使用React Helmet修改頁面標題 */}
      <Helmet>
        <title>達咖啡POS</title>
      </Helmet>
      
      <header className="App-header">
        <h1>達咖啡POS</h1>
        <div className="header-buttons">
          <button className="admin-button" onClick={openAdminModal}>
            系統管理
          </button>
        </div>
      </header>
      
      <main className="App-main">
        <div className="pos-container">
          <ProductList 
            products={products} 
            addToOrder={addToOrder} 
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
          />
          <OrderPanel 
            currentOrder={currentOrder} 
            removeFromOrder={removeFromOrder}
            calculateTotal={calculateTotal}
            completeOrder={completeOrder}
            cancelOrder={cancelOrder}
          />
        </div>
        
        <OrderHistory orderHistory={orderHistory} />
      </main>
      
      <footer className="App-footer">
        <p>&copy;power by Da cafe 系統開發 章鈦科技</p>
      </footer>
      
      <Modal isOpen={isAdminModalOpen} onClose={closeAdminModal}>
        <AdminTools 
          onClose={closeAdminModal} 
          onProductAdded={handleProductAdded} 
        />
      </Modal>
      
      {productToEdit && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          <div className="edit-product-modal">
            <div className="category-header">
              <h2>編輯產品</h2>
              <button className="close-button" onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateProduct(productToEdit);
            }}>
              <div className="form-group">
                <label htmlFor="edit-name">商品名稱</label>
                <input
                  type="text"
                  id="edit-name"
                  value={productToEdit.name}
                  onChange={(e) => setProductToEdit({...productToEdit, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-price">價格</label>
                <input
                  type="number"
                  id="edit-price"
                  value={productToEdit.price}
                  onChange={(e) => setProductToEdit({
                    ...productToEdit, 
                    price: e.target.value === '' ? '' : parseFloat(e.target.value)
                  })}
                  min="0"
                  step="any"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-category">類別</label>
                <input
                  type="text"
                  id="edit-category"
                  value={productToEdit.category}
                  onChange={(e) => setProductToEdit({...productToEdit, category: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setIsEditModalOpen(false)}>
                  取消
                </button>
                <button type="submit" disabled={isLoading}>
                  {isLoading ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default App;