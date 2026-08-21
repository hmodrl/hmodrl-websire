// Dark mode theme toggle
(function () {
    const lightBtn = document.getElementById('lightModeBtn');
    const darkBtn = document.getElementById('darkModeBtn');
    const logoImg = document.querySelector('.logo img');
    if (!lightBtn || !darkBtn) return;
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            darkBtn.classList.add('active');
            lightBtn.classList.remove('active');
            if (logoImg) {
                logoImg.style.opacity = 0;
                setTimeout(() => {
                    logoImg.src = 'aerialarc2.png';
                    logoImg.style.opacity = 1;
                }, 180);
            }
        } else {
            document.body.classList.remove('dark-mode');
            lightBtn.classList.add('active');
            darkBtn.classList.remove('active');
            if (logoImg) {
                logoImg.style.opacity = 0;
                setTimeout(() => {
                    logoImg.src = 'aerialarc.png';
                    logoImg.style.opacity = 1;
                }, 180);
            }
        }
        try { localStorage.setItem('theme', theme); } catch (e) {}
    }
    lightBtn.addEventListener('click', () => applyTheme('light'));
    darkBtn.addEventListener('click', () => applyTheme('dark'));
    const saved = localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(saved);
})();

// Currency selector + price updater
(() => {
    const RATES = { USD: 1, BHD: 0.37625, SAR: 3.7625 };
    let current = 'USD';

    const toggle = document.getElementById('currencyToggle');
    const dropdown = document.getElementById('currencyDropdown');
    const options = document.querySelectorAll('.currency-option');
    if (!toggle || !dropdown) return;

    function formatPrice(usdValue, currency) {
        const val = (usdValue * (RATES[currency] || 1));
        if (currency === 'USD') return `$${val.toFixed(2)}`;
        if (currency === 'BHD') return `${val.toFixed(2)} BHD`;
        if (currency === 'SAR') return `${val.toFixed(2)} SAR`;
        return `${val.toFixed(2)}`;
    }

    window.aaFormatPrice = function (usd) { return formatPrice(usd, current); };

    window.aaUpdatePrice = function (el, usd, naText) {
        if (usd == null) {
            el.dataset.usd = '';
            const s = el.querySelector('.price-amount');
            const t = naText || '-';
            if (s) { s.textContent = t; } else { el.textContent = t; }
            return;
        }
        el.dataset.usd = usd;
        const s = el.querySelector('.price-amount');
        if (s) { s.textContent = formatPrice(usd, current); } else { el.textContent = formatPrice(usd, current); }
    };

    function updatePrices() {
        document.querySelectorAll('[data-usd]').forEach(el => {
            const usd = parseFloat(el.getAttribute('data-usd'));
            if (isNaN(usd)) return;
            const span = el.querySelector('.price-amount');
            if (span) { span.textContent = formatPrice(usd, current); } else { el.textContent = formatPrice(usd, current); }
        });
        if (toggle) {
            const label = (c) => {
                if (c === 'USD') return `<img src="usa.webp" class="flag" alt="US"> USD`;
                if (c === 'BHD') return `<img src="bh.svg" class="flag" alt="BHD"> BHD`;
                return `<img src="sa.png" class="flag" alt="SAR"> SAR`;
            };
            toggle.innerHTML = label(current);
        }
    }

    updatePrices();

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
    });

    options.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const c = btn.getAttribute('data-currency');
            if (c) { current = c; }
            dropdown.classList.remove('open');
            updatePrices();
        });
    });

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && e.target !== toggle) {
            dropdown.classList.remove('open');
        }
    });
})();

// User icon / login state
(() => {
    const loginLink = document.querySelector('.login-link');
    if (!loginLink) return;

    const user = localStorage.getItem('aerialarc_current_user');
    if (!user) return;

    const short = user.length > 16 ? user.substring(0, 14) + '...' : user;
    const initial = (user[0] || '?').toUpperCase();

    const wrapper = document.createElement('div');
    wrapper.className = 'user-menu';
    wrapper.innerHTML = `
        <button class="user-avatar" title="${user}">
            <span class="user-initial">${initial}</span>
        </button>
        <div class="user-dropdown">
            <div class="user-email">${short}</div>
            <button class="user-logout">Log Out</button>
        </div>
    `;

    loginLink.replaceWith(wrapper);

    const avatar = wrapper.querySelector('.user-avatar');
    const dd = wrapper.querySelector('.user-dropdown');
    const logoutBtn = wrapper.querySelector('.user-logout');

    avatar.addEventListener('click', (e) => {
        e.stopPropagation();
        dd.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) dd.classList.remove('open');
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('aerialarc_current_user');
        localStorage.removeItem('aerialarc_login_method');
        window.location.reload();
    });

    // Inject user menu styles once
    if (!document.getElementById('userMenuStyles')) {
        const st = document.createElement('style');
        st.id = 'userMenuStyles';
        st.textContent = `
            .user-menu{position:relative;}
            .user-avatar{
                width:36px;height:36px;border-radius:10px;border:1.5px solid rgba(168,85,247,0.4);
                background:linear-gradient(135deg,#a855f7,#7c3aed);color:#fff;
                font-size:14px;font-weight:700;cursor:pointer;
                display:flex;align-items:center;justify-content:center;
                transition:all 0.3s;
            }
            .user-avatar:hover{transform:scale(1.08);box-shadow:0 4px 16px rgba(168,85,247,0.3);}
            .user-initial{pointer-events:none;}
            .user-dropdown{
                position:absolute;top:calc(100% + 8px);right:0;min-width:180px;
                background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);border-radius:12px;
                padding:8px;opacity:0;visibility:hidden;transform:translateY(-6px);
                transition:all 0.25s cubic-bezier(.25,.8,.25,1);z-index:200;
                box-shadow:0 12px 32px rgba(0,0,0,0.3);
            }
            body:not(.dark-mode) .user-dropdown{background:#fff;border-color:rgba(0,0,0,0.08);box-shadow:0 12px 32px rgba(0,0,0,0.1);}
            .user-dropdown.open{opacity:1;visibility:visible;transform:translateY(0);}
            .user-email{
                padding:8px 12px;font-size:12px;color:#aaa;word-break:break-all;
                border-bottom:1px solid rgba(255,255,255,0.06);margin-bottom:4px;
            }
            body:not(.dark-mode) .user-email{color:#666;border-color:rgba(0,0,0,0.06);}
            .user-logout{
                display:block;width:100%;padding:8px 12px;border:none;border-radius:8px;
                background:transparent;color:#ef4444;font-size:13px;font-weight:600;
                cursor:pointer;text-align:left;transition:background 0.2s;font-family:inherit;
            }
            .user-logout:hover{background:rgba(239,68,68,0.1);}
            body:not(.dark-mode) .user-logout:hover{background:rgba(239,68,68,0.06);}
        `;
        document.head.appendChild(st);
    }
})();
