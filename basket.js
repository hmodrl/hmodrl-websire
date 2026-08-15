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
      .aab-icon{position:relative;display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;margin-right:14px;border:none;background:rgba(0,0,0,0.04);border-radius:12px;cursor:pointer;color:#1a1a1a;transition:all 0.4s cubic-bezier(.25,.8,.25,1);flex:0 0 auto;}
      .dark-mode .aab-icon{background:rgba(255,255,255,0.06);color:#f0f0f0;}
      .aab-icon:hover{transform:translateY(-2px) scale(1.05);box-shadow:0 8px 24px rgba(0,0,0,0.1);}
      .dark-mode .aab-icon:hover{box-shadow:0 8px 24px rgba(0,0,0,0.3);}
      .aab-icon svg{width:20px;height:20px;display:block;transition:transform 0.3s ease;}
      .aab-icon:hover svg{transform:scale(1.1);}
      .aab-badge{position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:#1a1a1a;color:#fff;font-size:10px;font-weight:700;display:none;align-items:center;justify-content:center;line-height:1;transition:transform 0.3s cubic-bezier(.34,1.56,.64,1);}
      .dark-mode .aab-badge{background:#fff;color:#111;}
      .aab-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0);backdrop-filter:blur(0px);opacity:0;visibility:hidden;transition:all 0.4s cubic-bezier(.25,.8,.25,1);z-index:9998;}
      .aab-backdrop.open{background:rgba(0,0,0,0.4);backdrop-filter:blur(8px);opacity:1;visibility:visible;}
      .aab-drawer{position:fixed;top:0;right:0;height:100vh;width:min(420px,92vw);background:#ffffff;color:#1a1a1a;transform:translateX(100%);transition:transform 0.5s cubic-bezier(.25,.8,.25,1);z-index:9999;display:flex;flex-direction:column;box-shadow:-8px 0 40px rgba(0,0,0,0.08);}
      .dark-mode .aab-drawer{background:#0f0f0f;color:#e8e8e8;box-shadow:-8px 0 40px rgba(0,0,0,0.4);}
      .aab-drawer.open{transform:translateX(0);}
      .aab-head{display:flex;align-items:center;justify-content:space-between;padding:32px 32px 28px;}
      .aab-head h3{margin:0;font-size:26px;font-weight:800;letter-spacing:-0.5px;}
      .aab-close{background:rgba(0,0,0,0.04);border:none;color:#999;width:36px;height:36px;border-radius:10px;cursor:pointer;font-size:16px;line-height:1;transition:all 0.3s cubic-bezier(.25,.8,.25,1);display:flex;align-items:center;justify-content:center;}
      .dark-mode .aab-close{background:rgba(255,255,255,0.06);color:#666;}
      .aab-close:hover{background:rgba(0,0,0,0.08);color:#1a1a1a;transform:rotate(90deg) scale(1.1);}
      .dark-mode .aab-close:hover{background:rgba(255,255,255,0.1);color:#fff;}
      .aab-body{flex:1;overflow-y:auto;padding:8px 32px 24px;scroll-behavior:smooth;scrollbar-width:thin;scrollbar-color:rgba(0,0,0,0.15) transparent;}
      .dark-mode .aab-body{scrollbar-color:rgba(255,255,255,0.15) transparent;}
      .aab-body::-webkit-scrollbar{width:5px;}
      .aab-body::-webkit-scrollbar-track{background:transparent;}
      .aab-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.12);border-radius:5px;}
      .dark-mode .aab-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);}
      .aab-empty{text-align:center;color:#999;padding:80px 24px;font-size:14px;line-height:1.8;}
      .aab-empty-icon{width:72px;height:72px;margin:0 auto 24px;border:2px solid rgba(0,0,0,0.08);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#ccc;transition:all 0.5s cubic-bezier(.25,.8,.25,1);}
      .dark-mode .aab-empty-icon{border-color:rgba(255,255,255,0.08);color:#444;}
      .aab-empty-icon svg{width:30px;height:30px;}
      .aab-item{position:relative;display:flex;justify-content:space-between;align-items:flex-start;gap:20px;padding:24px;margin:10px 0;background:rgba(0,0,0,0.02);border-radius:16px;transition:all 0.4s cubic-bezier(.25,.8,.25,1);animation:aab-item-in 0.4s cubic-bezier(.25,.8,.25,1) backwards;}
      .dark-mode .aab-item{background:rgba(255,255,255,0.03);}
      .aab-item:hover{background:rgba(0,0,0,0.04);transform:translateX(-4px);}
      .dark-mode .aab-item:hover{background:rgba(255,255,255,0.05);}
      @keyframes aab-item-in{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
      .aab-item-info{flex:1;min-width:0;}
      .aab-item-name{font-size:15px;font-weight:700;letter-spacing:-0.2px;line-height:1.3;}
      .aab-item-meta{display:block;font-size:13px;color:#888;margin-top:6px;line-height:1.5;}
      .dark-mode .aab-item-meta{color:#666;}
      .aab-item-right{display:flex;flex-direction:column;align-items:flex-end;gap:12px;flex-shrink:0;}
      .aab-item-price{font-size:16px;font-weight:700;letter-spacing:-0.3px;}
      .aab-remove{background:transparent;border:none;color:#bbb;cursor:pointer;font-size:12px;padding:6px 12px;font-family:inherit;border-radius:8px;transition:all 0.3s ease;letter-spacing:0.2px;font-weight:500;}
      .dark-mode .aab-remove{color:#555;}
      .aab-remove:hover{color:#e74c3c;background:rgba(231,76,60,0.06);}
      .aab-foot{padding:24px 32px 36px;border-top:1px solid rgba(0,0,0,0.06);}
      .dark-mode .aab-foot{border-color:rgba(255,255,255,0.06);}
      .aab-total{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding:0;}
      .aab-total span:first-child{color:#999;font-weight:600;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;}
      .dark-mode .aab-total span:first-child{color:#666;}
      .aab-total-value{font-size:22px;font-weight:800;letter-spacing:-0.5px;}
      .aab-checkout{display:block;width:100%;text-align:center;background:#1a1a1a;color:#ffffff;border:none;padding:18px;border-radius:14px;font-weight:700;font-size:15px;cursor:pointer;transition:all 0.4s cubic-bezier(.25,.8,.25,1);font-family:inherit;letter-spacing:0.3px;box-shadow:0 4px 16px rgba(0,0,0,0.12);}
      .dark-mode .aab-checkout{background:#fff;color:#111;box-shadow:0 4px 16px rgba(255,255,255,0.08);}
      .aab-checkout:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(0,0,0,0.18);}
      .dark-mode .aab-checkout:hover{box-shadow:0 8px 28px rgba(255,255,255,0.12);}
      .aab-checkout:active{transform:translateY(-1px) scale(0.98);}
      .aab-clear{display:block;width:100%;text-align:center;background:transparent;color:#bbb;border:1px solid rgba(0,0,0,0.08);padding:14px;border-radius:14px;font-weight:600;font-size:13px;cursor:pointer;margin-top:12px;transition:all 0.3s ease;font-family:inherit;letter-spacing:0.2px;}
      .dark-mode .aab-clear{color:#555;border-color:rgba(255,255,255,0.08);}
      .aab-clear:hover{color:#1a1a1a;border-color:rgba(0,0,0,0.15);background:rgba(0,0,0,0.02);}
      .dark-mode .aab-clear:hover{color:#fff;border-color:rgba(255,255,255,0.15);background:rgba(255,255,255,0.03);}
      .aab-modal{position:fixed;inset:0;background:rgba(0,0,0,0);backdrop-filter:blur(0px);display:flex;align-items:center;justify-content:center;opacity:0;visibility:hidden;transition:all 0.4s cubic-bezier(.25,.8,.25,1);z-index:10000;padding:20px;}
      .aab-modal.open{background:rgba(0,0,0,0.5);backdrop-filter:blur(12px);opacity:1;visibility:visible;}
      .aab-modal-box{background:#ffffff;color:#1a1a1a;border:none;border-radius:24px;max-width:480px;width:100%;padding:40px;box-shadow:0 32px 80px rgba(0,0,0,0.12);position:relative;max-height:85vh;overflow-y:auto;transform:translateY(20px) scale(0.96);transition:all 0.4s cubic-bezier(.25,.8,.25,1);}
      .aab-modal.open .aab-modal-box{transform:translateY(0) scale(1);}
      .dark-mode .aab-modal-box{background:#1a1a1a;color:#e8e8e8;box-shadow:0 32px 80px rgba(0,0,0,0.5);}
      .aab-modal-box h3{margin:0 0 6px;font-size:24px;font-weight:800;letter-spacing:-0.5px;}
      .aab-modal-sub{font-size:14px;color:#888;margin:0 0 20px;line-height:1.5;}
      .dark-mode .aab-modal-sub{color:#666;}
      .aab-modal-step{display:none;}
      .aab-modal-step.active{display:block;animation:aab-step-in 0.4s cubic-bezier(.25,.8,.25,1);}
      @keyframes aab-step-in{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
      .aab-modal-items{border:1px solid rgba(0,0,0,0.06);border-radius:16px;padding:20px;margin:16px 0;background:rgba(0,0,0,0.02);}
      .dark-mode .aab-modal-items{border-color:rgba(255,255,255,0.06);background:rgba(255,255,255,0.03);}
      .aab-modal-item{display:flex;justify-content:space-between;gap:16px;padding:12px 4px;border-bottom:1px solid rgba(0,0,0,0.04);font-size:14px;}
      .dark-mode .aab-modal-item{border-color:rgba(255,255,255,0.04);}
      .aab-modal-item:last-child{border-bottom:none;padding-bottom:4px;}
      .aab-modal-item .nm{font-weight:700;}
      .aab-modal-item .mt{display:block;font-size:12px;color:#999;margin-top:3px;line-height:1.4;}
      .dark-mode .aab-modal-item .mt{color:#666;}
      .aab-modal-item .pr{font-weight:700;white-space:nowrap;font-size:15px;}
      .aab-modal-total{display:flex;justify-content:space-between;font-size:20px;font-weight:800;padding:8px 4px;border-top:1px solid rgba(0,0,0,0.06);margin-top:6px;}
      .dark-mode .aab-modal-total{border-color:rgba(255,255,255,0.06);}
      .aab-modal-note{font-size:13px;line-height:1.7;color:#666;background:rgba(0,0,0,0.02);border:1px solid rgba(0,0,0,0.04);padding:16px 18px;border-radius:14px;margin:18px 0;}
      .dark-mode .aab-modal-note{color:#888;background:rgba(255,255,255,0.02);border-color:rgba(255,255,255,0.04);}
      .aab-modal-next,.aab-modal-done{display:block;width:100%;background:#1a1a1a;color:#fff;border:none;padding:18px;border-radius:14px;font-weight:700;font-size:15px;cursor:pointer;transition:all 0.4s cubic-bezier(.25,.8,.25,1);font-family:inherit;letter-spacing:0.3px;}
      .dark-mode .aab-modal-next,.dark-mode .aab-modal-done{background:#fff;color:#111;}
      .aab-modal-next:hover,.aab-modal-done:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(0,0,0,0.15);}
      .aab-modal-next:active,.aab-modal-done:active{transform:translateY(-1px) scale(0.98);}
      .aab-modal-open{display:block;width:100%;text-align:center;background:#5865f2;color:#ffffff;border:none;padding:18px;border-radius:14px;font-weight:700;font-size:15px;cursor:pointer;text-decoration:none;margin-bottom:14px;transition:all 0.4s cubic-bezier(.25,.8,.25,1);box-shadow:0 4px 16px rgba(88,101,242,0.2);}
      .aab-modal-open:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(88,101,242,0.3);background:#4a56e0;}
      .aab-modal-close{position:absolute;top:16px;right:16px;background:rgba(0,0,0,0.04);border:none;color:#999;width:36px;height:36px;border-radius:10px;cursor:pointer;font-size:15px;line-height:1;transition:all 0.3s cubic-bezier(.25,.8,.25,1);display:flex;align-items:center;justify-content:center;}
      .dark-mode .aab-modal-close{background:rgba(255,255,255,0.06);color:#666;}
      .aab-modal-close:hover{background:rgba(0,0,0,0.08);color:#1a1a1a;transform:rotate(90deg) scale(1.1);}
      .dark-mode .aab-modal-close:hover{background:rgba(255,255,255,0.1);color:#fff;}
      @media(max-width:768px){ .aab-icon{margin-right:10px;} .aab-drawer{width:min(100vw,92vw);} .aab-head{padding:24px;} .aab-body{padding:8px 24px 20px;} .aab-foot{padding:20px 24px 30px;} }
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
            body.innerHTML = `<div class="aab-empty"><div class="aab-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg></div>Your cart is empty<br><span style="color:#bbb;font-size:13px;margin-top:4px;display:block;">Add services to get started</span></div>`;
            totalEl.textContent = "$0.00";
            return;
        }

        body.innerHTML = "";
        items.forEach((item, index) => {
            const row = document.createElement("div");
            row.className = "aab-item";
            row.style.animationDelay = (index * 0.06) + "s";
            row.innerHTML = `
              <div class="aab-item-info">
                <span class="aab-item-name"></span>
                <span class="aab-item-meta"></span>
              </div>
              <div class="aab-item-right">
                <span class="aab-item-price"></span>
                <button type="button" class="aab-remove" data-index="${index}">Remove</button>
              </div>`;
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
