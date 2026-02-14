const NK_API = {

  async post(payload) {
    const res = await fetch(NK_CONFIG.API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async get(action) {
    const res = await fetch(NK_CONFIG.API_URL + "?action=" + action);
    return await res.json();
  }

};
