// Helper functions for form data and UI manipulation
function getFormData() {
  return {
    name: document.getElementById('name').value.trim(),
    quantity: parseInt(document.getElementById('quantity').value, 10),
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

function showFeedback(message, type) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert ${type}`;
  alertDiv.textContent = message;
  document.body.prepend(alertDiv);
  setTimeout(() => alertDiv.remove(), 3000);
}

function toggleProductForm(edit = false) {
  const form = document.getElementById('product-form');
  const isHidden = form.classList.contains('hidden');
  form.classList.toggle('hidden', !isHidden);
  document.getElementById('form-title').textContent = edit ? 'Edit Product' : 'Add New Product';
  if (!edit) clearForm();
}

// CRUD operations using Fetch API
async function addProduct() {
  const productData = getFormData();
  try {
    const response = await fetch('/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    const result = await handleResponse(response);
    showFeedback(result.message, 'success');
    toggleProductForm();
  } catch (error) {
    showFeedback(error.message, 'error');
  }
}

async function updateProduct(productId) {
  const productData = getFormData();
  try {
    const response = await fetch(`/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    const result = await handleResponse(response);
    showFeedback(result.message, 'success');
    toggleProductForm();
  } catch (error) {
    showFeedback(error.message, 'error');
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  try {
    const response = await fetch(`/products/${id}`, { method: 'DELETE' });
    const result = await handleResponse(response);
    showFeedback(result.message, 'success');
  } catch (error) {
    showFeedback(error.message, 'error');
  }
}

async function fetchProducts() {
  try {
    const response = await fetch('/products');
    const products = await response.json();
    renderProducts(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    showFeedback('Failed to load products. Please try again.', 'error');
  }
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

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('product-form').classList.add('hidden');
  document.getElementById('view-products').addEventListener('click', async (event) => {
    event.preventDefault();
    await fetchProducts();
  });
  document.getElementById('add-product').addEventListener('click', (event) => {
    event.preventDefault();
    clearForm();
    document.getElementById('product-form').classList.remove('hidden');
  });
});
