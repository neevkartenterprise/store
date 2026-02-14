const NK_STORE = {

  API_URL: "YOUR_API_URL",

  products: [],
  cart: JSON.parse(localStorage.getItem("cart")) || [],

  async init() {
    await this.loadProducts();
    this.updateCartCount();
  },

  async loadProducts() {
    const res = await fetch(this.API_URL + "?action=getProducts");
    const json = await res.json();
    this.products = json.data;
    this.renderProducts(this.products);
  },

  renderProducts(items) {
    const list = document.getElementById("product-list");
    let html = "";

    items.forEach(p => {
      if (!p.Active) return;

      html += `
        <div class="product">
          <img src="https://drive.google.com/thumbnail?id=${p.Image_ID}&sz=w500">
          <h3>${p.Name}</h3>
          <p>₹${p.Price}</p>
          <button onclick="NK_STORE.addToCart('${p.ID}')">Add</button>
        </div>`;
    });

    list.innerHTML = html;
  },

  addToCart(id) {
    let item = this.cart.find(p => p.ID === id);
    if (item) item.qty++;
    else {
      const product = this.products.find(p => p.ID === id);
      product.qty = 1;
      this.cart.push(product);
    }

    localStorage.setItem("cart", JSON.stringify(this.cart));
    this.updateCartCount();
  },

  updateCartCount() {
    const total = this.cart.reduce((s, i) => s + i.qty, 0);
    document.getElementById("cart-count").innerText = total;
  }
};

NK_STORE.init();
