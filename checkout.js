// ================== ORDER SETUP ==================
const orderID = "ORD" + Date.now();
const API_URL = "https://script.google.com/macros/s/AKfycbxOyjLevmfeZ2CT7QjXLvp2e6YIvqBjPqPCHQ3zkr7gVlj9VsT3O19EeJs-gUlzSAna/exec";

// ================== LOAD DATA ==================
const cart = JSON.parse(localStorage.getItem("cart")) || [];
const deliveryCharge = Number(localStorage.getItem("deliveryCharge")) || 0;

// ================== CALCULATIONS ==================
const itemsTotal = cart.reduce(
  (sum, item) => sum + Number(item.Price) * item.qty,
  0
);

const finalPayable = itemsTotal + deliveryCharge;

// ================== UPDATE UI ==================
document.getElementById("delivery-charge").innerText = deliveryCharge;
document.getElementById("final-total").innerText = finalPayable;

// ================== ORDER SUMMARY ==================
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

  summaryDiv.innerHTML += `

    <hr class="summary-divider">

    <div class="summary-total">
      <b>Total: ₹${finalPayable}</b>
    </div>
  `;
}

showSummary();

// ================== UPI PAYMENT ==================
const upiID = "amitjadav-1@okaxis";
const upiName = "Neev Kart Enterprise";

const upiLink = `upi://pay?pa=${upiID}&pn=${upiName}&am=${finalPayable}&tn=OrderPurchase`;

document.getElementById("upi-pay-link").href = upiLink;

document.getElementById("qr-image").src =
  `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;

// ================== SUBMIT ORDER ==================
async function submitOrder() {
  const name = document.getElementById("cust-name").value.trim();
  const phone = document.getElementById("cust-phone").value.trim();
  const utrValue = document.getElementById("utr").value.trim();
  const file = document.getElementById("payment-proof").files[0];

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
    orderID,
    name,
    phone,
    deliveryCharge,
    total: finalPayable,
    items: JSON.stringify(cart),
    utr: utrValue,
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
    localStorage.removeItem("deliveryCharge");

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

// ================== FILE TO BASE64 ==================
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
