const API_URL = "https://script.google.com/macros/s/AKfycbz8NulIj3LlhKVYub6iuH_mWyxaZORCnLS78gGBcyDDFjvNEOyhks1JugddaA-3wmu4/exec";

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
          src="https://drive.google.com/thumbnail?id=${p.Image_ID}&sz=w1000"
          onerror="this.src='images/no-image.png'"
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

//If cart is emplty
function toggleCartAccess() {
  const cartLink = document.getElementById("cart-link");
  const tooltip = document.getElementById("cart-tooltip");

  if (cart.length === 0) {
    cartLink.classList.add("disabled-cart");
    cartLink.style.pointerEvents = "none";
    cartLink.style.opacity = "0.6";

    tooltip.style.display = "none"; // shown via hover only
  } else {
    cartLink.classList.remove("disabled-cart");
    cartLink.style.pointerEvents = "auto";
    cartLink.style.opacity = "1";
  }
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

  toggleCartAccess(); // ✅ important. Do not allow access if cart is empty.
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
toggleCartAccess();
