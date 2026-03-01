/************************************************
 * UPI PAYMENT ENGINE
 ************************************************/

function generateUPIQRCode(orderId, amount) {

  const upiID = "amitjadav-1@okaxis";
  const upiName = "Neev Kart Enterprise";

  const upiLink =
    `upi://pay?pa=${upiID}` +
    `&pn=${encodeURIComponent(upiName)}` +
    `&am=${amount}` +
    `&tn=${orderId}` +
    `&cu=INR`;

  // 🔥 Use Google Chart API (more reliable)
  const qrURL =
    "https://chart.googleapis.com/chart?chs=220x220&cht=qr&chl=" +
    encodeURIComponent(upiLink);

  document.getElementById("upi-pay-link").href = upiLink;
  document.getElementById("qr-image").src = qrURL;
}
