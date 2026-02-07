// 📍 Origin: Vrundavan Char Rasta
const ORIGIN_LAT = 22.3003452;
const ORIGIN_LNG = 73.2383002;

// Load Areas (export your Excel as area.json)
fetch("areas.json")
  .then(res => res.json())
  .then(data => {
    const areaSelect = document.getElementById("area");
    data.forEach(a => {
      const opt = document.createElement("option");
      opt.value = a;
      opt.textContent = a;
      areaSelect.appendChild(opt);
    });
  });

async function calculateDelivery() {
  const name = custName();
  const phone = custPhone();
  const a1 = addr1.value.trim();
  const a2 = addr2.value.trim();
  const area = document.getElementById("area").value;

  if (!name || !phone || !a1 || !a2 || !area) {
    alert("Please fill all mandatory fields");
    return;
  }

  const fullAddress = `${a1}, ${a2}, ${area}, Vadodara, Gujarat, India`;

  // OpenCage (ZERO COST)
  const key = "YOUR_OPENCAGE_KEY";
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(fullAddress)}&key=${key}&countrycode=in`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.results.length) {
    alert("Address not found in Vadodara");
    return;
  }

  const dest = data.results[0].geometry;
  const distance = haversine(ORIGIN_LAT, ORIGIN_LNG, dest.lat, dest.lng);

  const charge = getCharge(distance);

  if (charge === "CALL") {
    alert("Distance above 20km. Please call for delivery.");
    return;
  }

  document.getElementById("delivery-info").innerText =
    `📍 Distance: ${distance.toFixed(2)} km | 🚚 Delivery Charges: ₹${charge}`;

  localStorage.setItem("deliveryCharge", charge);
  localStorage.setItem("customerDetails", JSON.stringify({
    name, phone, address: fullAddress
  }));

  document.getElementById("proceed-btn").style.display = "block";
}

function goCheckout() {
  window.location.href = "checkout.html";
}

// Helpers
function custName(){ return document.getElementById("cust-name").value.trim(); }
function custPhone(){ return document.getElementById("cust-phone").value.trim(); }
function addr1(){ return document.getElementById("addr1"); }

// Distance
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Charges
function getCharge(km) {
  if (km <= 3) return 40;
  if (km <= 7) return 60;
  if (km <= 12) return 90;
  if (km <= 20) return 120;
  return "CALL";
}
