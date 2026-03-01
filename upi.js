/************************************************
 * UPI QR GENERATOR (LOCAL)
 ************************************************/
console.log("UPI JS Loaded");
function generateUPIQRCode(orderId, amount) {
console.log("UPI JS Loaded");
  const upiID = "amitjadav-1@okaxis";
  const upiName = "Neev Kart Enterprise";

  const upiLink =
    `upi://pay?pa=${upiID}` +
    `&pn=${encodeURIComponent(upiName)}` +
    `&am=${amount}` +
    `&tn=${orderId}` +
    `&cu=INR`;

  // Set Pay link
  document.getElementById("upi-pay-link").href = upiLink;

  // Clear old QR if exists
  const qrContainer = document.getElementById("qr-image");
  qrContainer.innerHTML = "";

  // Generate new QR
  new QRCode(qrContainer, {
    text: upiLink,
    width: 220,
    height: 220
  });
}
