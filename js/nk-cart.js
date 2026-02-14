const NK_CART = {

  items: [],

  add(product, price) {
    this.items.push({ product, price });
    this.save();
    alert("Added to cart");
  },

  save() {
    localStorage.setItem("nk_cart", JSON.stringify(this.items));
  },

  load() {
    this.items = JSON.parse(localStorage.getItem("nk_cart")) || [];
  },

  getTotal() {
    return this.items.reduce((sum, i) => sum + i.price, 0);
  },

  clear() {
    localStorage.removeItem("nk_cart");
  }

};
