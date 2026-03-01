// ================== ORDER SETUP ==================
const orderId = "ORD" + Date.now();

const API_URL =
  "https://script.google.com/macros/s/AKfycbz8NulIj3LlhKVYub6iuH_mWyxaZORCnLS78gGBcyDDFjvNEOyhks1JugddaA-3wmu4/exec";

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
    const rate = Number(item.Price);
    const qty = item.qty;
    const amount = rate * qty;

    summaryDiv.innerHTML += `
      <div class="summary-line">
        <span>${item.Name}</span>
        <span>₹${rate} × ${qty} = ₹${amount}</span>
      </div>
    `;
  });

  summaryDiv.innerHTML += `
    <hr>
    <div><b>Order Total: ₹${itemsTotal}</b></div>
  `;
}

showSummary();

// ================== UPI PAYMENT ==================
/*const upiID = "amitjadav-1@okaxis";
const upiName = "Neev Kart Enterprise";

const upiLink = `upi://pay?pa=${upiID}&pn=${upiName}&am=${finalPayable}&tn=${orderId}`;

document.getElementById("upi-pay-link").href = upiLink;
document.getElementById("qr-image").src =
  `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;
*/
// ================== GENERATE UPI ==================
generateUPIQRCode(orderId, finalPayable);

// ================== SUBMIT ORDER ==================
async function submitOrder() {

  const utrValue = document.getElementById("utr").value.trim();

  if (!utrValue) {
    document.getElementById("status").innerText =
      "❌ Please enter UPI Transaction ID (UTR).";
    return;
  }

  const customerDetails = JSON.parse(localStorage.getItem("customerDetails"));

  if (!customerDetails) {
    document.getElementById("status").innerText =
      "❌ Customer details missing. Please restart checkout.";
    return;
  }

  const orderData = {
    action: "submitOrder",   // ✅ VERY IMPORTANT
    orderId,
    customer: customerDetails,
    cart,
    orderTotal: itemsTotal,
    deliveryCharge,
    totalAmount: finalPayable,
    utr: utrValue
  };

  document.getElementById("status").innerText = "⏳ Submitting order...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderData)
    });
    
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || "Order failed");
    }
    
    const text = await response.text();
    const result = JSON.parse(text);

    const result = await response.json();

    if (result.success === true) {

      document.getElementById("status").innerHTML =
        "🎉 Order Submitted Successfully!";

      localStorage.removeItem("cart");
      localStorage.removeItem("deliveryCharge");
      localStorage.removeItem("customerDetails");

      document.getElementById("submit-btn").disabled = true;
      document.getElementById("submit-btn").innerText = "Order Placed ✅";

      const EMAIL_ENGINE_URL = "https://script.google.com/macros/s/AKfycbz8NulIj3LlhKVYub6iuH_mWyxaZORCnLS78gGBcyDDFjvNEOyhks1JugddaA-3wmu4/exec";

      .then(res => res.json())
      .then(data => {
        console.log("Email sent:", data);
      })
      .catch(err => {
        console.error("Email error:", err);
      });

      setTimeout(() => {
        window.location.href = "index.html";
      }, 3000);

    }
      else {
      throw new Error(result.error || "Unknown error");
    }

  } catch (err) {
    console.error(err);
    document.getElementById("status").innerText =
      "❌ Failed to submit order. Please try again.";
  }
}
