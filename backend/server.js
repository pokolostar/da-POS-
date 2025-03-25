const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中間件
app.use(cors());
app.use(express.json());

// 資料庫連接池
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 初始化資料庫表（如果不存在）
const initDatabase = async () => {
  try {
    // 確保類別表存在
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 確保產品表存在
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        is_deleted TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 確保訂單表存在
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 確保訂單項目表存在
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id)
      )
    `);

    // 檢查是否需要添加 is_deleted 欄位到產品表
    try {
      const [columns] = await pool.query("SHOW COLUMNS FROM products LIKE 'is_deleted'");
      if (columns.length === 0) {
        await pool.query("ALTER TABLE products ADD COLUMN is_deleted TINYINT(1) NOT NULL DEFAULT 0");
        console.log("添加 is_deleted 欄位到產品表");
      }
    } catch (error) {
      console.error("檢查/修改產品表結構錯誤:", error);
    }

    // 如果沒有類別，添加默認類別
    const [categories] = await pool.query("SELECT * FROM categories");
    if (categories.length === 0) {
      await pool.query(`
        INSERT INTO categories (name) VALUES 
        ('飲品'), 
        ('點心')
      `);
    }
  } catch (error) {
    console.error("初始化資料庫錯誤:", error);
  }
};

// 啟動時初始化資料庫
initDatabase();

// 測試路由
app.get("/", (req, res) => {
  res.json({ message: "達咖啡 POS 系統 API 伺服器運行中" });
});

// 獲取所有商品（排除已刪除的）
app.get("/api/products", async (req, res) => {
  try {
    // 修改查詢以過濾掉已刪除的商品
    const [products] = await pool.query("SELECT * FROM products WHERE is_deleted = 0");
    res.json(products);
  } catch (error) {
    console.error("獲取商品錯誤:", error);
    res.status(500).json({ message: "獲取商品失敗", error: error.message });
  }
});

// 獲取已刪除的商品（管理用）
app.get("/api/products/deleted", async (req, res) => {
  try {
    const [products] = await pool.query("SELECT * FROM products WHERE is_deleted = 1");
    res.json(products);
  } catch (error) {
    console.error("獲取已刪除商品錯誤:", error);
    res.status(500).json({ message: "獲取已刪除商品失敗", error: error.message });
  }
});

// 創建訂單
app.post("/api/orders", async (req, res) => {
  const { items, total } = req.body;
  
  try {
    // 開始事務
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // 插入訂單
      const [orderResult] = await connection.query(
        "INSERT INTO orders (total, status) VALUES (?, ?)",
        [total, "已完成"]
      );
      
      const orderId = orderResult.insertId;
      
      // 插入訂單項目
      for (const item of items) {
        await connection.query(
          "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
          [orderId, item.id, item.quantity, item.price]
        );
      }
      
      // 提交事務
      await connection.commit();
      
      res.status(201).json({ 
        message: "訂單創建成功",
        orderId: orderId
      });
    } catch (error) {
      // 出錯時回滾事務
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("創建訂單錯誤:", error);
    res.status(500).json({ message: "創建訂單失敗", error: error.message });
  }
});

// 獲取訂單歷史
app.get("/api/orders", async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT o.*, 
             (SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                  "id", oi.id,
                  "productId", oi.product_id,
                  "quantity", oi.quantity,
                  "price", oi.price,
                  "name", p.name
                )
              )
              FROM order_items oi
              JOIN products p ON oi.product_id = p.id
              WHERE oi.order_id = o.id
             ) as items
      FROM orders o
      ORDER BY o.timestamp DESC
    `);
    
    res.json(orders);
  } catch (error) {
    console.error("獲取訂單錯誤:", error);
    res.status(500).json({ message: "獲取訂單失敗", error: error.message });
  }
});

// 獲取所有類別
app.get("/api/categories", async (req, res) => {
  try {
    const [categories] = await pool.query("SELECT * FROM categories");
    res.json(categories);
  } catch (error) {
    console.error("獲取類別錯誤:", error);
    res.status(500).json({ message: "獲取類別失敗", error: error.message });
  }
});

// 創建新類別
app.post("/api/categories", async (req, res) => {
  const { name } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "類別名稱不能為空" });
  }
  
  try {
    const [result] = await pool.query(
      "INSERT INTO categories (name) VALUES (?)",
      [name.trim()]
    );
    
    res.status(201).json({
      id: result.insertId,
      name: name.trim(),
      created_at: new Date()
    });
  } catch (error) {
    console.error("創建類別錯誤:", error);
    res.status(500).json({ message: "創建類別失敗", error: error.message });
  }
});

// 刪除類別
app.delete("/api/categories/:id", async (req, res) => {
  const categoryId = req.params.id;
  
  try {
    // 檢查是否有未刪除的產品使用此類別
    const [products] = await pool.query(
      "SELECT COUNT(*) as count FROM products WHERE category = (SELECT name FROM categories WHERE id = ?) AND is_deleted = 0",
      [categoryId]
    );
    
    if (products[0].count > 0) {
      return res.status(400).json({ 
        message: "無法刪除此類別，因為有產品正在使用它" 
      });
    }
    
    await pool.query("DELETE FROM categories WHERE id = ?", [categoryId]);
    res.status(204).end();
  } catch (error) {
    console.error("刪除類別錯誤:", error);
    res.status(500).json({ message: "刪除類別失敗", error: error.message });
  }
});

// 多功能產品 API - 處理創建、更新和軟刪除
app.post("/api/products", async (req, res) => {
  const { _method, id, name, price, category, is_deleted } = req.body;
  
  // 處理更新操作
  if (_method === 'update') {
    if (!id || !name || !price || !category) {
      return res.status(400).json({ message: "ID、名稱、價格和類別都是必填項" });
    }
    
    try {
      // 更新產品，確保只更新未刪除的產品
      const [updateResult] = await pool.query(
        "UPDATE products SET name = ?, price = ?, category = ? WHERE id = ? AND is_deleted = 0",
        [name, price, category, id]
      );
      
      if (updateResult.affectedRows === 0) {
        // 檢查產品是否存在但已被刪除
        const [checkProduct] = await pool.query(
          "SELECT * FROM products WHERE id = ?",
          [id]
        );
        
        if (checkProduct.length === 0) {
          return res.status(404).json({ message: "找不到指定的產品" });
        } else if (checkProduct[0].is_deleted === 1) {
          return res.status(400).json({ message: "無法更新已刪除的產品" });
        } else {
          return res.status(500).json({ message: "更新失敗，未知原因" });
        }
      }
      
      // 返回更新後的產品數據
      const [updatedProduct] = await pool.query(
        "SELECT * FROM products WHERE id = ?",
        [id]
      );
      
      res.json(updatedProduct[0]);
    } catch (error) {
      console.error("更新商品錯誤:", error);
      res.status(500).json({ message: "更新商品失敗", error: error.message });
    }
  }
  // 處理軟刪除操作
  else if (_method === 'delete') {
    if (!id) {
      return res.status(400).json({ message: "缺少產品ID" });
    }
    
    try {
      // 軟刪除 - 將產品標記為已刪除
      const [result] = await pool.query(
        "UPDATE products SET is_deleted = 1 WHERE id = ? AND is_deleted = 0",
        [id]
      );
      
      if (result.affectedRows === 0) {
        // 檢查產品是否存在
        const [checkProduct] = await pool.query(
          "SELECT * FROM products WHERE id = ?",
          [id]
        );
        
        if (checkProduct.length === 0) {
          return res.status(404).json({ message: "找不到指定的產品" });
        } else if (checkProduct[0].is_deleted === 1) {
          return res.status(400).json({ message: "產品已被刪除" });
        }
      }
      
      res.json({ message: "商品刪除成功", id });
    } catch (error) {
      console.error("刪除商品錯誤:", error);
      res.status(500).json({ message: "刪除商品失敗", error: error.message });
    }
  }
  // 處理創建操作
  else {
    if (!name || !price || !category) {
      return res.status(400).json({ message: "名稱、價格和類別都是必填項" });
    }
    
    try {
      const [result] = await pool.query(
        "INSERT INTO products (name, price, category, is_deleted) VALUES (?, ?, ?, 0)",
        [name, price, category]
      );
      
      res.status(201).json({
        id: result.insertId,
        name,
        price,
        category,
        is_deleted: 0,
        created_at: new Date()
      });
    } catch (error) {
      console.error("創建商品錯誤:", error);
      res.status(500).json({ message: "創建商品失敗", error: error.message });
    }
  }
});

// 刪除產品 API (RESTful 方式 - 軟刪除)
app.delete("/api/products/:id", async (req, res) => {
  const productId = req.params.id;
  
  try {
    // 將產品標記為已刪除
    const [result] = await pool.query(
      "UPDATE products SET is_deleted = 1 WHERE id = ? AND is_deleted = 0",
      [productId]
    );
    
    if (result.affectedRows === 0) {
      // 檢查產品是否存在
      const [checkProduct] = await pool.query(
        "SELECT * FROM products WHERE id = ?",
        [productId]
      );
      
      if (checkProduct.length === 0) {
        return res.status(404).json({ message: "找不到指定的產品" });
      } else if (checkProduct[0].is_deleted === 1) {
        return res.status(400).json({ message: "產品已被刪除" });
      }
    }
    
    res.json({ message: "商品刪除成功", id: productId });
  } catch (error) {
    console.error("刪除商品錯誤:", error);
    res.status(500).json({ message: "刪除商品失敗", error: error.message });
  }
});

// 恢復已刪除的產品
app.post("/api/products/:id/restore", async (req, res) => {
  const productId = req.params.id;
  
  try {
    // 將產品標記為未刪除
    const [result] = await pool.query(
      "UPDATE products SET is_deleted = 0 WHERE id = ? AND is_deleted = 1",
      [productId]
    );
    
    if (result.affectedRows === 0) {
      // 檢查產品是否存在
      const [checkProduct] = await pool.query(
        "SELECT * FROM products WHERE id = ?",
        [productId]
      );
      
      if (checkProduct.length === 0) {
        return res.status(404).json({ message: "找不到指定的產品" });
      } else if (checkProduct[0].is_deleted === 0) {
        return res.status(400).json({ message: "產品未被刪除，無需恢復" });
      }
    }
    
    // 獲取恢復後的產品數據
    const [product] = await pool.query(
      "SELECT * FROM products WHERE id = ?",
      [productId]
    );
    
    res.json({
      message: "商品恢復成功",
      product: product[0]
    });
  } catch (error) {
    console.error("恢復商品錯誤:", error);
    res.status(500).json({ message: "恢復商品失敗", error: error.message });
  }
});

// 啟動服務器
app.listen(PORT, () => {
  console.log(`服務器運行在 http://localhost:${PORT}`);
});