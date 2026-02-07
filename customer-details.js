/**************************************
 * CONFIG
 **************************************/
const DELIVERY_API =
  "https://script.google.com/macros/s/AKfycbz8NulIj3LlhKVYub6iuH_mWyxaZORCnLS78gGBcyDDFjvNEOyhks1JugddaA-3wmu4/exec";

/**************************************
 * GLOBALS
 **************************************/
let deliveryMap = {};

/**************************************
 * LOAD AREA + DELIVERY CHARGES
 **************************************/
async function loadDeliveryCharges() {
  try {
    const res = await fetch(DELIVERY_API);
    const data = await res.json();

    const areaSelect = document.getElementById("area");
    areaSelect.innerHTML =
      `<option value="">Select Area / Road *</option>`;

    deliveryMap = {};

    data.forEach(item => {
      if (!item.area) return;

      const areaName = item.area.trim();
      const charge = Number(item.deliveryCharge) || 0;

      deliveryMap[areaName.toLowerCase()] = charge;

      const opt = document.createElement("option");
      opt.value = areaName;
      opt.textContent = areaName;
      areaSelect.appendChild(opt);
    });

  } catch (err) {
    console.error("Failed to load delivery areas:", err);
    alert("❌ Unable to load delivery areas. Please refresh.");
  }
}


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
