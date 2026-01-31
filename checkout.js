const API_URL = "https://script.google.com/macros/s/AKfycbxOyjLevmfeZ2CT7QjXLvp2e6YIvqBjPqPCHQ3zkr7gVlj9VsT3O19EeJs-gUlzSAna/exec";

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Calculate Total
let totalAmount = cart.reduce(
  (sum, item) => sum + Number(item.Price) * item.qty,
  0
);
document.getElementById("final-total").innerText = totalAmount;

// Generate UPI QR Code
const upiID = "amitjadav-1@okaxis";   // <-- Change this if bank account need to update
const upiName = "Neev Kart Enterprise";

const upiLink = `upi://pay?pa=${upiID}&pn=${upiName}&am=${totalAmount}&tn=OrderPurchase`;

const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;

document.getElementById("qr-image").src = qrUrl;

// Submit Order
async function submitOrder() {
  const name = document.getElementById("cust-name").value;
  const phone = document.getElementById("cust-phone").value;
  const utr = document.getElementById("utr").value;

  if (!name || !phone || !utr) {
    alert("Please fill all fields!");
    return;
  }

  const orderData = {
    name: name,
    phone: phone,
    utr: utr,
    total: totalAmount,
    items: JSON.stringify(cart)
  };

  document.getElementById("status").innerText = "Submitting order...";

  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(orderData)
  });

  const result = await response.text();

  if (result === "Success") {
    document.getElementById("status").innerText = "✅ Order Submitted Successfully!";
    localStorage.removeItem("cart");
  } else {
    document.getElementById("status").innerText = "❌ Error submitting order.";
  }
}
