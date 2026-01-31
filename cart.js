let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ✅ Fix old cart items missing qty
cart = cart.map(item => {
  if (!item.qty) item.qty = 1;
  return item;
});

localStorage.setItem("cart", JSON.stringify(cart));

function displayCart() {
  const cartDiv = document.getElementById("cart-items");
  const totalSpan = document.getElementById("total");

  cartDiv.innerHTML = "";

  let total = 0;

  cart.forEach((item, index) => {
    let itemTotal = Number(item.Price) * item.qty;
    total += itemTotal;

    cartDiv.innerHTML += `
      <div class="cart-item">

        <!-- Thumbnail -->
        <img 
          src="https://drive.google.com/thumbnail?id=${item.Image_ID}&sz=w100"
          class="cart-thumb"
        >

        <!-- Info -->
        <div class="cart-info">
          <h3>${item.Name}</h3>
          <p>₹${item.Price} × ${item.qty}</p>
          <p><b>Subtotal:</b> ₹${itemTotal}</p>
        </div>

        <!-- Quantity Controls -->
        <div class="qty-controls">
          <button onclick="decreaseQty(${index})">−</button>
          <span>${item.qty}</span>
          <button onclick="increaseQty(${index})">+</button>
        </div>

        <!-- Remove -->
        <button onclick="removeItem(${index})">Remove</button>

      </div>
    `;
  });

  totalSpan.innerText = total;
}

// Increase Quantity
function increaseQty(index) {
  cart[index].qty += 1;
  saveCart();
}

// Decrease Quantity
function decreaseQty(index) {
  if (cart[index].qty > 1) {
    cart[index].qty -= 1;
  } else {
    cart.splice(index, 1);
  }
  saveCart();
}

// Remove Item
function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
}

// Save + Refresh
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
}

displayCart();
