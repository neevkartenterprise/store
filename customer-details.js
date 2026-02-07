/**************************************
 * CONFIG
 **************************************/
const DELIVERY_API =
  "https://script.google.com/macros/s/AKfycbz8NulIj3LlhKVYub6iuH_mWyxaZORCnLS78gGBcyDDFjvNEOyhks1JugddaA-3wmu4/exec";

/**************************************
 * GLOBAL
 **************************************/
let deliveryMap = {};

/**************************************
 * LOAD AREA + DELIVERY CHARGES
 **************************************/
async function loadDeliveryCharges() {
  try {
    console.log("📡 Fetching delivery areas...");

    const res = await fetch(DELIVERY_API);

    // ❌ API not reachable
    if (!res.ok) {
      throw new Error("HTTP Error " + res.status);
    }

    const text = await res.text();
    console.log("📦 Raw API response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error("API did not return valid JSON");
    }

    if (!Array.isArray(data)) {
      throw new Error("Invalid API response format");
    }

    const areaSelect = document.getElementById("area");
    areaSelect.innerHTML =
      `<option value="">Select



// Load on page open
loadDeliveryCharges();


/**************************************
 * CALCULATE DELIVERY & SAVE DETAILS
 **************************************/
function calculateDelivery() {
  const name = document.getElementById("cust-name").value.trim();
  const phone = document.getElementById("cust-phone").value.trim();
  const addr1 = document.getElementById("addr1").value.trim();
  const addr2 = document.getElementById("addr2").value.trim();
  const area = document.getElementById("area").value;

  // Mandatory validation
  if (!name || !phone || !addr1 || !addr2 || !area) {
    alert("❌ Please fill all mandatory fields.");
    return;
  }

  if (!/^[6-9]\d{9}$/.test(phone)) {
    alert("❌ Please enter a valid 10-digit mobile number.");
    return;
  }

  const charge = deliveryMap[area.toLowerCase()];

  if (charge === undefined) {
    alert("❌ Delivery not available for selected area.");
    return;
  }

  // Show delivery info
  document.getElementById("delivery-info").innerHTML =
    `🚚 Delivery Charges: <b>₹${charge}</b> will be added`;

  // Save delivery charge
  localStorage.setItem("deliveryCharge", charge);

  // Save customer details
  localStorage.setItem(
    "customerDetails",
    JSON.stringify({
      name: name,
      phone: phone,
      addressLine1: addr1,
      addressLine2: addr2,
      area: area,
      city: "Vadodara",
      state: "Gujarat",
      country: "India",
      fullAddress: `${addr1}, ${addr2}, ${area}, Vadodara, Gujarat, India`
    })
  );

  // Show Proceed button
  document.getElementById("proceed-btn").style.display = "inline-block";
}

/**************************************
 * NAVIGATION
 **************************************/
function goBack() {
  window.location.href = "cart.html";
}

function goCheckout() {
  window.location.href = "checkout.html";
}
