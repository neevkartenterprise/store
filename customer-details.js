/**************************************
 * CONFIG
 **************************************/
const DELIVERY_API =
  "https://script.google.com/macros/s/AKfycbz4c6juBBbJWCqr7BO9ov5Y-gaypLwZSzywnfKeZiTh7E4UtpXySo5w-AMnrT4FeQEa/exec?action=getDeliveryAreas";

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

    const res = await fetch(DELIVERY_API, { cache: "no-store" });

    if (!res.ok) {
      throw new Error("HTTP error " + res.status);
    }

    const data = await res.json();
    console.log("✅ Delivery API data:", data);

    if (!Array.isArray(data)) {
      throw new Error("Invalid API response format");
    }

    const areaSelect = document.getElementById("area");

    // reset dropdown
    areaSelect.innerHTML =
      `<option value="">Select Area / Road *</option>`;

    deliveryMap = {};

    data.forEach(item => {
      if (!item.area) return;

      const areaName = item.area.trim();
      const charge = Number(item.deliveryCharge);

      if (isNaN(charge)) return;

      deliveryMap[areaName.toLowerCase()] = charge;

      const opt = document.createElement("option");
      opt.value = areaName;
      opt.textContent = areaName;
      areaSelect.appendChild(opt);
    });

    console.log("🗺️ Loaded Areas:", Object.keys(deliveryMap).length);

  } catch (err) {
    console.error("❌ Failed to load delivery areas:", err);
    alert("❌ Unable to load delivery areas. Please refresh.");
  }
}

// MUST be called immediately (no dependency on inputs)
loadDeliveryCharges();

/**************************************
 * CALCULATE DELIVERY & SAVE DETAILS
 **************************************/
function calculateDelivery() {
  const name = document.getElementById("cust-name").value.trim();
  const phone = document.getElementById("cust-phone").value.trim();
  const email = document.getElementById("cust-email").value.trim();
  const addr1 = document.getElementById("addr1").value.trim();
  const addr2 = document.getElementById("addr2").value.trim();
  const area = document.getElementById("area").value;

  if (!name || !phone || !email || !addr1 || !addr2 || !area) {
    alert("❌ Please fill all mandatory fields.");
    return;
  }

  if (!/^[6-9]\d{9}$/.test(phone)) {
    alert("❌ Please enter a valid 10-digit mobile number.");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert("❌ Please enter a valid email address.");
    return;
  }
  const charge = deliveryMap[area.toLowerCase()];

  if (charge === undefined) {
    alert("❌ Delivery not available for selected area.");
    return;
  }

  document.getElementById("delivery-info").innerHTML =
    `🚚 Delivery Charges: <b>₹${charge}</b> will be added`;

  localStorage.setItem("deliveryCharge", charge);

  localStorage.setItem(
    "customerDetails",
    JSON.stringify({
      name,
      phone,
      email,
      addressLine1: addr1,
      addressLine2: addr2,
      area,
      city: "Vadodara",
      state: "Gujarat",
      country: "India",
      fullAddress: `${addr1}, ${addr2}, ${area}, Vadodara, Gujarat, India`
    })
  );

  document.getElementById("proceed-btn").style.display = "inline-block";
}

/**************************************
 * NAVIGATION
 **************************************/
function goCheckout() {
  window.location.href = "checkout.html";
}
