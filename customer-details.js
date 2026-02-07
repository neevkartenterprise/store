const SHEET_API =
  "https://script.google.com/macros/s/AKfycbz8NulIj3LlhKVYub6iuH_mWyxaZORCnLS78gGBcyDDFjvNEOyhks1JugddaA-3wmu4/exec";

let deliveryMap = {};

// Load Areas + Charges from Google Sheet
fetch(SHEET_API)
  .then(res => res.json())
  .then(data => {
    const areaSelect = document.getElementById("area");

    data.forEach(item => {
      deliveryMap[item.area] = item.charge;

      const opt = document.createElement("option");
      opt.value = item.area;
      opt.textContent = item.area;
      areaSelect.appendChild(opt);
    });
  });

function calculateDelivery() {
  const name = document.getElementById("cust-name").value.trim();
  const phone = document.getElementById("cust-phone").value.trim();
  const a1 = document.getElementById("addr1").value.trim();
  const a2 = document.getElementById("addr2").value.trim();
  const area = document.getElementById("area").value;

  if (!name || !phone || !a1 || !a2 || !area) {
    alert("Please fill all mandatory fields");
    return;
  }

  const charge = deliveryMap[area];

  if (!charge) {
    alert("Delivery not available for selected area");
    return;
  }

  document.getElementById("delivery-info").innerText =
    `🚚 Delivery Charges: ₹${charge}`;

  localStorage.setItem("deliveryCharge", charge);

  localStorage.setItem(
    "customerDetails",
    JSON.stringify({
      name,
      phone,
      address: `${a1}, ${a2}, ${area}, Vadodara, Gujarat, India`
    })
  );

  document.getElementById("proceed-btn").style.display = "block";
}

function goCheckout() {
  window.location.href = "checkout.html";
}
