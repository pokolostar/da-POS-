import React, { useState, useEffect } from 'react';

function ProductList({ products, addToOrder, onEditProduct, onDeleteProduct }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // 提取所有唯一類別
  useEffect(() => {
    const uniqueCategories = [...new Set(products.map(product => product.category))];
    setCategories(uniqueCategories);
    
    // 預設選擇第一個類別（如果有）
    if (uniqueCategories.length > 0) {
      setSelectedCategory(uniqueCategories[0]);
    }
  }, [products]);
  
  // 過濾產品
  const filteredProducts = selectedCategory 
    ? products.filter(product => product.category === selectedCategory) 
    : products;
    
  // 安全的格式化價格
  const formatPrice = (price) => {
    // 確保價格是數字
    const numPrice = typeof price === 'number' ? price : parseFloat(price);
    // 使用 toFixed 並處理非法數字 (NaN)
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };
  
  // 處理編輯按鈕點擊
  const handleEditClick = (e, product) => {
    e.stopPropagation(); // 阻止事件冒泡到父元素
    if (onEditProduct) {
      onEditProduct(product);
    }
  };
  
  // 處理刪除按鈕點擊
  const handleDeleteClick = (e, productId) => {
    e.stopPropagation(); // 阻止事件冒泡到父元素
    if (onDeleteProduct) {
      if (window.confirm('確定要刪除此商品嗎？')) {
        onDeleteProduct(productId);
      }
    }
  };
  
  return (
    <div className="products-section">
      <h2>商品列表</h2>
      
      {/* 類別選擇器 */}
      <div className="category-selector">
        {categories.map(category => (
          <button
            key={category}
            className={`category-button ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
        <button
          className={`category-button ${selectedCategory === null ? 'active' : ''}`}
          onClick={() => setSelectedCategory(null)}
        >
          全部
        </button>
      </div>
      
      {/* 產品網格 */}
      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <div className="no-products">此類別暫無商品</div>
        ) : (
          filteredProducts.map(product => (
            <div
              key={product.id}
              className="product-item"
              onClick={() => addToOrder(product)}
            >
              <div className="product-name">{product.name}</div>
              <div className="product-price">${formatPrice(product.price)}</div>
              <div className="product-category">{product.category}</div>
              
              {/* 編輯和刪除按鈕 */}
              {(onEditProduct || onDeleteProduct) && (
                <div className="product-actions">
                  {onEditProduct && (
                    <button 
                      className="edit-button"
                      onClick={(e) => handleEditClick(e, product)}
                    >
                      編輯
                    </button>
                  )}
                  {onDeleteProduct && (
                    <button 
                      className="delete-button"
                      onClick={(e) => handleDeleteClick(e, product.id)}
                    >
                      刪除
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProductList;