const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw8HMtlTF_0ACXVBYe1Mza6cBJAYmSPr5J0_edbCht_L8UpRI5TNVYT_pslT2KM6C4zMQ/exec";

let sessionToken = localStorage.getItem("adminToken");

/************************************************
 * LOGIN
 ************************************************/
async function adminLogin() {

  const password = document.getElementById("adminPassword").value;

  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "adminLogin",
      password
    })
  });

  const data = await res.json();

  if (!data.success) {
    alert("Invalid password");
    return;
  }

  localStorage.setItem("adminToken", data.token);
  sessionToken = data.token;

  loadOrders();
}

/************************************************
 * LOAD ORDERS
 ************************************************/
async function loadOrders() {

  if (!sessionToken) {
    alert("Session expired");
    return;
  }

  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "getOrders",
      token: sessionToken
    })
  });

  const data = await res.json();

  if (!data.success) {
    alert("Unauthorized. Please login again.");
    localStorage.removeItem("adminToken");
    return;
  }

  console.log(data.data);
}

/************************************************
 * UPDATE STATUS
 ************************************************/
async function updateStatus(action, orderId) {

  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({
      action,
      orderId,
      token: sessionToken
    })
  });

  const data = await res.json();

  if (!data.success) {
    alert("Unauthorized or failed.");
    return;
  }

  loadOrders();
}
