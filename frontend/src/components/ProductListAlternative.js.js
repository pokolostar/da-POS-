// src/components/ProductList.js
import React from 'react';
import ProductItem from './ProductItem';

function ProductList({ products, addToOrder, onEditProduct, onDeleteProduct }) {
  return (
    <div className="products-grid">
      {products.map(product => (
        <ProductItem
          key={product.id}
          product={product}
          addToOrder={addToOrder}
          onEdit={onEditProduct}
          onDelete={onDeleteProduct}
        />
      ))}
    </div>
  );
}

export default ProductList;