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
    if (p.Active !== "TRUE") return;

    list.innerHTML += `
      <div class="product">
        <img src="https://drive.google.com/uc?export=view&id=${p.Image_ID}">
        <h3>${p.Name}</h3>
        <p>₹${p.Price}</p>
        <button onclick="addToCart('${p.ID}')">Add to Cart</button>
      </div>
    `;
  });
}

// Add to Cart
function addToCart(id) {
  const product = products.find(p => p.ID === id);
  cart.push(product);

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

// Update Cart Count
function updateCartCount() {
  document.getElementById("cart-count").innerText = cart.length;
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
