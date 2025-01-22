const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'grocery_store'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API to add products
app.post('/products', (req, res) => {
  const { name, quantity, price, expiry_date } = req.body;
  const sql = 'INSERT INTO products (name, quantity, price, expiry_date) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, quantity, price, expiry_date], (err, result) => {
    if (err) {
      console.error('Failed to add product:', err);
      res.status(500).send('Failed to add product.');
      return;
    }
    res.send('Product added successfully!');
  });
});

// API to fetch all products
app.get('/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) {
      console.error('Failed to retrieve products:', err);
      res.status(500).send('Failed to retrieve products.');
      return;
    }
    res.json(results);
  });
});

// API to update a product
app.put('/products/:id', (req, res) => {
  const { name, quantity, price, expiry_date } = req.body;
  const { id } = req.params;
  const sql = 'UPDATE products SET name = ?, quantity = ?, price = ?, expiry_date = ? WHERE id = ?';
  db.query(sql, [name, quantity, price, expiry_date, id], (err, result) => {
    if (err) {
      console.error('Failed to update product:', err);
      res.status(500).send('Failed to update product.');
      return;
    }
    if (result.affectedRows === 0) {
      res.send('No product found with that ID.');
    } else {
      res.send('Product updated successfully!');
    }
  });
});

// API to delete a product
app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM products WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Failed to delete product:', err);
      res.status(500).send('Failed to delete product.');
      return;
    }
    if (result.affectedRows === 0) {
      res.send('No product found with that ID.');
    } else {
      res.send('Product deleted successfully!');
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
