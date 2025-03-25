import React from 'react';

function OrderPanel({ 
  currentOrder, 
  removeFromOrder, 
  calculateTotal, 
  completeOrder, 
  cancelOrder 
}) {
  return (
    <div className="order-section">
      <h2>當前訂單</h2>
      
      {currentOrder.length === 0 ? (
        <p className="empty-message">尚無商品</p>
      ) : (
        <table className="order-table">
          <thead>
            <tr>
              <th>商品</th>
              <th>數量</th>
              <th>價格</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {currentOrder.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>${(item.price * item.quantity).toFixed(2)}</td>
                <td>
                  <button 
                    className="remove-button"
                    onClick={() => removeFromOrder(item.id)}
                  >
                    -
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      <div className="order-total">
        <span>總計:</span>
        <span>${calculateTotal().toFixed(2)}</span>
      </div>
      
      <div className="order-actions">
        <button 
          className="cancel-button"
          onClick={cancelOrder}
          disabled={currentOrder.length === 0}
        >
          取消
        </button>
        <button 
          className="complete-button"
          onClick={completeOrder}
          disabled={currentOrder.length === 0}
        >
          結帳
        </button>
      </div>
    </div>
  );
}

export default OrderPanel;