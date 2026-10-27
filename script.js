const products = [
  { id: 1, name: 'Wireless Headphones', category: 'Electronics', price: 2499, stock: 10, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=85', description: 'Comfortable headphones with clear sound and a long-lasting battery.' },
  { id: 2, name: 'Smart Watch', category: 'Electronics', price: 1999, stock: 15, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=85', description: 'Track your daily activity and stay connected on the go.' },
  { id: 3, name: 'Bluetooth Speaker', category: 'Electronics', price: 1499, stock: 11, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=85', description: 'Portable speaker for music at home or outdoors.' },
  { id: 4, name: 'Laptop Backpack', category: 'Accessories', price: 1299, stock: 9, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=85', description: 'A practical backpack with space for your laptop and essentials.' },
  { id: 5, name: 'Sunglasses', category: 'Accessories', price: 699, stock: 14, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=85', description: 'Classic everyday sunglasses with a stylish design.' },
  { id: 6, name: 'Classic Wrist Watch', category: 'Accessories', price: 2299, stock: 6, image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=85', description: 'A timeless watch that works with casual or formal outfits.' },
  { id: 7, name: 'Cotton T-Shirt', category: 'Clothing', price: 599, stock: 20, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=85', description: 'Soft cotton T-shirt for comfortable everyday wear.' },
  { id: 8, name: 'Casual Hoodie', category: 'Clothing', price: 1199, stock: 10, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=85', description: 'A warm, relaxed hoodie for cooler days.' },
  { id: 9, name: 'Running Shoes', category: 'Fashion', price: 1799, stock: 8, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=85', description: 'Lightweight shoes for walks, workouts, and daily use.' },
  { id: 10, name: 'Programming Book', category: 'Books', price: 799, stock: 12, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=85', description: 'A beginner-friendly book to build your programming skills.' },
  { id: 11, name: 'Desk Lamp', category: 'Home', price: 899, stock: 7, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=85', description: 'A simple desk lamp for reading and studying.' },
  { id: 12, name: 'Coffee Mug', category: 'Home', price: 299, stock: 25, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=85', description: 'A reusable mug for your favourite hot drinks.' }
];

const CART_STORAGE_KEY = 'shopease-cart-v2';
const COUPON_STORAGE_KEY = 'shopease-coupon-v2';
const productGrid = document.getElementById('product-grid');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const sortSelect = document.getElementById('sort-select');
const cartItemsContainer = document.getElementById('cart-items');
const couponInput = document.getElementById('coupon-input');
const couponMessage = document.getElementById('coupon-message');
const toast = document.getElementById('toast');
let cart = readStorage(CART_STORAGE_KEY, {});
let appliedCoupon = readStorage(COUPON_STORAGE_KEY, '');
let toastTimer;

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
  } catch {
    showToast('Browser storage is unavailable. Your cart may not be saved.');
  }
}

function money(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount || 0);
}

function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

function populateCategories() {
  const selected = categoryFilter.value || 'all';
  const categories = [...new Set(products.map(product => product.category))].sort();
  categoryFilter.innerHTML = '<option value="all">All categories</option>' + categories.map(category => `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`).join('');
  if (categories.includes(selected)) categoryFilter.value = selected;
}

function getVisibleProducts() {
  const search = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const visible = products.filter(product => {
    const text = `${product.name} ${product.description} ${product.category}`.toLowerCase();
    return text.includes(search) && (category === 'all' || product.category === category);
  });
  if (sortSelect.value === 'price-low') visible.sort((a, b) => a.price - b.price);
  if (sortSelect.value === 'price-high') visible.sort((a, b) => b.price - a.price);
  if (sortSelect.value === 'name') visible.sort((a, b) => a.name.localeCompare(b.name));
  return visible;
}

function renderProducts() {
  const visible = getVisibleProducts();
  document.getElementById('product-count').textContent = `${visible.length} product${visible.length === 1 ? '' : 's'}`;
  if (!visible.length) {
    productGrid.innerHTML = '<div class="empty-products">No products match your search. Try another keyword or category.</div>';
    return;
  }
  productGrid.innerHTML = visible.map(product => {
    const remaining = product.stock - getCartQuantity(product.id);
    return `<article class="product-card">
      <div class="product-art"><img class="product-image" src="${product.image}" alt="${escapeHTML(product.name)}" loading="lazy"><span class="category-pill">${escapeHTML(product.category)}</span></div>
      <div class="product-info"><h3>${escapeHTML(product.name)}</h3><p class="product-description">${escapeHTML(product.description)}</p>
        <div class="product-bottom"><span class="product-price">${money(product.price)}</span><button class="add-button" data-add="${product.id}" aria-label="Add ${escapeHTML(product.name)} to cart" title="Add to cart" ${remaining <= 0 ? 'disabled' : ''}>+</button></div>
        <div class="stock-note">${remaining} in stock</div>
      </div>
    </article>`;
  }).join('');
}

function getCartQuantity(productId) {
  return Number(cart[productId] || 0);
}

function getCartItems() {
  return Object.entries(cart).map(([id, quantity]) => {
    const product = products.find(item => item.id === Number(id));
    const validQuantity = Math.max(0, Math.min(Number(quantity) || 0, product ? product.stock : 0));
    if (!product || validQuantity === 0) return null;
    return { product, quantity: validQuantity };
  }).filter(Boolean);
}

function getTotals() {
  const items = getCartItems();
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const rate = appliedCoupon === 'SAVE10' ? 0.10 : appliedCoupon === 'SAVE20' ? 0.20 : 0;
  const discount = Math.round(subtotal * rate * 100) / 100;
  return { items, subtotal, discount, total: Math.max(0, subtotal - discount) };
}

function renderCart() {
  const { items, subtotal, discount, total } = getTotals();
  const quantityCount = items.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cart-count').textContent = quantityCount;
  document.getElementById('cart-item-label').textContent = `${quantityCount} item${quantityCount === 1 ? '' : 's'}`;
  document.getElementById('subtotal').textContent = money(subtotal);
  document.getElementById('discount').textContent = `− ${money(discount)}`;
  document.getElementById('total').textContent = money(total);
  couponInput.value = appliedCoupon;
  document.getElementById('checkout-button').disabled = items.length === 0;
  if (!items.length) {
    cartItemsContainer.innerHTML = `<div class="empty-cart"><img class="empty-cart-art" src="https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?auto=format&fit=crop&w=300&q=80" alt="Shopping bags"><h3>Your cart is waiting</h3><p>Add a few products and they’ll appear here.</p><a href="#products" class="text-link">Browse products →</a></div>`;
  } else {
    cartItemsContainer.innerHTML = items.map(({ product, quantity }) => `
      <article class="cart-item"><img class="cart-item-art" src="${product.image}" alt="${escapeHTML(product.name)}">
        <div><h4>${escapeHTML(product.name)}</h4><div class="item-price">${money(product.price)} each</div>
          <div class="cart-item-actions"><div class="qty-control"><button data-quantity="-1" data-product="${product.id}" aria-label="Decrease quantity">−</button><span>${quantity}</span><button data-quantity="1" data-product="${product.id}" aria-label="Increase quantity" ${quantity >= product.stock ? 'disabled' : ''}>+</button></div><button class="remove-button" data-remove="${product.id}">Remove</button></div>
        </div><div class="line-total">${money(product.price * quantity)}</div>
      </article>`).join('');
  }
  renderProducts();
}

function addToCart(productId) {
  const product = products.find(item => item.id === Number(productId));
  if (!product) return;
  const quantity = getCartQuantity(product.id);
  if (quantity >= product.stock) return showToast('Sorry, this product is out of stock.');
  cart[product.id] = quantity + 1;
  saveCart();
  renderCart();
  showToast('Added to your cart.');
}

function changeQuantity(productId, change) {
  const product = products.find(item => item.id === Number(productId));
  if (!product) return;
  const next = getCartQuantity(product.id) + change;
  if (next <= 0) delete cart[product.id];
  else if (next <= product.stock) cart[product.id] = next;
  else return showToast('No more stock available.');
  saveCart();
  renderCart();
}

function removeFromCart(productId) {
  delete cart[productId];
  saveCart();
  renderCart();
  showToast('Product removed from cart.');
}

function applyCoupon() {
  const code = couponInput.value.trim().toUpperCase();
  couponMessage.classList.remove('error');
  if (getCartItems().length === 0 && code) {
    couponMessage.textContent = 'Add a product before applying a coupon.';
    couponMessage.classList.add('error');
    return;
  }
  if (code === 'SAVE10' || code === 'SAVE20') {
    appliedCoupon = code;
    saveCart();
    renderCart();
    couponMessage.textContent = `${code} applied successfully.`;
    showToast(`${code} coupon applied.`);
  } else if (code === '') {
    appliedCoupon = '';
    saveCart();
    renderCart();
    couponMessage.textContent = 'Coupon removed.';
  } else {
    appliedCoupon = '';
    saveCart();
    renderCart();
    couponInput.value = code;
    couponMessage.textContent = 'Invalid coupon. Try SAVE10 or SAVE20.';
    couponMessage.classList.add('error');
  }
}

function checkout() {
  const { items, subtotal, discount, total } = getTotals();
  if (!items.length) return showToast('Your cart is empty.');
  document.getElementById('checkout-message').textContent = 'This is a demo checkout. No payment will be taken.';
  document.getElementById('checkout-details').innerHTML = `
    <div><span>Products</span><strong>${items.reduce((sum, item) => sum + item.quantity, 0)}</strong></div>
    ${items.map(({ product, quantity }) => `<div><span>${escapeHTML(product.name)} × ${quantity}</span><strong>${money(product.price * quantity)}</strong></div>`).join('')}
    <div><span>Subtotal</span><strong>${money(subtotal)}</strong></div>
    <div><span>Coupon ${appliedCoupon ? `(${appliedCoupon})` : ''}</span><strong>− ${money(discount)}</strong></div>
    <div class="checkout-total"><span>Amount due</span><strong>${money(total)}</strong></div>`;
  document.getElementById('checkout-modal').hidden = false;
  document.getElementById('close-modal').focus();
}

function closeCheckout() {
  document.getElementById('checkout-modal').hidden = true;
  document.getElementById('checkout-button').focus();
}

productGrid.addEventListener('click', event => {
  const button = event.target.closest('[data-add]');
  if (button) addToCart(button.dataset.add);
});

cartItemsContainer.addEventListener('click', event => {
  const quantityButton = event.target.closest('[data-quantity]');
  const removeButton = event.target.closest('[data-remove]');
  if (quantityButton) changeQuantity(Number(quantityButton.dataset.product), Number(quantityButton.dataset.quantity));
  if (removeButton) removeFromCart(removeButton.dataset.remove);
});

searchInput.addEventListener('input', renderProducts);
categoryFilter.addEventListener('change', renderProducts);
sortSelect.addEventListener('change', renderProducts);
document.getElementById('apply-coupon').addEventListener('click', applyCoupon);
couponInput.addEventListener('keydown', event => { if (event.key === 'Enter') applyCoupon(); });
document.getElementById('checkout-button').addEventListener('click', checkout);
document.getElementById('close-modal').addEventListener('click', closeCheckout);
document.getElementById('done-button').addEventListener('click', closeCheckout);
document.querySelector('[data-close-modal]').addEventListener('click', closeCheckout);
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !document.getElementById('checkout-modal').hidden) closeCheckout(); });

populateCategories();
renderProducts();
renderCart();
