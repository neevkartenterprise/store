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

  document.getElementById("upi-pay-link").href = upiLink;

  // ✅ Use Google QR API (Reliable)
  const qrUrl =
    "https://chart.googleapis.com/chart?chs=220x220&cht=qr&chl=" +
    encodeURIComponent(upiLink);

  const qrImg = document.getElementById("qr-image");
  qrImg.src = qrUrl;

  // Status message
  qrImg.onload = function () {
    document.getElementById("qr-status").innerText =
      "✅ QR Code Ready. Please Scan.";
  };

  qrImg.onerror = function () {
    document.getElementById("qr-status").innerText =
      "❌ QR failed to load. Please check your internet.";
  };
}
updateUPI();

// -------------------------------
// ✅ Delivery Charge Calculation (FREE)
// -------------------------------
async function calculateDeliveryCharge() {

  document.getElementById("delivery-status").innerText =
    "Calculating delivery distance...";

  let pin = document.getElementById("pincode").value.trim();

  /*if (pin.length !== 6) {
    alert("❌ Please enter a valid 6-digit PIN Code.");
    return;*/
  }

  let address =
    document.getElementById("addr1").value + ", " +
    document.getElementById("addr2").value + ", " +
    document.getElementById("area").value + ", " +
    document.getElementById("landmark").value + ", " +
    pin + ", Vadodara, Gujarat, India";

  if (!document.getElementById("addr1").value.trim() ||
      !document.getElementById("area").value.trim() ||
      !document.getElementById("pincode").value.trim()) {
  
    alert("❌ Please enter Address Line 1 and Area/Society.");
    return;
  }
  
  const OPENCAGE_KEY = "805a2f41a9824abdab5cc52b125be639";

  // ✅ NO bounds restriction
  let geoURL =
    `https://api.opencagedata.com/geocode/v1/json?q=` +
    encodeURIComponent(address) +
    `&key=${OPENCAGE_KEY}` +
    `&countrycode=in&limit=5&no_annotations=1`;

  let geoRes = await fetch(geoURL);
  let geoData = await geoRes.json();

  if (!geoData.results || geoData.results.length === 0) {
    alert("❌ Address not found.");
    return;
  }

  // ✅ Find the best matching result using PIN code
  let bestResult = null;
  
  for (let r of geoData.results) {
  
    let comp = r.components;
  
    // Match PIN code exactly
    if (comp.postcode && comp.postcode === pin) {
      bestResult = r;
      break;
    }
  }
  
  // If no postcode match, fallback to first result
  if (!bestResult) {
    bestResult = geoData.results[0];
  }
  
  let destLat = bestResult.geometry.lat;
  let destLon = bestResult.geometry.lng;
  
  console.log("Selected Location:", bestResult.formatted);
  console.log("Lat:", destLat, "Lon:", destLon);


  // ✅ Debug
  console.log("Destination:", destLat, destLon);

  // ✅ Correct Haversine distance
  let distanceKM = getDistanceKM(
    originLat, originLon,
    destLat, destLon
  );

  // Step 3: Delivery Slabs
  if (distanceKM <= 3) deliveryCharge = 40;
  else if (distanceKM <= 7) deliveryCharge = 60;
  else if (distanceKM <= 12) deliveryCharge = 90;
  else if (distanceKM <= 20) deliveryCharge = 120;
  else {
    alert("Delivery above 20 km. Please call store.");
    deliveryCharge = 0;
  }

  document.getElementById("delivery-status").innerHTML =
    `📍 Distance: <b>${distanceKM.toFixed(2)} km</b><br>
     🚚 Delivery Charge: <b>₹${deliveryCharge}</b>`;

  /*document.getElementById("delivery-status").innerHTML =
  `📌 Location Found: ${bestResult.formatted}<br>`;*/
  
  showSummary();
  updateUPI();
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
  
  // ✅ DELIVERY CHECK (Add Here)
    if (deliveryCharge === 0) {
    alert("🚚 Please calculate delivery charges first.");
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

// ✅ Haversine Formula Distance Calculator (Accurate)
/*  function getDistanceKM(lat1, lon1, lat2, lon2) {
      //originLat, originLon, destLat, destLon
    const R = 6371; // Earth radius in KM
  
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c;
  }*/

// ✅ Haversine Formula Distance Calculator (Accurate)
  function getDistanceKM(originLat, originLon, destLat, destLon) {
      //originLat, originLon, destLat, destLon
    const R = 6371; // Earth radius in KM
  
    const dLat = (destLat - originLat) * Math.PI / 180;
    const dLon = (destLon - originLon) * Math.PI / 180;
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(originLat * Math.PI / 180) *
      Math.cos(destLat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c;
  }
