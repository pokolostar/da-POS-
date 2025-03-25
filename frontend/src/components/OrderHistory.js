import React from 'react';

function OrderHistory({ orderHistory }) {
  return (
    <div className="history-section">
      <h2>訂單歷史</h2>
      
      {orderHistory.length === 0 ? (
        <p className="empty-message">尚無訂單記錄</p>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>訂單 ID</th>
              <th>時間</th>
              <th>商品</th>
              <th>總計</th>
              <th>狀態</th>
            </tr>
          </thead>
          <tbody>
            {orderHistory.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{new Date(order.timestamp).toLocaleString()}</td>
                <td>
                  {order.items && typeof order.items === 'string' 
                    ? JSON.parse(order.items).map(item => `${item.name} x${item.quantity}`).join(', ')
                    : order.items
                      ? order.items.map(item => `${item.name} x${item.quantity}`).join(', ')
                      : '無商品資訊'
                  }
                </td>
                <td>${order.total}</td>
                <td>
                  <span className="status-badge">{order.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default OrderHistory;