const API_URL = "https://script.google.com/macros/s/AKfycbxOyjLevmfeZ2CT7QjXLvp2e6YIvqBjPqPCHQ3zkr7gVlj9VsT3O19EeJs-gUlzSAna/exec";

let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Load Products from Sheet
async function loadProducts() {
  const res = await fetch(API_URL);
  products = await res.json();
  displayProducts(products);
}

function displayProducts(items) {
  const list = document.getElementById("product-list");
  list.innerHTML = "";

  items.forEach(p => {

    const isActive =
      p.Active === true ||
      String(p.Active).trim().toUpperCase() === "TRUE";

    if (!isActive) return;

    list.innerHTML += `
      <div class="product">
        <img 
          src="https://drive.google.com/thumbnail?id=${p.Image_ID}&sz=w500"
          onerror="this.src='https://via.placeholder.com/200'"
        >
        <h3>${p.Name}</h3>
        <p>₹${p.Price}</p>
        ${getCartButton(p.ID)}
      </div>
    `;
  });
}

function decreaseFromCart(id) {
  let item = cart.find(p => p.ID === id);

  if (!item) return;

  if (item.qty > 1) {
    item.qty -= 1;
  } else {
    // Remove item if qty becomes 0
    cart = cart.filter(p => p.ID !== id);
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  updateCartCount();
  displayProducts(products);
}

function getCartButton(id) {
  let item = cart.find(p => p.ID === id);

  // If not in cart → show Add button
  if (!item) {
    return `<button onclick="addToCart('${id}')">Add to Cart</button>`;
  }

  // If already in cart → show quantity controls
  return `
    <div class="product-qty">
      <button onclick="decreaseFromCart('${id}')">−</button>
      <span>${item.qty}</span>
      <button onclick="addToCart('${id}')">+</button>
    </div>
  `;
}

// Add to Cart
function addToCart(id) {
  const product = products.find(p => p.ID === id);

  // Check if product already in cart
  let existing = cart.find(item => item.ID === id);

  if (existing) {
    existing.qty += 1; // Increase quantity
  } else {
    product.qty = 1; // Add new item with qty
    cart.push(product);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();

  // ✅ Refresh Product UI
  displayProducts(products);
}

// Update Cart Count
function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById("cart-count").innerText = totalItems;
}

// Search Feature
document.getElementById("search").addEventListener("input", e => {
  const keyword = e.target.value.toLowerCase();
  const filtered = products.filter(p =>
    p.Name.toLowerCase().includes(keyword)
  );
  displayProducts(filtered);
});

// Initial Load
loadProducts();
updateCartCount();
