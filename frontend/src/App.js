import React from 'react';
import './App.css'; // 假設你會有一個 App.css 檔案來設定基本樣式
import POSSystem from './components/POSSystem';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* 這裡可以放應用程式的標題或導航條等 */}
      </header>
      <main>
        {/* 引入 POS 系統主組件 */}
        <POSSystem />
      </main>
      <footer className="App-footer">
        {/* 這裡可以放頁尾資訊，如版權聲明等 */}
        <p>© {new Date().getFullYear()} 咖啡店 POS 系統 - 版權所有</p>
      </footer>
    </div>
  );
}

export default App;