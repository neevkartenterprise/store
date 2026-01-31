let cart = JSON.parse(localStorage.getItem("cart")) || [];

function displayCart() {
  const cartDiv = document.getElementById("cart-items");
  const totalSpan = document.getElementById("total");

  cartDiv.innerHTML = "";

  let total = 0;

  cart.forEach((item, index) => {
    total += Number(item.Price);

    cartDiv.innerHTML += `
      <div class="product">
        <h3>${item.Name}</h3>
        <p>₹${item.Price}</p>
        <button onclick="removeItem(${index})">Remove</button>
      </div>
    `;
  });

  totalSpan.innerText = total;
}

function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
}

displayCart();
