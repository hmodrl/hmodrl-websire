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
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;500;600;700;800&display=swap');
      :root{--lux-gold:#c9a84c;--lux-gold-light:#e2c97e;--lux-gold-dark:#a68a3a;--lux-bg:#08090d;--lux-surface:#0e1018;--lux-surface2:#141620;--lux-border:rgba(201,168,76,0.12);--lux-border2:rgba(201,168,76,0.06);--lux-text:#e8e6e1;--lux-text2:#8a8780;}
      .aab-icon{position:relative;display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;margin-right:14px;border:1px solid var(--lux-border);background:linear-gradient(135deg,rgba(14,16,24,0.9),rgba(20,22,32,0.9));border-radius:12px;cursor:pointer;color:var(--lux-gold);transition:all 0.3s cubic-bezier(.25,.8,.25,1);flex:0 0 auto;backdrop-filter:blur(12px);}
      .dark-mode .aab-icon{background:linear-gradient(135deg,rgba(14,16,24,0.95),rgba(20,22,32,0.95));border-color:rgba(201,168,76,0.2);color:var(--lux-gold-light);}
      .aab-icon:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(201,168,76,0.15);border-color:rgba(201,168,76,0.3);}
      .aab-icon svg{width:20px;height:20px;display:block;}
      .aab-badge{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:linear-gradient(135deg,var(--lux-gold),var(--lux-gold-dark));color:#08090d;font-size:10px;font-weight:800;display:none;align-items:center;justify-content:center;line-height:1;box-shadow:0 2px 10px rgba(201,168,76,0.4);}
      .aab-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);opacity:0;visibility:hidden;transition:opacity 0.3s ease, visibility 0.3s ease;z-index:9998;}
      .aab-backdrop.open{opacity:1;visibility:visible;}
      .aab-drawer{position:fixed;top:0;right:0;height:100vh;width:min(400px,92vw);background:var(--lux-bg);color:var(--lux-text);transform:translateX(105%);transition:transform 0.4s cubic-bezier(.25,.8,.25,1);z-index:9999;display:flex;flex-direction:column;border-left:1px solid var(--lux-border);box-shadow:-20px 0 80px rgba(0,0,0,0.6);}
      .aab-drawer.open{transform:translateX(0);}
      .aab-head{display:flex;align-items:center;justify-content:space-between;padding:24px 24px 20px;background:linear-gradient(180deg,var(--lux-surface) 0%,var(--lux-bg) 100%);border-bottom:1px solid var(--lux-border);}
      .aab-head h3{margin:0;font-family:'Playfair Display',serif;font-size:22px;font-weight:800;background:linear-gradient(135deg,var(--lux-gold-light),var(--lux-gold),var(--lux-gold-dark));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:0.5px;}
      .aab-close{background:transparent;border:1px solid var(--lux-border);color:var(--lux-gold);width:34px;height:34px;border-radius:10px;cursor:pointer;font-size:14px;line-height:1;transition:all 0.3s;display:flex;align-items:center;justify-content:center;}
      .aab-close:hover{background:rgba(201,168,76,0.08);border-color:rgba(201,168,76,0.3);transform:rotate(90deg);}
      .aab-body{flex:1;overflow-y:auto;padding:12px 24px;scrollbar-width:thin;scrollbar-color:var(--lux-gold-dark) transparent;}
      .aab-body::-webkit-scrollbar{width:4px;}
      .aab-body::-webkit-scrollbar-track{background:transparent;}
      .aab-body::-webkit-scrollbar-thumb{background:var(--lux-gold-dark);border-radius:4px;}
      .aab-empty{text-align:center;color:var(--lux-text2);padding:60px 20px;font-size:14px;line-height:1.8;}
      .aab-empty-icon{width:64px;height:64px;margin:0 auto 20px;border:2px solid var(--lux-border);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--lux-gold);opacity:0.5;}
      .aab-empty-icon svg{width:28px;height:28px;}
      .aab-item{position:relative;display:flex;justify-content:space-between;gap:14px;padding:18px 16px;margin:8px 0;background:linear-gradient(135deg,var(--lux-surface),var(--lux-surface2));border:1px solid var(--lux-border);border-radius:14px;transition:all 0.3s;}
      .aab-item:hover{border-color:rgba(201,168,76,0.2);box-shadow:0 4px 20px rgba(0,0,0,0.2);}
      .aab-item-name{font-size:14px;font-weight:700;color:var(--lux-text);letter-spacing:0.3px;}
      .aab-item-meta{display:block;font-size:12px;color:var(--lux-text2);margin-top:4px;line-height:1.5;}
      .aab-item-price{font-size:15px;font-weight:800;white-space:nowrap;background:linear-gradient(135deg,var(--lux-gold-light),var(--lux-gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
      .aab-remove{background:transparent;border:1px solid transparent;color:var(--lux-text2);cursor:pointer;font-size:11px;padding:4px 10px;margin-top:8px;font-family:inherit;border-radius:6px;transition:all 0.3s;letter-spacing:0.3px;}
      .aab-remove:hover{color:#ff6b6b;border-color:rgba(255,107,107,0.2);background:rgba(255,107,107,0.06);}
      .aab-foot{padding:20px 24px 28px;background:linear-gradient(0deg,var(--lux-surface) 0%,var(--lux-bg) 100%);border-top:1px solid var(--lux-border);position:relative;}
      .aab-foot::before{content:'';position:absolute;top:-1px;left:24px;right:24px;height:1px;background:linear-gradient(90deg,transparent,var(--lux-gold),transparent);}
      .aab-total{display:flex;justify-content:space-between;align-items:center;font-size:18px;font-weight:800;margin-bottom:16px;padding:4px 0;}
      .aab-total span:first-child{color:var(--lux-text2);font-weight:600;font-size:14px;letter-spacing:1px;text-transform:uppercase;}
      .aab-total-value{background:linear-gradient(135deg,var(--lux-gold-light),var(--lux-gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-family:'Playfair Display',serif;}
      .aab-checkout{display:block;width:100%;text-align:center;background:linear-gradient(135deg,var(--lux-gold-dark),var(--lux-gold),var(--lux-gold-light));color:#08090d;border:none;padding:15px;border-radius:12px;font-weight:800;font-size:14px;cursor:pointer;transition:all 0.3s;letter-spacing:0.8px;text-transform:uppercase;font-family:inherit;box-shadow:0 4px 20px rgba(201,168,76,0.25);}
      .aab-checkout:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(201,168,76,0.35);background:linear-gradient(135deg,var(--lux-gold),var(--lux-gold-light),var(--lux-gold));}
      .aab-clear{display:block;width:100%;text-align:center;background:transparent;color:var(--lux-text2);border:1px solid var(--lux-border);padding:11px;border-radius:12px;font-weight:600;font-size:12px;cursor:pointer;margin-top:10px;transition:all 0.3s;font-family:inherit;letter-spacing:0.5px;}
      .aab-clear:hover{color:var(--lux-gold);border-color:rgba(201,168,76,0.3);background:rgba(201,168,76,0.04);}
      .aab-modal{position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;opacity:0;visibility:hidden;transition:opacity 0.3s ease, visibility 0.3s ease;z-index:10000;padding:20px;}
      .aab-modal.open{opacity:1;visibility:visible;}
      .aab-modal-box{background:var(--lux-bg);color:var(--lux-text);border:1px solid var(--lux-border);border-radius:20px;max-width:460px;width:100%;padding:32px;box-shadow:0 32px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(201,168,76,0.05);position:relative;max-height:85vh;overflow-y:auto;}
      .aab-modal-box h3{margin:0 0 4px;font-family:'Playfair Display',serif;font-size:22px;font-weight:800;background:linear-gradient(135deg,var(--lux-gold-light),var(--lux-gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
      .aab-modal-sub{font-size:13px;color:var(--lux-text2);margin:0 0 16px;}
      .aab-modal-step{display:none;}
      .aab-modal-step.active{display:block;}
      .aab-modal-items{border:1px solid var(--lux-border);border-radius:14px;padding:16px;margin:14px 0;background:var(--lux-surface);}
      .aab-modal-item{display:flex;justify-content:space-between;gap:12px;padding:10px 4px;border-bottom:1px solid var(--lux-border2);font-size:14px;}
      .aab-modal-item:last-child{border-bottom:none;}
      .aab-modal-item .nm{font-weight:700;}
      .aab-modal-item .mt{display:block;font-size:12px;color:var(--lux-text2);margin-top:2px;}
      .aab-modal-item .pr{font-weight:800;white-space:nowrap;background:linear-gradient(135deg,var(--lux-gold-light),var(--lux-gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
      .aab-modal-total{display:flex;justify-content:space-between;font-size:18px;font-weight:800;padding:6px 4px;border-top:1px solid var(--lux-border);margin-top:4px;}
      .aab-modal-total span:last-child{background:linear-gradient(135deg,var(--lux-gold-light),var(--lux-gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-family:'Playfair Display',serif;}
      .aab-modal-note{font-size:13px;line-height:1.7;color:var(--lux-gold);background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.15);padding:14px 16px;border-radius:12px;margin:16px 0;}
      .aab-modal-next,.aab-modal-done{display:block;width:100%;background:linear-gradient(135deg,var(--lux-gold-dark),var(--lux-gold),var(--lux-gold-light));color:#08090d;border:none;padding:15px;border-radius:12px;font-weight:800;font-size:14px;cursor:pointer;transition:all 0.3s;font-family:inherit;letter-spacing:0.8px;text-transform:uppercase;box-shadow:0 4px 20px rgba(201,168,76,0.25);}
      .aab-modal-next:hover,.aab-modal-done:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(201,168,76,0.35);}
      .aab-modal-open{display:block;width:100%;text-align:center;background:linear-gradient(135deg,#5865f2,#7289da);color:#ffffff;border:none;padding:15px;border-radius:12px;font-weight:800;font-size:14px;cursor:pointer;text-decoration:none;margin-bottom:12px;transition:all 0.3s;letter-spacing:0.5px;box-shadow:0 4px 20px rgba(88,101,242,0.25);}
      .aab-modal-open:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(88,101,242,0.4);background:linear-gradient(135deg,#4a56e0,#5865f2);}
      .aab-modal-close{position:absolute;top:16px;right:16px;background:transparent;border:1px solid var(--lux-border);color:var(--lux-gold);width:32px;height:32px;border-radius:10px;cursor:pointer;font-size:13px;line-height:1;transition:all 0.3s;display:flex;align-items:center;justify-content:center;}
      .aab-modal-close:hover{background:rgba(201,168,76,0.08);border-color:rgba(201,168,76,0.3);transform:rotate(90deg);}
      @media(max-width:768px){ .aab-icon{margin-right:10px;} .aab-drawer{width:min(100vw,92vw);} }
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
        <h3>Your Cart</h3>
        <button type="button" class="aab-close" aria-label="Close basket">&#10005;</button>
      </div>
      <div class="aab-body"></div>
      <div class="aab-foot">
        <div class="aab-total"><span>Total</span><span class="aab-total-value">$0.00</span></div>
        <button type="button" class="aab-checkout">Proceed to Checkout</button>
        <button type="button" class="aab-clear">Clear Cart</button>
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
        <button type="button" class="aab-modal-close" aria-label="Close order summary">&#10005;</button>
        <div class="aab-modal-step active" data-step="review">
          <h3>Order Summary</h3>
          <p class="aab-modal-sub">Review your selections before proceeding.</p>
          <div class="aab-modal-items"></div>
          <div class="aab-modal-total"><span>Total</span><span class="aab-modal-total-value"></span></div>
          <div class="aab-modal-note">Please take a screenshot of your order summary. You will need it to confirm your order on Discord.</div>
          <button type="button" class="aab-modal-next">Continue</button>
        </div>
        <div class="aab-modal-step" data-step="ticket">
          <h3>Final Step</h3>
          <p class="aab-modal-sub">Complete your order on Discord.</p>
          <div class="aab-modal-note">Join AERIALARC's Discord server and open a ticket. Send your order screenshot so we can confirm and begin your boost.</div>
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
            body.innerHTML = `<div class="aab-empty"><div class="aab-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></div>Your cart is empty.<br><span style="color:var(--lux-text2);font-size:13px;">Browse our services and add items to get started.</span></div>`;
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
