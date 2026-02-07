// ================== ORDER SETUP ==================
const orderId = "ORD" + Date.now();
const API_URL =
  "https://script.google.com/macros/s/AKfycbxOyjLevmfeZ2CT7QjXLvp2e6YIvqBjPqPCHQ3zkr7gVlj9VsT3O19EeJs-gUlzSAna/exec";

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
const upiID = "amitjadav-1@okaxis";
const upiName = "Neev Kart Enterprise";

const upiLink = `upi://pay?pa=${upiID}&pn=${upiName}&am=${finalPayable}&tn=${orderId}`;

document.getElementById("upi-pay-link").href = upiLink;
document.getElementById("qr-image").src =
  `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;

// ================== SUBMIT ORDER ==================
async function submitOrder() {
  const utrValue = document.getElementById("utr").value.trim();
  const file = document.getElementById("payment-proof").files[0];

  if (!utrValue && !file) {
    document.getElementById("status").innerText =
      "❌ Please enter UTR OR upload payment screenshot.";
    return;
  }

  const customerDetails = JSON.parse(localStorage.getItem("customerDetails"));
  if (!customerDetails) {
    document.getElementById("status").innerText =
      "❌ Customer details missing. Please restart checkout.";
    return;
  }

  let screenshotBase64 = "";
  if (file) {
    screenshotBase64 = await toBase64(file);
  }

  const orderData = {
    orderId,                    // ✅ FIXED
    customer: customerDetails,
    cart,
    deliveryCharge,
    totalAmount: finalPayable,
    utr: utrValue,
    screenshotBase64            // ✅ FIXED
  };

  document.getElementById("status").innerText = "⏳ Submitting order...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(orderData)
    });

    const result = await response.json();   // ✅ FIXED

    if (result.success) {
      document.getElementById("status").innerHTML =
        "🎉 Order Submitted Successfully!";

      localStorage.removeItem("cart");
      localStorage.removeItem("deliveryCharge");
      localStorage.removeItem("customerDetails");

      document.getElementById("submit-btn").disabled = true;
      document.getElementById("submit-btn").innerText = "Order Placed ✅";

      setTimeout(() => {
        window.location.href = "index.html";
      }, 3000);
    } else {
      throw new Error(result.error || "Unknown error");
    }

  } catch (err) {
    console.error(err);
    document.getElementById("status").innerText =
      "❌ Failed to submit order. Please try again.";
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
