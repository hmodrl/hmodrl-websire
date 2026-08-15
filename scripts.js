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
