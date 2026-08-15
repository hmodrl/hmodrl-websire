(function () {
    var KEY = "aerialarc_basket";

    function load() {
        try {
            var raw = localStorage.getItem(KEY);
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

    var style = document.createElement("style");
    style.textContent = `
      .aab-icon{position:relative;display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;margin-right:14px;border:none;background:rgba(0,0,0,0.04);border-radius:12px;cursor:pointer;color:#1a1a1a;transition:all 0.4s cubic-bezier(.25,.8,.25,1);flex:0 0 auto;text-decoration:none;}
      .dark-mode .aab-icon{background:rgba(255,255,255,0.06);color:#f0f0f0;}
      .aab-icon:hover{transform:translateY(-2px) scale(1.05);box-shadow:0 8px 24px rgba(0,0,0,0.1);}
      .dark-mode .aab-icon:hover{box-shadow:0 8px 24px rgba(0,0,0,0.3);}
      .aab-icon svg{width:20px;height:20px;display:block;transition:transform 0.3s ease;}
      .aab-icon:hover svg{transform:scale(1.1);}
      .aab-badge{position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:#1a1a1a;color:#fff;font-size:10px;font-weight:700;display:none;align-items:center;justify-content:center;line-height:1;transition:transform 0.3s cubic-bezier(.34,1.56,.64,1);pointer-events:none;}
      .dark-mode .aab-badge{background:#fff;color:#111;}
    `;
    document.head.appendChild(style);

    var icon = document.createElement("a");
    icon.href = "basket.html";
    icon.className = "aab-icon";
    icon.setAttribute("aria-label", "Open basket");
    icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg><span class="aab-badge">0</span>';

    var host = document.querySelector("header, nav");
    if (host) {
        host.insertBefore(icon, host.firstChild);
    }

    var badge = icon.querySelector(".aab-badge");

    function updateBadge() {
        var count = load().length;
        badge.textContent = count;
        badge.style.display = count ? "flex" : "none";
    }

    updateBadge();

    window.Basket = {
        add: function (name, price, meta) {
            var items = load();
            items.push({
                id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
                name: String(name),
                price: price == null ? null : Number(price),
                meta: meta ? String(meta) : null
            });
            save(items);
            updateBadge();
        },
        count: function () {
            return load().length;
        },
        clear: function () {
            save([]);
            updateBadge();
        }
    };
})();
