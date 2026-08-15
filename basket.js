(function () {
    const KEY = "aerialarc_basket";

    function load() {
        try {
            const raw = localStorage.getItem(KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function save(items) {
        try {
            localStorage.setItem(KEY, JSON.stringify(items));
        } catch (e) {}
    }

    const style = document.createElement("style");
    style.textContent = `
      .aab-icon{position:relative;display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;margin-right:14px;border:1px solid rgba(0,0,0,0.08);background:rgba(255,255,255,0.5);border-radius:10px;cursor:pointer;color:#111111;transition:transform 0.28s ease, box-shadow 0.28s ease;flex:0 0 auto;}
      .dark-mode .aab-icon{background:rgba(255,255,255,0.06);border-color:rgba(255,255,255,0.12);color:#f5f5f5;}
      .aab-icon:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,0.12);}
      .aab-icon svg{width:20px;height:20px;display:block;}
      .aab-badge{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;padding:0 4px;border-radius:999px;background:#111111;color:#ffffff;font-size:10px;font-weight:800;display:none;align-items:center;justify-content:center;line-height:1;}
      .dark-mode .aab-badge{background:#ffffff;color:#000000;}
      .aab-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.5);opacity:0;visibility:hidden;transition:opacity 0.3s ease, visibility 0.3s ease;z-index:9998;}
      .aab-backdrop.open{opacity:1;visibility:visible;}
      .aab-drawer{position:fixed;top:0;right:0;height:100vh;width:min(380px,92vw);background:#0b0d13;color:#eaeaea;transform:translateX(105%);transition:transform 0.35s cubic-bezier(.25,.8,.25,1);z-index:9999;display:flex;flex-direction:column;box-shadow:-20px 0 60px rgba(0,0,0,0.4);}
      .aab-drawer.open{transform:translateX(0);}
      .aab-head{display:flex;align-items:center;justify-content:space-between;padding:22px 20px;border-bottom:1px solid rgba(255,255,255,0.08);}
      .aab-head h3{margin:0;font-size:20px;font-weight:800;}
      .aab-close{background:transparent;border:1px solid rgba(255,255,255,0.12);color:#ffffff;width:32px;height:32px;border-radius:8px;cursor:pointer;font-size:14px;line-height:1;transition:0.3s;}
      .aab-close:hover{background:rgba(255,255,255,0.08);}
      .aab-body{flex:1;overflow-y:auto;padding:8px 20px;}
      .aab-empty{text-align:center;color:#8a8a8a;padding:40px 10px;font-size:14px;line-height:1.7;}
      .aab-item{display:flex;justify-content:space-between;gap:12px;padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.06);}
      .aab-item-name{font-size:14px;font-weight:700;}
      .aab-item-meta{display:block;font-size:12px;color:#8f8f8f;margin-top:3px;}
      .aab-item-price{font-size:14px;font-weight:800;white-space:nowrap;}
      .aab-remove{background:transparent;border:none;color:#ff6b6b;cursor:pointer;font-size:12px;padding:0;margin-top:8px;font-family:inherit;}
      .aab-foot{padding:18px 20px 22px;border-top:1px solid rgba(255,255,255,0.08);}
      .aab-total{display:flex;justify-content:space-between;align-items:center;font-size:17px;font-weight:800;margin-bottom:14px;}
      .aab-checkout{display:block;width:100%;text-align:center;background:#ffffff;color:#000000;border:none;padding:14px;border-radius:12px;font-weight:800;font-size:15px;cursor:pointer;transition:0.3s;}
      .aab-checkout:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(255,255,255,0.12);}
      .aab-clear{display:block;width:100%;text-align:center;background:transparent;color:#9a9a9a;border:1px solid rgba(255,255,255,0.1);padding:10px;border-radius:12px;font-weight:700;font-size:13px;cursor:pointer;margin-top:10px;transition:0.3s;font-family:inherit;}
      .aab-clear:hover{color:#ffffff;border-color:rgba(255,255,255,0.3);}
      .aab-modal{position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;opacity:0;visibility:hidden;transition:opacity 0.3s ease, visibility 0.3s ease;z-index:10000;padding:20px;}
      .aab-modal.open{opacity:1;visibility:visible;}
      .aab-modal-box{background:#0f1219;color:#eaeaea;border:1px solid rgba(255,255,255,0.1);border-radius:18px;max-width:460px;width:100%;padding:28px;box-shadow:0 24px 70px rgba(0,0,0,0.5);position:relative;max-height:85vh;overflow-y:auto;}
      .aab-modal-box h3{margin:0 0 4px;font-size:20px;font-weight:800;}
      .aab-modal-sub{font-size:13px;color:#9a9a9a;margin:0 0 16px;}
      .aab-modal-step{display:none;}
      .aab-modal-step.active{display:block;}
      .aab-modal-items{border:1px dashed rgba(255,255,255,0.25);border-radius:12px;padding:14px;margin:14px 0;}
      .aab-modal-item{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.07);font-size:14px;}
      .aab-modal-item:last-child{border-bottom:none;}
      .aab-modal-item .nm{font-weight:700;}
      .aab-modal-item .mt{display:block;font-size:12px;color:#8f8f8f;}
      .aab-modal-item .pr{font-weight:800;white-space:nowrap;}
      .aab-modal-total{display:flex;justify-content:space-between;font-size:17px;font-weight:800;padding:4px 2px;}
      .aab-modal-note{font-size:13px;line-height:1.6;color:#ffd166;background:rgba(255,209,102,0.08);border:1px solid rgba(255,209,102,0.25);padding:12px 14px;border-radius:10px;margin:12px 0;}
      .aab-modal-next,.aab-modal-done{display:block;width:100%;background:#ffffff;color:#000000;border:none;padding:14px;border-radius:12px;font-weight:800;font-size:15px;cursor:pointer;transition:0.3s;font-family:inherit;}
      .aab-modal-next:hover,.aab-modal-done:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(255,255,255,0.12);}
      .aab-modal-open{display:block;width:100%;text-align:center;background:#5865f2;color:#ffffff;border:none;padding:14px;border-radius:12px;font-weight:800;font-size:15px;cursor:pointer;text-decoration:none;margin-bottom:10px;transition:0.3s;}
      .aab-modal-open:hover{background:#4a56e0;transform:translateY(-2px);}
      .aab-modal-close{position:absolute;top:14px;right:14px;background:transparent;border:1px solid rgba(255,255,255,0.12);color:#ffffff;width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:13px;line-height:1;transition:0.3s;}
      .aab-modal-close:hover{background:rgba(255,255,255,0.08);}
      @media(max-width:768px){ .aab-icon{margin-right:10px;} }
    `;
    document.head.appendChild(style);

    const icon = document.createElement("button");
    icon.type = "button";
    icon.className = "aab-icon";
    icon.setAttribute("aria-label", "Open basket");
    icon.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="21" r="1.4"/><circle cx="19" cy="21" r="1.4"/>
        <path d="M2 3h2.2l2.6 13.2a1.6 1.6 0 0 0 1.6 1.3h9.4a1.6 1.6 0 0 0 1.6-1.3L21.5 7H6"/>
      </svg>
      <span class="aab-badge">0</span>`;

    const host = document.querySelector("header, nav");
    if (host) {
        host.insertBefore(icon, host.firstChild);
    }

    const badge = icon.querySelector(".aab-badge");

    const backdrop = document.createElement("div");
    backdrop.className = "aab-backdrop";

    const drawer = document.createElement("div");
    drawer.className = "aab-drawer";
    drawer.setAttribute("aria-label", "Basket");
    drawer.innerHTML = `
      <div class="aab-head">
        <h3>Basket</h3>
        <button type="button" class="aab-close" aria-label="Close basket">✕</button>
      </div>
      <div class="aab-body"></div>
      <div class="aab-foot">
        <div class="aab-total"><span>Total</span><span class="aab-total-value">$0.00</span></div>
        <button type="button" class="aab-checkout">Checkout</button>
        <button type="button" class="aab-clear">Clear Basket</button>
      </div>`;
    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    const body = drawer.querySelector(".aab-body");
    const totalEl = drawer.querySelector(".aab-total-value");
    const closeBtn = drawer.querySelector(".aab-close");
    const checkoutBtn = drawer.querySelector(".aab-checkout");
    const clearBtn = drawer.querySelector(".aab-clear");

    const modal = document.createElement("div");
    modal.className = "aab-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-label", "Order summary");
    modal.innerHTML = `
      <div class="aab-modal-box">
        <button type="button" class="aab-modal-close" aria-label="Close order summary">✕</button>
        <div class="aab-modal-step active" data-step="review">
          <h3>Review Your Order</h3>
          <p class="aab-modal-sub">This is your basket summary.</p>
          <div class="aab-modal-items"></div>
          <div class="aab-modal-total"><span>Total</span><span class="aab-modal-total-value"></span></div>
          <div class="aab-modal-note">Please take a screenshot or a picture of the order summary above. You will need it to confirm your order.</div>
          <button type="button" class="aab-modal-next">Next</button>
        </div>
        <div class="aab-modal-step" data-step="ticket">
          <h3>Almost There</h3>
          <p class="aab-modal-sub">Finish your order on Discord.</p>
          <div class="aab-modal-note">Join AERIALARC's Discord server and open a ticket. Send the screenshot or picture of your order so we can confirm it.</div>
          <a href="https://discord.gg/qEcN67Us" target="_blank" rel="noopener noreferrer" class="aab-modal-open">Open Discord Server</a>
          <button type="button" class="aab-modal-done">Done</button>
        </div>
      </div>`;
    document.body.appendChild(modal);

    const modalClose = modal.querySelector(".aab-modal-close");
    const reviewStep = modal.querySelector('[data-step="review"]');
    const ticketStep = modal.querySelector('[data-step="ticket"]');
    const modalItems = modal.querySelector(".aab-modal-items");
    const modalTotalValue = modal.querySelector(".aab-modal-total-value");
    const nextBtn = modal.querySelector(".aab-modal-next");
    const doneBtn = modal.querySelector(".aab-modal-done");

    function openModal() {
        modal.classList.add("open");
    }

    function closeModal() {
        modal.classList.remove("open");
    }

    function showOrderModal(items) {
        modalItems.innerHTML = "";
        items.forEach(function (it) {
            const row = document.createElement("div");
            row.className = "aab-modal-item";
            row.innerHTML = `<div><span class="nm"></span><span class="mt"></span></div><span class="pr"></span>`;
            row.querySelector(".nm").textContent = it.name;
            row.querySelector(".mt").textContent = it.meta || "";
            row.querySelector(".pr").textContent = formatPrice(it.price);
            modalItems.appendChild(row);
        });
        const total = items.reduce(function (s, it) {
            return s + (Number(it.price) || 0);
        }, 0);
        modalTotalValue.textContent = "$" + total.toFixed(2);
        reviewStep.classList.add("active");
        ticketStep.classList.remove("active");
        openModal();
    }

    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) {
        if (e.target === modal) closeModal();
    });

    nextBtn.addEventListener("click", function () {
        reviewStep.classList.remove("active");
        ticketStep.classList.add("active");
    });

    doneBtn.addEventListener("click", closeModal);

    function open() {
        drawer.classList.add("open");
        backdrop.classList.add("open");
        document.body.style.overflow = "hidden";
    }

    function close() {
        drawer.classList.remove("open");
        backdrop.classList.remove("open");
        document.body.style.overflow = "";
    }

    icon.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", close);

    function formatPrice(p) {
        return p == null ? "Price on request" : "$" + Number(p).toFixed(2);
    }

    function render() {
        const items = load();
        const count = items.length;
        badge.textContent = count;
        badge.style.display = count ? "flex" : "none";

        if (!items.length) {
            body.innerHTML = `<div class="aab-empty">Your basket is empty.<br>Add products to get started.</div>`;
            totalEl.textContent = "$0.00";
            return;
        }

        body.innerHTML = "";
        items.forEach((item, index) => {
            const row = document.createElement("div");
            row.className = "aab-item";
            row.innerHTML = `
              <div>
                <span class="aab-item-name"></span>
                <span class="aab-item-meta"></span>
                <button type="button" class="aab-remove" data-index="${index}">Remove</button>
              </div>
              <span class="aab-item-price"></span>`;
            row.querySelector(".aab-item-name").textContent = item.name;
            row.querySelector(".aab-item-meta").textContent = item.meta || "";
            row.querySelector(".aab-item-price").textContent = formatPrice(item.price);
            row.querySelector(".aab-remove").addEventListener("click", function () {
                removeAt(index);
            });
            body.appendChild(row);
        });

        const total = items.reduce(function (s, it) {
            return s + (Number(it.price) || 0);
        }, 0);
        totalEl.textContent = "$" + total.toFixed(2);
    }

    function removeAt(index) {
        const items = load();
        items.splice(index, 1);
        save(items);
        render();
    }

    clearBtn.addEventListener("click", function () {
        save([]);
        render();
    });

    checkoutBtn.addEventListener("click", function () {
        const items = load();
        if (!items.length) return;
        showOrderModal(items);
    });

    window.Basket = {
        add: function (name, price, meta) {
            const items = load();
            items.push({
                id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
                name: String(name),
                price: price == null ? null : Number(price),
                meta: meta ? String(meta) : null
            });
            save(items);
            render();
            open();
        },
        count: function () {
            return load().length;
        },
        clear: function () {
            save([]);
            render();
        }
    };

    render();
})();
