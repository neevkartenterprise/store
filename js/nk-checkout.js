const NK_CHECKOUT = {

  async submit() {

    NK_CART.load();

    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;

    const payload = {
      action: "submitOrder",
      name,
      phone,
      address,
      items: JSON.stringify(NK_CART.items),
      total: NK_CART.getTotal()
    };

    const res = await NK_API.post(payload);

    if (res.success) {
      alert("Order Placed Successfully!");
      NK_CART.clear();
      window.location.href = "index.html";
    } else {
      alert("Error placing order");
    }
  }

};
