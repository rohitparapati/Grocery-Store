// Toggle product form visibility
function toggleProductForm() {
  const form = document.getElementById('product-form');
  const productId = document.getElementById('product-id').value;
  form.classList.toggle('hidden');
  document.getElementById('form-title').textContent = productId ? 'Edit Product' : 'Add New Product';
  if (!productId) clearForm();
}

// Handle form submission (both add and update)
async function handleProductSubmit() {
  const productId = document.getElementById('product-id').value;
  productId ? await updateProduct() : await addProduct();
}

// Add new product
async function addProduct() {
  const productData = getFormData();
  
  try {
      const response = await fetch('/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
      });

      const data = await handleResponse(response);
      showFeedback('Product added successfully!', 'success');
      clearForm();
      toggleProductForm();
      await fetchProducts();
  } catch (error) {
      showFeedback(error.message, 'error');
  }
}

// Update existing product
async function updateProduct() {
  const productId = document.getElementById('product-id').value;
  const productData = getFormData();

  try {
      const response = await fetch(`/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
      });

      const data = await handleResponse(response);
      showFeedback('Product updated successfully!', 'success');
      clearForm();
      toggleProductForm();
      await fetchProducts();
  } catch (error) {
      showFeedback(error.message, 'error');
  }
}

// Delete product
async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
      const response = await fetch(`/products/${id}`, { method: 'DELETE' });
      const data = await handleResponse(response);
      showFeedback('Product deleted successfully!', 'success');
      await fetchProducts();
  } catch (error) {
      showFeedback(error.message, 'error');
  }
}

// Fetch and display products
async function fetchProducts() {
  try {
      const response = await fetch('/products');
      const products = await handleResponse(response);
      renderProducts(products);
  } catch (error) {
      showFeedback('Failed to load products', 'error');
  }
}

// Helper functions
function getFormData() {
  return {
      name: document.getElementById('name').value.trim(),
      quantity: parseInt(document.getElementById('quantity').value),
      price: parseFloat(document.getElementById('price').value),
      expiry_date: document.getElementById('expiry_date').value
  };
}

function clearForm() {
  document.getElementById('product-id').value = '';
  document.getElementById('name').value = '';
  document.getElementById('quantity').value = '';
  document.getElementById('price').value = '';
  document.getElementById('expiry_date').value = '';
}

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function showFeedback(message, type) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert ${type}`;
  alertDiv.textContent = message;
  
  document.body.prepend(alertDiv);
  setTimeout(() => alertDiv.remove(), 3000);
}

function renderProducts(products) {
  const container = document.getElementById('products-container');
  container.innerHTML = products.map(product => `
      <div class="product-item" data-id="${product.id}">
          <div class="product-info">
              <h4>${product.name}</h4>
              <p>Quantity: ${product.quantity}</p>
              <p>Price: $${product.price.toFixed(2)}</p>
              <p>Expiry: ${new Date(product.expiry_date).toLocaleDateString()}</p>
          </div>
          <div class="product-actions">
              <button class="btn-edit" onclick="editProduct(${product.id})">Edit</button>
              <button class="btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
          </div>
      </div>
  `).join('');
}

// Edit existing product
async function editProduct(id) {
  try {
      const response = await fetch(`/products/${id}`);
      const product = await handleResponse(response);
      
      document.getElementById('product-id').value = product.id;
      document.getElementById('name').value = product.name;
      document.getElementById('quantity').value = product.quantity;
      document.getElementById('price').value = product.price;
      document.getElementById('expiry_date').value = product.expiry_date.split('T')[0];
      
      toggleProductForm();
  } catch (error) {
      showFeedback(error.message, 'error');
  }
}


// Initial load
document.addEventListener('DOMContentLoaded', () => {
  fetchProducts();
  document.getElementById('product-form').classList.add('hidden');
});