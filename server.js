const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:3001', // Or specify domains you want to allow, e.g., http://localhost:8080
  methods: ['GET', 'POST', 'PUT', 'DELETE']

}));
 
app.use(bodyParser.json());
app.use(express.static('public'));

// Static file serving from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'grocery_store',
  waitForConnections: true,
  connectionLimit: 10
});

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

// Define routes for API
app.get('/products', async (req, res) => {
  try {
    const [products] = await pool.query('SELECT * FROM products');
    res.json(products);
  } catch (err) {
    console.error('GET /products error:', err);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

app.post('/products', async (req, res) => {
  const { name, quantity, price, expiry_date } = req.body;
  if (!name || !quantity || !price || !expiry_date) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO products (name, quantity, price, expiry_date) VALUES (?, ?, ?, ?)',
      [name, quantity, price, expiry_date]
    );
    res.status(201).json({ message: 'Product added successfully', productId: result.insertId });
  } catch (err) {
    console.error('POST /products error:', err);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

app.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, quantity, price, expiry_date } = req.body;
  try {
    const [result] = await pool.execute(
      'UPDATE products SET name = ?, quantity = ?, price = ?, expiry_date = ? WHERE id = ?',
      [name, quantity, price, expiry_date, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error(`PUT /products/${id} error:`, err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(`DELETE /products/${id} error:`, err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
