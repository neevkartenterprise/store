const NK_ADMIN = {

  orders: [],

  async login() {

    const password = document.getElementById("adminPassword").value;

    const res = await NK_API.post({
      action: "adminLogin",
      password
    });

    if (res.success) {
      document.getElementById("loginBox").style.display = "none";
      document.getElementById("ordersSection").style.display = "block";
      this.loadOrders();
    } else {
      alert("Invalid password");
    }
  },

  async loadOrders() {

    const res = await NK_API.get("getOrders");

    if (!res.success) {
      alert("Error loading orders");
      return;
    }

    this.orders = res.data;
    this.render();
  },

  render() {

    const table = document.getElementById("ordersTable");
    let html = "";

    this.orders.forEach(o => {
      html += `
        <tr>
          <td>${o[0]}</td>
          <td>${o[1]}</td>
          <td>${o[2]}</td>
          <td>${o[3]}</td>
          <td>${o[5]}</td>
          <td>${o[6]}</td>
        </tr>
      `;
    });

    table.innerHTML = html;
  }

};
