// ✅ Generate Order Number
const orderID = "ORD" + Date.now();

const API_URL =
  "https://script.google.com/macros/s/AKfycbxOyjLevmfeZ2CT7QjXLvp2e6YIvqBjPqPCHQ3zkr7gVlj9VsT3O19EeJs-gUlzSAna/exec";

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ✅ Fixed Origin: Vrundavan Char Rasta
const originLat = 22.3003452;
const originLon = 73.2383002;

// Charges
let deliveryCharge = 0;

// Calculate Total
let totalAmount = cart.reduce(
  (sum, item) => sum + Number(item.Price) * item.qty,
  0
);

document.getElementById("final-total").innerText = totalAmount;

// -------------------------------
// ✅ Show Order Summary (New Format)
// -------------------------------
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
    <div class="summary-line">
      <span><b>Delivery Charge:</b></span>
      <span><b>₹${deliveryCharge}</b></span>
    </div>
    <div class="summary-total">
      <b>Total: ₹${totalAmount + deliveryCharge}</b>
    </div>
  `;

  document.getElementById("final-total").innerText =
    totalAmount + deliveryCharge;

  updateUPI();
}

showSummary();

// -------------------------------
// ✅ UPI QR + Button Update
// -------------------------------
const upiID = "amitjadav-1@okaxis";
const upiName = "Neev Kart Enterprise";

function updateUPI() {
  let finalTotal = totalAmount + deliveryCharge;

  const upiLink =
    `upi://pay?pa=${upiID}&pn=${upiName}&am=${finalTotal}&tn=OrderPurchase`;

  // Update Pay Button Link
  document.getElementById("upi-pay-link").href = upiLink;

  // ✅ QR Code Refresh (Prevent Cache)
  const qrUrl =
    `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=` +
    encodeURIComponent(upiLink) +
    `&t=` + new Date().getTime(); // Cache buster

  document.getElementById("qr-image").src = qrUrl;
}


updateUPI();

// -------------------------------
// ✅ Map Link Auto Update (Existing)
// -------------------------------
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

// -------------------------------
// ✅ Delivery Charge Calculation (FREE)
// -------------------------------
async function calculateDeliveryCharge() {

  document.getElementById("delivery-status").innerText =
    "Calculating delivery distance...";

  let address =
    document.getElementById("addr1").value + ", " +
    document.getElementById("area").value +
    ", Vadodara, Gujarat, India";

  // Step 1: Convert Address → Coordinates
  let geoURL =
    `https://nominatim.openstreetmap.org/search?format=json&q=` +
    encodeURIComponent(address);

  let geoRes = await fetch(geoURL);
  let geoData = await geoRes.json();

  if (geoData.length === 0) {
    alert("❌ Address not found. Please enter correct Vadodara address.");
    return;
  }

  let destLat = geoData[0].lat;
  let destLon = geoData[0].lon;

  // Step 2: Distance using OSRM
  let routeURL =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${originLon},${originLat};${destLon},${destLat}?overview=false`;

  let routeRes = await fetch(routeURL);
  let routeData = await routeRes.json();

  let distanceKM = routeData.routes[0].distance / 1000;

  // Step 3: Apply Charge Slabs
  if (distanceKM <= 3) deliveryCharge = 40;
  else if (distanceKM <= 7) deliveryCharge = 60;
  else if (distanceKM <= 12) deliveryCharge = 90;
  else if (distanceKM <= 20) deliveryCharge = 120;
  else {
    alert("Delivery above 20 km. Please call store.");
    deliveryCharge = 0;
  }

  document.getElementById("delivery-status").innerHTML =
    `📍 Distance: <b>${distanceKM.toFixed(2)} km</b> | Delivery Charge: <b>₹${deliveryCharge}</b>`;

  showSummary();
  updateUPI(); // ✅ Refresh QR again after delivery calculation
}

// -------------------------------
// ✅ Submit Order (Existing + Delivery Added)
// -------------------------------
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
  if (file) screenshotData = await toBase64(file);

  const orderData = {
    orderID: orderID,
    name: name,
    phone: phone,
    utr: utrValue,
    deliveryCharge: deliveryCharge,
    total: totalAmount + deliveryCharge,
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

// -------------------------------
// Convert Screenshot → Base64
// -------------------------------
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
