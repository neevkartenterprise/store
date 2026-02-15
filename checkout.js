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
const upiID = "amitjadav-1@okaxis";
const upiName = "Neev Kart Enterprise";

const upiLink = `upi://pay?pa=${upiID}&pn=${upiName}&am=${finalPayable}&tn=${orderId}`;

document.getElementById("upi-pay-link").href = upiLink;
document.getElementById("qr-image").src =
  `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;

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
      //headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();

    if (result.success === true) {

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
  sendOrderEmails({
    orderId: orderId,
    orderDate: new Date().toLocaleDateString(),
    customerName: customerName,
    phone: phone,
    email: email,
    address: fullAddress,
    paymentMethod: paymentMethod,
    utr: utr,
    items: itemsArray, // must be structured
    deliveryCharges: deliveryCharges,
    totalAmount: grandTotal
  });

}


/************************************************
 * SEND ORDER EMAIL + GENERATE PDF INVOICE
 ************************************************/
function sendOrderEmails(orderData) {

  const ADMIN_EMAILS = "neevkartenterprise@gmail.com,amitjadav@gmail.com";

  const {
    orderId,
    orderDate,
    customerName,
    phone,
    email,
    address,
    paymentMethod,
    utr,
    items,
    deliveryCharges,
    totalAmount
  } = orderData;

  /************************************************
   * CREATE GOOGLE DOC FOR INVOICE
   ************************************************/
  const doc = DocumentApp.create("Invoice_" + orderId);
  const body = doc.getBody();

  body.appendParagraph("Neev Kart Enterprise").setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph("Vadodara, Gujarat");
  body.appendParagraph("Email: neevkartenterprise@gmail.com");
  body.appendParagraph(" ");

  body.appendParagraph("Invoice No: " + orderId);
  body.appendParagraph("Invoice Date: " + orderDate);
  body.appendParagraph(" ");

  body.appendParagraph("Bill To:");
  body.appendParagraph(customerName);
  body.appendParagraph(address);
  body.appendParagraph("Phone: " + phone);
  body.appendParagraph(" ");

  body.appendParagraph("Items:");
  body.appendParagraph(" ");

  const tableData = [
    ["Item", "Qty", "Rate", "Amount"]
  ];

  items.forEach(item => {
    tableData.push([
      item.name,
      item.qty.toString(),
      "₹" + item.price,
      "₹" + (item.qty * item.price)
    ]);
  });

  const table = body.appendTable(tableData);

  body.appendParagraph(" ");
  body.appendParagraph("Delivery Charges: ₹" + deliveryCharges);
  body.appendParagraph("Total Amount: ₹" + totalAmount);
  body.appendParagraph(" ");
  body.appendParagraph("Thank you for your business!");

  doc.saveAndClose();

  /************************************************
   * CONVERT TO PDF
   ************************************************/
  const pdf = DriveApp.getFileById(doc.getId()).getAs("application/pdf");
  pdf.setName("Invoice_" + orderId + ".pdf");

  /************************************************
   * ADMIN EMAIL
   ************************************************/
  const adminSubject = "🛒 New Order Received – " + orderId + " | Neev Kart Enterprise";

  const adminBody =
    "Neev Kart Enterprise\n\n" +
    "New Order Notification\n\n" +
    "Order ID: " + orderId + "\n" +
    "Order Date: " + orderDate + "\n" +
    "Payment Method: " + paymentMethod + "\n" +
    "UTR: " + utr + "\n\n" +
    "Customer Name: " + customerName + "\n" +
    "Phone: " + phone + "\n" +
    "Email: " + email + "\n" +
    "Address: " + address + "\n\n" +
    "Delivery Charges: ₹" + deliveryCharges + "\n" +
    "Total Amount: ₹" + totalAmount + "\n\n" +
    "Invoice attached.";

  MailApp.sendEmail({
    to: ADMIN_EMAILS,
    subject: adminSubject,
    body: adminBody,
    attachments: [pdf]
  });

  /************************************************
   * CUSTOMER EMAIL
   ************************************************/
  const customerSubject = "✅ Order Confirmed – " + orderId + " | Neev Kart Enterprise";

  const customerBody =
    "Dear " + customerName + ",\n\n" +
    "Thank you for shopping with Neev Kart Enterprise.\n\n" +
    "Your order has been successfully received.\n\n" +
    "Order ID: " + orderId + "\n" +
    "Payment Method: " + paymentMethod + "\n" +
    "Transaction ID: " + utr + "\n\n" +
    "Please find attached invoice.\n\n" +
    "For any queries contact:\n" +
    "neevkartenterprise@gmail.com\n\n" +
    "Regards,\n" +
    "Neev Kart Enterprise";

  MailApp.sendEmail({
    to: email,
    subject: customerSubject,
    body: customerBody,
    attachments: [pdf]
  });

  /************************************************
   * CLEANUP TEMP FILE
   ************************************************/
  DriveApp.getFileById(doc.getId()).setTrashed(true);
}
