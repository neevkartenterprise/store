// ✅ Generate Order Number
const orderID = "ORD" + Date.now();

const API_URL = "https://script.google.com/macros/s/AKfycbxOyjLevmfeZ2CT7QjXLvp2e6YIvqBjPqPCHQ3zkr7gVlj9VsT3O19EeJs-gUlzSAna/exec";

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Calculate Total
let totalAmount = cart.reduce(
  (sum, item) => sum + Number(item.Price) * item.qty,
  0
);
document.getElementById("final-total").innerText = totalAmount;

// Show Order Summary
function showSummary() {
  const summaryDiv = document.getElementById("order-summary");
  summaryDiv.innerHTML = "";

  cart.forEach(item => {
    let itemTotal = Number(item.Price) * item.qty;

    summaryDiv.innerHTML += `
      <div class="summary-item">
        <p><b>${item.Name}</b></p>
        <p>₹${item.Price} × ${item.qty}</p>
        <p><b>Subtotal:</b> ₹${itemTotal}</p>
        <hr>
      </div>
    `;
  });
}

showSummary();

// Generate UPI QR Code
const upiID = "amitjadav-1@okaxis";   // <-- Change this if bank account need to update
const upiName = "Neev Kart Enterprise";

const upiLink = `upi://pay?pa=${upiID}&pn=${upiName}&am=${totalAmount}&tn=OrderPurchase`;

// ✅ Attach App Buttons
document.getElementById("gpay-link").href = upiLink;
document.getElementById("phonepe-link").href = upiLink;
document.getElementById("paytm-link").href = upiLink;

const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;

document.getElementById("qr-image").src = qrUrl;

// Submit Order
async function submitOrder() {
  const name = document.getElementById("cust-name").value;
  const phone = document.getElementById("cust-phone").value;
  const utr = document.getElementById("utr").value;

  let utr = document.getElementById("utr").value.trim();
  let file = document.getElementById("payment-proof").files[0];
  
  // ✅ Require at least one proof
  if (!utr && !file) {
    document.getElementById("status").innerText =
      "❌ Please enter Transaction ID OR upload payment screenshot.";
    return;
  }
  
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

  let screenshotData = "";
  if (file) {
    screenshotData = await toBase64(file);
  }

  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(orderData)
  });

  const result = await response.text();

  if (result === "Success") {
  
    // ✅ 1. Show success message
    //document.getElementById("status").innerText =
    //  "✅ Order Submitted Successfully! Redirecting to Home...";
    document.getElementById("status").innerHTML =
    "🎉 Order Submitted Successfully! <br>Redirecting...";
  
    // ✅ 2. Clear cart so order is not repeated
    localStorage.removeItem("cart");
  
    // ✅ 3. Disable submit button to prevent double orders
    document.getElementById("submit-btn").disabled = true;
    document.getElementById("submit-btn").innerText = "Order Placed ✅";
  
    // ✅ 4. Redirect after 3 seconds
    setTimeout(() => {
      window.location.href = "index.html";
    }, 3000);
  } else {
    document.getElementById("status").innerText = "❌ Error submitting order. Please try again.";
  }
}

// Display Order Number
document.getElementById("order-id").innerText = orderID;

// Convert file to Base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

let orderData = {
  orderID: orderID,
  name: name,
  phone: phone,
  utr: utr,
  total: totalAmount,
  items: JSON.stringify(cart),
  screenshot: screenshotData
};
