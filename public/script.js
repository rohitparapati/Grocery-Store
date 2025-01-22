function showAddProductForm() {
    const form = document.getElementById('product-form');
    form.style.display = 'block';  // Show the add product form
  }
  
  function addProduct() {
    const name = document.getElementById('name').value;
    const quantity = document.getElementById('quantity').value;
    const price = document.getElementById('price').value;
    const expiry_date = document.getElementById('expiry_date').value;
    
    if (!name || !quantity || !price || !expiry_date) {
      alert('Please fill in all fields.');
      return;
    }
  
    fetch('/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, quantity, price, expiry_date })
    })
    .then(response => {
      if (response.ok) {
        return response.text();
      } else {
        throw new Error('Something went wrong on the server!');
      }
    })
    .then(data => {
      alert(data);
      document.getElementById('name').value = '';
      document.getElementById('quantity').value = '';
      document.getElementById('price').value = '';
      document.getElementById('expiry_date').value = '';
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Failed to add product. Please try again.');
    });
  }
  