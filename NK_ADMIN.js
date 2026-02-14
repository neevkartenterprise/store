const NK_ADMIN = {

  API_URL: "https://script.google.com/macros/s/AKfycbz8NulIj3LlhKVYub6iuH_mWyxaZORCnLS78gGBcyDDFjvNEOyhks1JugddaA-3wmu4/exec",

  async login() {

    const password = document.getElementById("adminPassword").value;

    const res = await fetch(this.API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        action: "adminLogin",
        password
      })
    });

    const json = await res.json();

    if (json.success) {
      document.getElementById("loginBox").style.display = "none";
      document.getElementById("ordersSection").style.display = "block";
      this.loadOrders();
    } else {
      alert("Invalid Password");
    }
  }
};
