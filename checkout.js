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
    summaryDiv.innerHTML += `
      <div class="summary-line">
        <span class="summary-name">${item.Name}</span>
        <span class="summary-price">₹${item.Price} × ${item.qty}</span>
      </div>
    `;
  });

  // Divider + Total Line
  summaryDiv.innerHTML += `
    <hr class="summary-divider">
    <div class="summary-total">
      <b>Total: ₹${totalAmount}</b>
    </div>
  `;
}

showSummary();

// Generate UPI QR Code
const upiID = "amitjadav-1@okaxis";   // <-- Change this if bank account need to update
const upiName = "Neev Kart Enterprise";

const upiLink = `upi://pay?pa=${upiID}&pn=${upiName}&am=${totalAmount}&tn=OrderPurchase`;

// ✅ Attach App Buttons
document.getElementById("upi-pay-link").href = upiLink;

const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;

document.getElementById("qr-image").src = qrUrl;

// Submit Order
async function submitOrder() {
  const name = document.getElementById("cust-name").value.trim();
  const phone = document.getElementById("cust-phone").value.trim();

  const utrValue = document.getElementById("utr").value.trim();
  const file = document.getElementById("payment-proof").files[0];

  // Require at least one proof
  if (!utrValue && !file) {
    document.getElementById("status").innerText =
      "❌ Please enter Transaction ID OR upload screenshot.";
    return;
  }

  if (!name || !phone) {
    alert("Please fill Name and Phone!");
    return;
  }

  let screenshotData = "";
  if (file) {
    screenshotData = await toBase64(file);
  }

  const orderData = {
    orderID: orderID,
    name: name,
    phone: phone,
    utr: utrValue,
    total: totalAmount,
    items: JSON.stringify(cart),
    screenshot: screenshotData
  };

  document.getElementById("status").innerText = "Submitting order...";

  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(orderData)
  });

  const result = await response.text();

  if (result === "Success") {
    document.getElementById("status").innerHTML =
      "🎉 Order Submitted Successfully! Redirecting...";

    localStorage.removeItem("cart");

    document.getElementById("submit-btn").disabled = true;
    document.getElementById("submit-btn").innerText = "Order Placed ✅";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 3000);
  } else {
    document.getElementById("status").innerText =
      "❌ Error submitting order. Please try again.";
  }
}

// Convert file to Base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function updateMapLink() {

  let fullAddress =
    document.getElementById("addr1").value + ", " +
    document.getElementById("addr2").value + ", " +
    document.getElementById("area").value + ", " +
    document.getElementById("landmark").value + ", Vadodara, Gujarat";

  let mapURL =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(fullAddress);

  document.getElementById("map-link").href = mapURL;
}

["addr1", "addr2", "area", "landmark"].forEach(id => {
  document.getElementById(id).addEventListener("input", updateMapLink);
});
