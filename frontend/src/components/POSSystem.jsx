import React, { useState, useEffect } from 'react';

const POSSystem = () => {
  // 商品資料
  const [products, setProducts] = useState([
    { id: 1, name: "美式咖啡", price: 100, category: "飲品" },
    { id: 2, name: "拿鐵", price: 120, category: "飲品" },
    { id: 3, name: "氣泡水", price: 60, category: "飲品" },
    { id: 4, name: "貝果", price: 80, category: "點心" },
    { id: 5, name: "可頌", price: 70, category: "點心" },
  ]);

  // 目前訂單
  const [currentOrder, setCurrentOrder] = useState([]);
  
  // 訂單歷史（實際應用中會從後端獲取）
  const [orderHistory, setOrderHistory] = useState([]);
  
  // 計算總金額
  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // 添加商品到訂單
  const addToOrder = (product) => {
    const existingItem = currentOrder.find(item => item.id === product.id);
    
    if (existingItem) {
      // 如果商品已存在，增加數量
      setCurrentOrder(currentOrder.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      // 如果商品不存在，添加到訂單
      setCurrentOrder([...currentOrder, { ...product, quantity: 1 }]);
    }
  };

  // 從訂單中移除商品
  const removeFromOrder = (productId) => {
    const existingItem = currentOrder.find(item => item.id === productId);
    
    if (existingItem && existingItem.quantity > 1) {
      // 如果數量大於1，減少數量
      setCurrentOrder(currentOrder.map(item => 
        item.id === productId 
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      ));
    } else {
      // 如果數量為1，從訂單中移除
      setCurrentOrder(currentOrder.filter(item => item.id !== productId));
    }
  };

  // 完成訂單
  const completeOrder = () => {
    if (currentOrder.length === 0) return;
    
    const newOrder = {
      id: Date.now(),
      items: [...currentOrder],
      total: calculateTotal(currentOrder),
      timestamp: new Date().toISOString(),
      status: "已完成"
    };
    
    // 添加到訂單歷史
    setOrderHistory([newOrder, ...orderHistory]);
    
    // 清空當前訂單
    setCurrentOrder([]);
    
    // 在實際應用中，這裡會向後端發送API請求保存訂單
    console.log("訂單已提交到後端：", newOrder);
  };

  // 取消訂單
  const cancelOrder = () => {
    setCurrentOrder([]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* 標題列 */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">咖啡店 POS 系統</h1>
      </header>

      <main className="flex flex-1 flex-col md:flex-row p-4 gap-4">
        {/* 商品選擇區域 */}
        <div className="w-full md:w-2/3 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">商品清單</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map(product => (
              <button
                key={product.id}
                className="bg-blue-50 hover:bg-blue-100 border border-blue-200 p-4 rounded-lg text-left transition-colors"
                onClick={() => addToOrder(product)}
              >
                <div className="font-medium">{product.name}</div>
                <div className="text-blue-700">${product.price}</div>
                <div className="text-gray-500 text-sm">{product.category}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 訂單區域 */}
        <div className="w-full md:w-1/3 bg-white rounded-lg shadow-md p-4 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">當前訂單</h2>
          
          <div className="flex-1 overflow-y-auto mb-4">
            {currentOrder.length === 0 ? (
              <p className="text-gray-500 text-center py-8">尚無商品</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">商品</th>
                    <th className="text-center py-2">數量</th>
                    <th className="text-right py-2">價格</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrder.map(item => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">{item.name}</td>
                      <td className="text-center py-2">{item.quantity}</td>
                      <td className="text-right py-2">${item.price * item.quantity}</td>
                      <td className="text-right py-2">
                        <button 
                          className="text-red-500 hover:text-red-700"
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
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between font-bold text-lg mb-4">
              <span>總計:</span>
              <span>${calculateTotal(currentOrder)}</span>
            </div>
            
            <div className="flex gap-2">
              <button 
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded disabled:bg-gray-300"
                onClick={cancelOrder}
                disabled={currentOrder.length === 0}
              >
                取消
              </button>
              <button 
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded disabled:bg-gray-300"
                onClick={completeOrder}
                disabled={currentOrder.length === 0}
              >
                結帳
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 最近訂單 */}
      <div className="bg-white rounded-lg shadow-md p-4 m-4">
        <h2 className="text-xl font-semibold mb-4">最近訂單</h2>
        
        {orderHistory.length === 0 ? (
          <p className="text-gray-500 text-center py-4">尚無訂單記錄</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">訂單 ID</th>
                  <th className="text-left py-2">時間</th>
                  <th className="text-left py-2">品項</th>
                  <th className="text-right py-2">總計</th>
                  <th className="text-center py-2">狀態</th>
                </tr>
              </thead>
              <tbody>
                {orderHistory.map(order => (
                  <tr key={order.id} className="border-b">
                    <td className="py-2">{order.id}</td>
                    <td className="py-2">{new Date(order.timestamp).toLocaleString()}</td>
                    <td className="py-2">
                      {order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
                    </td>
                    <td className="text-right py-2">${order.total}</td>
                    <td className="text-center py-2">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default POSSystem;
