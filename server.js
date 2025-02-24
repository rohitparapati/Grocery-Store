const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); // Use promise-based API
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Enhanced CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
 
app.use(bodyParser.json());
app.use(express.static('public'));

// Database connection pool for better performance
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'grocery_store',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Database connection test
async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the database');
    connection.release();
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
}
testDatabaseConnection();

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Product validation middleware
const validateProduct = (req, res, next) => {
  const { name, quantity, price, expiry_date } = req.body;
  if (!name || !quantity || !price || !expiry_date) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (isNaN(quantity) || isNaN(price)) {
    return res.status(400).json({ error: 'Quantity and price must be numbers' });
  }
  next();
};

// API endpoints
app.post('/products', validateProduct, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'INSERT INTO products (name, quantity, price, expiry_date) VALUES (?, ?, ?, ?)',
      [req.body.name, req.body.quantity, req.body.price, req.body.expiry_date]
    );
    res.status(201).json({ 
      message: 'Product added successfully',
      productId: result.insertId 
    });
  } catch (err) {
    console.error('POST /products error:', err);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

app.get('/products', async (req, res) => {
  try {
    const [products] = await pool.query('SELECT * FROM products');
    res.json(products);
  } catch (err) {
    console.error('GET /products error:', err);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

app.put('/products/:id', validateProduct, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'UPDATE products SET name = ?, quantity = ?, price = ?, expiry_date = ? WHERE id = ?',
      [req.body.name, req.body.quantity, req.body.price, req.body.expiry_date, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error(`PUT /products/${req.params.id} error:`, err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/products/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM products WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(`DELETE /products/${req.params.id} error:`, err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.get('/search', async (req, res) => {
  const searchQuery = req.query.q;
  try {
    const [products] = await pool.query('SELECT * FROM products WHERE name LIKE ?', [`%${searchQuery}%`]);
    res.json(products);
  } catch (err) {
    console.error('GET /search error:', err);
    res.status(500).json({ error: 'Failed to retrieve search results' });
  }
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});