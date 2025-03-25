import React from 'react';

function ProductItem({ product, onClick, addToOrder, onEdit, onDelete }) {
  // 使用 onClick 或 addToOrder（優先使用 onClick 以保持向後兼容）
  const handleClick = onClick || (() => addToOrder && addToOrder(product));

  return (
    <div className="product-item" onClick={handleClick}>
      <div className="product-name">{product.name}</div>
      <div className="product-price">${product.price.toFixed(2)}</div>
      <div className="product-category">{product.category}</div>
      {(onEdit || onDelete) && (
        <div className="product-actions">
          {onEdit && <button onClick={(e) => {e.stopPropagation(); onEdit(product);}}>編輯</button>}
          {onDelete && <button onClick={(e) => {e.stopPropagation(); onDelete(product.id);}}>刪除</button>}
        </div>
      )}
    </div>
  );
}

export default ProductItem;