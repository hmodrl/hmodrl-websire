// Extracted from index.html <script> block
// Preserve DOMContentLoaded dependencies; this file should be included with `defer` or at end of body.

(function () {
  'use strict';

  // Helper: safe query
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* -----------------------------
     AI Chat System & Utilities
     ----------------------------- */

  const aiState = {
    active: false,
    listening: false,
    color: '#D4AF37',
    theme: 'light',
  };

  // Init AI Chat: create elements, bind events
  function initAI() {
    const widget = document.querySelector('.ai-chat-widget');
    if (!widget) return;

    const btn = widget.querySelector('.ai-chat-button');
    const container = widget.querySelector('.ai-chat-container');
    const sendBtn = widget.querySelector('.ai-chat-send');
    const input = widget.querySelector('.ai-chat-input');
    const messages = widget.querySelector('.ai-chat-messages');
    const status = widget.querySelector('.ai-status-indicator');

    function toggleChat() {
      aiState.active = !aiState.active;
      btn.classList.toggle('active', aiState.active);
      container.classList.toggle('active', aiState.active);
      if (aiState.active) {
        input.focus();
      }
    }

    btn.addEventListener('click', toggleChat);
    sendBtn.addEventListener('click', () => {
      const text = input.value.trim();
      if (!text) return;
      addUserMessage(text);
      input.value = '';
      processMessage(text);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
      }
    });

    // Quick suggestion buttons
    widget.querySelectorAll('.ai-suggestion-btn').forEach(b => {
      b.addEventListener('click', () => {
        const cmd = b.dataset.cmd || b.textContent.trim();
        addUserMessage(cmd);
        processMessage(cmd);
      });
    });

    function addUserMessage(text) {
      const m = document.createElement('div');
      m.className = 'ai-message user';
      const bubble = document.createElement('div');
      bubble.className = 'message-bubble';
      bubble.textContent = text;
      m.appendChild(bubble);
      messages.appendChild(m);
      messages.scrollTop = messages.scrollHeight;
    }

    function addBotMessage(html) {
      const m = document.createElement('div');
      m.className = 'ai-message bot';
      const bubble = document.createElement('div');
      bubble.className = 'message-bubble';
      bubble.innerHTML = html;
      m.appendChild(bubble);
      messages.appendChild(m);
      messages.scrollTop = messages.scrollHeight;
    }

    function processMessage(text) {
      // very small parser for commands like /price, /help
      const trimmed = text.trim();
      if (!trimmed) return;

      if (trimmed.startsWith('/')) {
        // command handling
        const parts = trimmed.slice(1).split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);
        handleCommand(cmd, args);
        return;
      }

      // default: echo and simple assistance
      addBotMessage('<strong>Assistant:</strong> Thanks — I\'ll look into that for you. Try <em>/help</em> for all commands.');
    }

    function handleCommand(cmd, args) {
      switch (cmd) {
        case 'help':
          addBotMessage('<strong>Commands:</strong><ul><li><code>/price</code> - show price table</li><li><code>/contact</code> - contact info</li></ul>');
          break;
        case 'price':
          addBotMessage('<strong>Price Guide:</strong><p>Visit our <a href="RLboostingRank.html">boosting ranks</a> page for full detail.</p>');
          break;
        case 'contact':
          addBotMessage('<strong>Contact:</strong><p>WhatsApp: +1 234 567 890<br>Email: support@example.com</p>');
          break;
        default:
          addBotMessage('<strong>Assistant:</strong> I\'m not sure about that command. Try <code>/help</code>.');
      }
    }
  }

  /* -----------------------------
     Shopping Basket Logic
     ----------------------------- */

  const BASKET_KEY = 'rlAccountBasket';

  function loadBasket() {
    try {
      const raw = localStorage.getItem(BASKET_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to load basket', e);
      return [];
    }
  }

  function saveBasket(items) {
    try {
      localStorage.setItem(BASKET_KEY, JSON.stringify(items));
      updateBasketCount(items.length);
    } catch (e) {
      console.error('Failed to save basket', e);
    }
  }

  function updateBasketCount(count) {
    const el = document.querySelector('.basket-count');
    if (!el) return;
    if (count > 0) {
      el.textContent = String(count);
      el.classList.remove('hidden');
    } else {
      el.textContent = '0';
      el.classList.add('hidden');
    }
  }

  function renderBasket() {
    const items = loadBasket();
    const list = document.querySelector('.basket-items');
    const empty = document.querySelector('.basket-empty');
    if (!list) return;
    list.innerHTML = '';
    if (items.length === 0) {
      if (empty) empty.style.display = 'block';
      return;
    }
    if (empty) empty.style.display = 'none';
    items.forEach((it, idx) => {
      const node = document.createElement('div');
      node.className = 'basket-item';
      node.innerHTML = `
        <div class="basket-item-details">
          <div class="basket-item-name">${escapeHtml(it.title || 'Item')}</div>
          <div class="basket-item-platform">${escapeHtml(it.platform || '')}</div>
          <div class="basket-item-price">${escapeHtml(it.price || '')}</div>
        </div>
        <button class="basket-item-remove" data-index="${idx}">&times;</button>
      `;
      list.appendChild(node);
    });

    // remove handlers
    list.querySelectorAll('.basket-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.index);
        const items = loadBasket();
        items.splice(idx, 1);
        saveBasket(items);
        renderBasket();
      });
    });
  }

  function addToBasket(item) {
    const items = loadBasket();
    items.push(item);
    saveBasket(items);
    renderBasket();
  }

  function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* -----------------------------
     Basket UI toggles
     ----------------------------- */

  function bindBasketUI() {
    const openBtn = document.querySelector('.basket-btn');
    const panel = document.querySelector('.basket-panel');
    const overlay = document.querySelector('.basket-overlay');
    const closeBtn = document.querySelector('.basket-close-btn');

    if (!openBtn || !panel) return;

    openBtn.addEventListener('click', () => {
      panel.classList.add('active');
      if (overlay) overlay.classList.add('active');
      document.body.classList.add('no-scroll');
    });

    function close() {
      panel.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      document.body.classList.remove('no-scroll');
    }

    if (overlay) overlay.addEventListener('click', close);
    if (closeBtn) closeBtn.addEventListener('click', close);

    // checkout button
    const checkout = document.querySelector('.basket-checkout-btn');
    if (checkout) {
      checkout.addEventListener('click', () => {
        const items = loadBasket();
        if (items.length === 0) return alert('Your basket is empty.');
        // persist to session for checkout flow
        sessionStorage.setItem('checkoutItems', JSON.stringify(items));
        window.location.href = 'receipt.html';
      });
    }
  }

  /* -----------------------------
     Site Initialization
     ----------------------------- */

  function initSite() {
    // init UI pieces
    initAI();
    bindBasketUI();
    renderBasket();

    // bind add-to-basket buttons (data attrs expected)
    $$('.add-to-basket').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = {
          title: btn.dataset.title || btn.getAttribute('data-title') || 'Unknown',
          price: btn.dataset.price || btn.getAttribute('data-price') || '0',
          platform: btn.dataset.platform || btn.getAttribute('data-platform') || ''
        };
        addToBasket(item);
      });
    });

    // update basket count initial
    updateBasketCount(loadBasket().length);

    // back-to-top button
    const back = document.querySelector('.back-to-top');
    if (back) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 400) back.classList.add('visible'); else back.classList.remove('visible');
      });
      back.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({top:0, behavior:'smooth'}); });
    }
  }

  // ensure initialization after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSite);
  } else {
    initSite();
  }

})();

/* Appended from receipt.html: populate receipt fields and save order to admin panel */
(function(){
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    // Only run on pages that have the receipt markup
    if (!document.getElementById('buyerName')) return;

    const paymentDetailsJSON = sessionStorage.getItem('paymentDetails');
    if (!paymentDetailsJSON) {
      alert('No payment details found. Redirecting to home page.');
      window.location.href = 'index.html';
      return;
    }

    try {
      const details = JSON.parse(paymentDetailsJSON);

      document.getElementById('buyerName').textContent = `${details.firstName} ${details.lastName}`;
      document.getElementById('orderNumber').textContent = details.orderId;

      const serviceName = details.orderDetails.service || details.orderDetails.item || 'AERIALARC Purchase';
      document.getElementById('serviceName').textContent = serviceName;

      if (details.orderDetails.platform && details.orderDetails.platform !== '-') {
        const platformRow = document.getElementById('platformRow');
        const platformValue = document.getElementById('platformValue');
        if (platformRow && platformValue) {
          platformRow.style.display = 'flex';
          platformValue.textContent = details.orderDetails.platform;
        }
      }

      document.getElementById('basePrice').textContent = details.orderDetails.basePrice || '$0.00';

      if (details.orderDetails.platformFee && details.orderDetails.platformFee !== '-' && details.orderDetails.platformFee !== '$0.00') {
        const row = document.getElementById('platformFeeRow');
        if (row) { row.style.display = 'flex'; document.getElementById('platformFee').textContent = details.orderDetails.platformFee; }
      }

      if (details.orderDetails.paymentFee && details.orderDetails.paymentFee !== '-' && details.orderDetails.paymentFee !== '$0.00') {
        const row = document.getElementById('paymentFeeRow');
        if (row) { row.style.display = 'flex'; document.getElementById('paymentFee').textContent = details.orderDetails.paymentFee; }
      }

      if (details.orderDetails.discount && details.orderDetails.discount !== '-') {
        const row = document.getElementById('discountRow');
        if (row) { row.style.display = 'flex'; document.getElementById('discount').textContent = details.orderDetails.discount; }
      }

      document.getElementById('totalAmount').textContent = details.amount;

      const paymentMethodMap = { creditCard: 'Credit/Debit Card', paypal: 'PayPal', playstationCard: 'PlayStation Gift Card', benefitPay: 'Benefit Pay', unknown: 'N/A' };
      document.getElementById('paymentMethod').textContent = paymentMethodMap[details.paymentMethod] || details.paymentMethod;

      const date = new Date(details.timestamp);
      const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
      const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      document.getElementById('purchaseDate').textContent = `${formattedDate} • ${formattedTime}`;

      document.getElementById('whatsappNumber').textContent = details.whatsapp;

      if (serviceName.toLowerCase().includes('account')) document.getElementById('deliveryMessage').textContent = 'Account details will be sent via WhatsApp.';
      else if (serviceName.toLowerCase().includes('boosting')) document.getElementById('deliveryMessage').textContent = 'Our team will contact you via WhatsApp to begin your boost.';
      else if (serviceName.toLowerCase().includes('tournament')) document.getElementById('deliveryMessage').textContent = 'Our team will contact you via WhatsApp to schedule your tournament.';
      else if (serviceName.toLowerCase().includes('nitromod')) document.getElementById('deliveryMessage').textContent = 'Download link will be sent via WhatsApp.';
      else document.getElementById('deliveryMessage').textContent = 'You will be contacted via WhatsApp.';

      // Save order to admin list
      saveOrderToAdmin(details, serviceName);

    } catch (err) {
      console.error('Error parsing payment details:', err);
      alert('Error loading receipt. Redirecting to home page.');
      window.location.href = 'index.html';
    }
  });

  function saveOrderToAdmin(details, serviceName) {
    try {
      let orders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
      const existingIndex = orders.findIndex(o => o.orderId === details.orderId);
      if (existingIndex !== -1) return;

      const date = new Date(details.timestamp);
      const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });

      const fileData = sessionStorage.getItem('uploadedFileData');
      const fileName = sessionStorage.getItem('uploadedFileName');

      const order = {
        orderId: details.orderId,
        buyerName: `${details.firstName} ${details.lastName}`,
        service: serviceName,
        whatsappNumber: details.whatsapp,
        totalAmount: details.amount,
        basePrice: details.orderDetails.basePrice || '$0.00',
        platformFee: details.orderDetails.platformFee,
        discount: details.orderDetails.discount,
        paymentMethod: details.paymentMethod,
        purchaseDateTime: formattedDate,
        timestamp: details.timestamp,
        status: 'pending',
        fileName: fileName,
        fileData: fileData,
        platform: details.orderDetails.platform
      };

      orders.unshift(order);
      localStorage.setItem('customerOrders', JSON.stringify(orders));
      console.log('Order saved to admin panel:', order.orderId);
    } catch (error) {
      console.error('Error saving order to admin panel:', error);
    }
  }

})();

/* Appended from RLAccounts.html (scoped and reusing existing basket functions) */
(function(){
  'use strict';

  const platformData = {
    all: {
      name: "All Platforms",
      icon: "fas fa-globe",
      available: true,
      accounts: [
        {
          name: "SSL PENTATHLON ACCOUNT",
          platform: "Epic Games",
          price: "$99.99",
          linkStatus: "Epic Exclusive SSL Account",
          features: [
            "S19 Supersonic Tournament Winner (WHITE)",
            "S19 Supersonic Tournament Winner (PINK)",
            "10th Supersonic Anniversary Pentathlon Winner (WHITE)",
            "Full account access",
            "Email & password changeable"
          ],
          purchaseLink: "../../../Accounts/SSL-PENTATHLON-ACCOUNT1.html"
        },
        {
          name: "EPIC RLCS 2025 CHALLENGER ACCOUNT",
          platform: "Epic Games",
          price: "$349.99",
          linkStatus: "Epic Exclusive RLCS Account",
          features: [
            "RLCS 2025 Challenger Status",
            "Exclusive tournament items",
            "Full account access",
            "Email & password changeable"
          ],
          purchaseLink: "../../../Accounts/RLCS-CHALLENGER-ACCOUNT1.html"
        },
        {
          name: "Rocket League Steam Account",
          platform: "Steam",
          price: "$80.00",
          linkStatus: "Linked to Epic Games",
          features: [
            "Linked to Epic Games (credentials changeable)",
            "Includes standard cosmetics"
          ]
        },
        {
          name: "Steam Competitive",
          platform: "Steam",
          price: "$100.00",
          linkStatus: "Not linked to Epic Games or PlayStation",
          features: [
            "Not linked to Epic Games or PlayStation",
            "Ideal for fresh start or transfers"
          ]
        }
      ]
    },
    xbox: { name: "Xbox", icon: "fab fa-xbox", available: false, accounts: [] },
    playstation: { name: "PlayStation", icon: "fab fa-playstation", available: false, accounts: [] },
    epic: { name: "Epic Games", icon: "fas fa-gamepad", available: true, accounts: [] },
    steam: { name: "Steam", icon: "fab fa-steam", available: true, accounts: [] }
  };

  function getPlatformIcon(platform) {
    if (!platform) return 'fas fa-gamepad';
    switch(platform.toLowerCase()) {
      case 'xbox': return 'fab fa-xbox';
      case 'playstation': return 'fab fa-playstation';
      case 'epic games': return 'fas fa-gamepad';
      case 'steam': return 'fab fa-steam';
      default: return 'fas fa-gamepad';
    }
  }

  function displayNoAccounts(platform, platformInfo) {
    const accountDisplay = document.getElementById('accountDisplay');
    if (!accountDisplay) return;
    accountDisplay.innerHTML = `
      <div class="no-accounts">
        <div class="no-accounts-icon"><i class="${platformInfo.icon}"></i></div>
        <h3>No ${platformInfo.name} Accounts Available</h3>
        <p>We currently don't have any ${platformInfo.name} Rocket League accounts in stock.</p>
        <button class="btn btn-primary" id="notifyPlatform" data-platform="${platform}">NOTIFY ME WHEN AVAILABLE</button>
      </div>
    `;

    setTimeout(() => {
      const notifyButton = document.getElementById('notifyPlatform');
      if (notifyButton) {
        notifyButton.addEventListener('click', () => {
          const contactEl = document.getElementById('contact');
          if (contactEl) contactEl.scrollIntoView({ behavior: 'smooth' });
          const platformSelect = document.getElementById('platform');
          if (platformSelect) platformSelect.value = platform;
        });
      }
    }, 50);
  }

  function displayAvailableAccounts(platform, platformInfo) {
    const accountDisplay = document.getElementById('accountDisplay');
    if (!accountDisplay) return;

    let accountsHTML = `<h3 class="account-display-title">${platformInfo.name} Accounts</h3>`;
    accountsHTML += `<div class="account-categories">`;

    platformInfo.accounts.forEach(account => {
      const badgeIcon = account.linkStatus && account.linkStatus.toLowerCase().includes('not linked') ? 'fas fa-unlink' : 'fas fa-link';
      const priceValue = (account.price || '').replace(/[^0-9.]/g, '') || '';
      const buttonText = (account.platform || platform).toLowerCase() === 'steam' ? 'ADD TO BASKET' : 'PURCHASE';
      const btnAttrs = (account.platform || platform).toLowerCase() === 'steam' ? `data-basket="${account.name}" data-price="${priceValue}" data-platform="${(account.platform||platform).toLowerCase()}"` : `data-inquire="${account.name}" data-price="${priceValue}" data-platform="${(account.platform||platform).toLowerCase()}"`;

      accountsHTML += `
        <div class="account-category">
          <div class="category-header">
            <div class="category-name">${account.name}</div>
            <div class="category-price">${account.price || ''}</div>
          </div>
          ${account.linkStatus ? `<div class="linked-badge"><i class="${badgeIcon}"></i>${account.linkStatus}</div>` : ''}
          <div style="font-size:0.9rem; color:var(--text-muted); margin-bottom:10px;"><i class="${getPlatformIcon(account.platform||platform)}"></i> ${account.platform||platform}</div>
          <ul class="category-features">
            ${(account.features||[]).map(f => `<li>${f}</li>`).join('')}
          </ul>
          <button class="btn btn-primary account-action-btn" style="width:100%; margin-top:15px;" ${btnAttrs} ${account.purchaseLink ? `data-link="${account.purchaseLink}"` : ''}>
            <i class="fas fa-shopping-cart"></i> ${buttonText}
          </button>
        </div>
      `;
    });

    accountsHTML += `</div>`;
    accountDisplay.innerHTML = accountsHTML;

    // bind buttons
    setTimeout(() => {
      accountDisplay.querySelectorAll('.account-action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.dataset.link) {
            window.location.href = btn.dataset.link;
            return;
          }
          if (btn.hasAttribute('data-basket')) {
            // use existing addToBasket helper
            try {
              const price = parseFloat(btn.dataset.price || '0') || 0;
              addToBasket({ title: btn.dataset.basket || btn.dataset.title || 'Steam Account', price: price, platform: btn.dataset.platform || 'steam' });
              btn.innerHTML = '<i class="fas fa-check"></i> ADDED TO BASKET';
              setTimeout(() => { btn.innerHTML = '<i class="fas fa-shopping-cart"></i> ADD TO BASKET'; }, 1500);
            } catch (e) { console.error(e); }
            return;
          }
          if (btn.hasAttribute('data-inquire')) {
            const accountName = btn.dataset.inquire;
            const accountPlatform = btn.dataset.platform || '';
            const price = btn.dataset.price || '';
            const url = 'PaymentMethods.html?account=' + encodeURIComponent(accountName) + '&platform=' + encodeURIComponent(accountPlatform) + (price ? '&basePrice=' + encodeURIComponent(price) : '');
            window.location.href = url;
          }
        });
      });
    }, 50);
  }

  function initRLAccounts() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', () => {
        const opened = mobileMenu.classList.toggle('active');
        mobileMenuBtn.innerHTML = opened ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        document.body.classList.toggle('no-scroll', opened);
      });
      document.querySelectorAll('.mobile-menu a').forEach(link => link.addEventListener('click', () => { mobileMenu.classList.remove('active'); document.body.classList.remove('no-scroll'); }));
    }

    const header = document.getElementById('header');
    const backToTop = document.getElementById('backToTop');
    if (header && backToTop) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 100) { header.classList.add('scrolled'); backToTop.classList.add('visible'); } else { header.classList.remove('scrolled'); backToTop.classList.remove('visible'); }
      });
      backToTop.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top:0, behavior:'smooth' }); });
    }

    // platform selection
    const platformOptions = Array.from(document.querySelectorAll('.platform-option'));
    const accountDisplay = document.getElementById('accountDisplay');
    if (platformOptions.length && accountDisplay) {
      platformOptions.forEach(option => {
        option.addEventListener('click', () => {
          platformOptions.forEach(o => o.classList.remove('selected'));
          option.classList.add('selected');
          const platform = option.dataset.platform;
          const platformInfo = platformData[platform] || { name: platform, icon: 'fas fa-gamepad', available: false, accounts: [] };
          if (platformInfo.available && (platformInfo.accounts||[]).length > 0) displayAvailableAccounts(platform, platformInfo); else displayNoAccounts(platform, platformInfo);
        });
      });

      // auto select all after short delay
      setTimeout(() => {
        const allOption = document.querySelector('.platform-option[data-platform="all"]');
        if (allOption) allOption.click();
      }, 400);
    }

    // footer platform links
    document.querySelectorAll('.platform-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const platform = link.dataset.platform;
        const products = document.getElementById('products');
        if (products) products.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          const opt = document.querySelector(`.platform-option[data-platform="${platform}"]`);
          if (opt) opt.click();
        }, 500);
      });
    });

    // contact navigation: smooth scroll or open chat if available
    document.querySelectorAll('.contact-nav, #contactTop, #heroContactBtn, .mobile-contact-nav, #mobileContactBtn, .footer-contact-nav').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const chat = document.getElementById('aiChatContainer');
        const target = document.getElementById('contact');
        if (chat) { chat.classList.add('active'); } else if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initRLAccounts); else initRLAccounts();

})();

/* Appended from RLboostingRank.html (scoped to avoid global collisions) */
(function(){
  'use strict';

    // Rank Data for different playlists
    const ranksByPlaylist = {
      '1v1': [
        { name: 'Bronze I', division: 'Division I', price: 6 },
        { name: 'Bronze II', division: 'Division I', price: 8 },
        { name: 'Bronze III', division: 'Division I', price: 9 },
        { name: 'Silver I', division: 'Division I', price: 10 },
        { name: 'Silver II', division: 'Division I', price: 11 },
        { name: 'Silver III', division: 'Division I', price: 12 },
        { name: 'Gold I', division: 'Division I', price: 14 },
        { name: 'Gold II', division: 'Division I', price: 16 },
        { name: 'Gold III', division: 'Division I', price: 18 },
        { name: 'Platinum I', division: 'Division I', price: 20 },
        { name: 'Platinum II', division: 'Division I', price: 22 },
        { name: 'Platinum III', division: 'Division I', price: 24 },
        { name: 'Diamond I', division: 'Division I', price: 26 },
        { name: 'Diamond II', division: 'Division I', price: 28 },
        { name: 'Diamond III', division: 'Division I', price: 30 },
        { name: 'Champion I', division: 'Division I', price: 35 },
        { name: 'Champion II', division: 'Division I', price: 40 },
        { name: 'Champion III', division: 'Division I', price: 45 },
        { name: 'Grand Champ I', division: 'Division I', price: 55 },
        { name: 'Grand Champ II', division: 'Division I', price: 65 },
        { name: 'Grand Champ III', division: 'Division I', price: 75 },
        { name: 'SSL', division: '+1350 MMR', price: 100 },
        { name: '1400 MMR', division: '1400 MMR', price: 140 },
        { name: 'TOP 100 GLOBAL', division: '1500+ MMR', price: 250 },
      ],
      '2v2': [
        { name: 'Bronze I', division: 'Division I', price: 5 },
        { name: 'Bronze II', division: 'Division I', price: 7 },
        { name: 'Bronze III', division: 'Division I', price: 8 },
        { name: 'Silver I', division: 'Division I', price: 9 },
        { name: 'Silver II', division: 'Division I', price: 10 },
        { name: 'Silver III', division: 'Division I', price: 11 },
        { name: 'Gold I', division: 'Division I', price: 12 },
        { name: 'Gold II', division: 'Division I', price: 13 },
        { name: 'Gold III', division: 'Division I', price: 14 },
        { name: 'Platinum I', division: 'Division I', price: 15 },
        { name: 'Platinum II', division: 'Division I', price: 16 },
        { name: 'Platinum III', division: 'Division I', price: 17 },
        { name: 'Diamond I', division: 'Division I', price: 18 },
        { name: 'Diamond II', division: 'Division I', price: 19 },
        { name: 'Diamond III', division: 'Division I', price: 20 },
        { name: 'Champion I', division: 'Division I', price: 22 },
        { name: 'Champion II', division: 'Division I', price: 24 },
        { name: 'Champion III', division: 'Division I', price: 26 },
        { name: 'Grand Champ I', division: 'Division I', price: 30 },
        { name: 'Grand Champ II', division: 'Division I', price: 35 },
        { name: 'Grand Champ III', division: 'Division I', price: 40 },
        { name: 'SSL', division: '+1880 MMR', price: 60 },
        { name: '2000 MMR', division: '2000 MMR', price: 90 },
        { name: '2100 MMR', division: '2100 MMR', price: 120 },
        { name: '2200 MMR', division: '2200 MMR', price: 150 },
        { name: '2300 MMR', division: '2300 MMR', price: 300 },
        { name: '2400 MMR', division: '2400 MMR', price: 400 },
        { name: 'TOP 100 GLOBAL', division: '2500 MMR - 2850 MMR', price: 500 },
      ],
      '3v3': [
        { name: 'Bronze I', division: 'Division I', price: 5 },
        { name: 'Bronze II', division: 'Division I', price: 7 },
        { name: 'Bronze III', division: 'Division I', price: 8 },
        { name: 'Silver I', division: 'Division I', price: 9 },
        { name: 'Silver II', division: 'Division I', price: 10 },
        { name: 'Silver III', division: 'Division I', price: 11 },
        { name: 'Gold I', division: 'Division I', price: 12 },
        { name: 'Gold II', division: 'Division I', price: 13 },
        { name: 'Gold III', division: 'Division I', price: 14 },
        { name: 'Platinum I', division: 'Division I', price: 15 },
        { name: 'Platinum II', division: 'Division I', price: 16 },
        { name: 'Platinum III', division: 'Division I', price: 17 },
        { name: 'Diamond I', division: 'Division I', price: 18 },
        { name: 'Diamond II', division: 'Division I', price: 19 },
        { name: 'Diamond III', division: 'Division I', price: 20 },
        { name: 'Champion I', division: 'Division I', price: 22 },
        { name: 'Champion II', division: 'Division I', price: 24 },
        { name: 'Champion III', division: 'Division I', price: 30 },
        { name: 'Grand Champ I', division: 'Division I', price: 40 },
        { name: 'Grand Champ II', division: 'Division I', price: 65 },
        { name: 'Grand Champ III', division: 'Division I', price: 80 },
        { name: 'SSL', division: '+1870 MMR', price: 100 },
        { name: 'TOP 100 GLOBAL', division: '2000+ MMR', price: 150 },
      ],
      '4v4': [
        { name: 'Bronze I', division: 'Division I', price: 4 },
        { name: 'Bronze II', division: 'Division I', price: 6 },
        { name: 'Bronze III', division: 'Division I', price: 7 },
        { name: 'Silver I', division: 'Division I', price: 8 },
        { name: 'Silver II', division: 'Division I', price: 9 },
        { name: 'Silver III', division: 'Division I', price: 10 },
        { name: 'Gold I', division: 'Division I', price: 11 },
        { name: 'Gold II', division: 'Division I', price: 12 },
        { name: 'Gold III', division: 'Division I', price: 13 },
        { name: 'Platinum I', division: 'Division I', price: 14 },
        { name: 'Platinum II', division: 'Division I', price: 15 },
        { name: 'Platinum III', division: 'Division I', price: 16 },
        { name: 'Diamond I', division: 'Division I', price: 17 },
        { name: 'Diamond II', division: 'Division I', price: 18 },
        { name: 'Diamond III', division: 'Division I', price: 19 },
        { name: 'Champion I', division: 'Division I', price: 21 },
        { name: 'Champion II', division: 'Division I', price: 23 },
        { name: 'Champion III', division: 'Division I', price: 25 },
        { name: 'Grand Champ I', division: 'Division I', price: 28 },
        { name: 'Grand Champ II', division: 'Division I', price: 32 },
        { name: 'Grand Champ III', division: 'Division I', price: 36 },
        { name: 'SSL', division: '+1350 MMR', price: 50 },
        { name: 'GLOBAL TOP 100', division: '+1500 MMR', price: 50 },

      ],
      'hoops': [
        { name: 'Bronze I', division: 'Division I', price: 7 },
        { name: 'Bronze II', division: 'Division I', price: 9 },
        { name: 'Bronze III', division: 'Division I', price: 11 },
        { name: 'Silver I', division: 'Division I', price: 13 },
        { name: 'Silver II', division: 'Division I', price: 15 },
        { name: 'Silver III', division: 'Division I', price: 17 },
        { name: 'Gold I', division: 'Division I', price: 19 },
        { name: 'Gold II', division: 'Division I', price: 21 },
        { name: 'Gold III', division: 'Division I', price: 23 },
        { name: 'Platinum I', division: 'Division I', price: 25 },
        { name: 'Platinum II', division: 'Division I', price: 27 },
        { name: 'Platinum III', division: 'Division I', price: 29 },
        { name: 'Diamond I', division: 'Division I', price: 32 },
        { name: 'Diamond II', division: 'Division I', price: 35 },
        { name: 'Diamond III', division: 'Division I', price: 38 },
        { name: 'Champion I', division: 'Division I', price: 42 },
        { name: 'Champion II', division: 'Division I', price: 46 },
        { name: 'Champion III', division: 'Division I', price: 50 },
        { name: 'Grand Champ I', division: 'Division I', price: 60 },
        { name: 'Grand Champ II', division: 'Division I', price: 70 },
        { name: 'Grand Champ III', division: 'Division I', price: 80 },
        { name: 'SSL', division: '+1400 MMR', price: 120 },
      ],
      'rumble': [
        { name: 'Bronze I', division: 'Division I', price: 7 },
        { name: 'Bronze II', division: 'Division I', price: 9 },
        { name: 'Bronze III', division: 'Division I', price: 11 },
        { name: 'Silver I', division: 'Division I', price: 13 },
        { name: 'Silver II', division: 'Division I', price: 15 },
        { name: 'Silver III', division: 'Division I', price: 17 },
        { name: 'Gold I', division: 'Division I', price: 19 },
        { name: 'Gold II', division: 'Division I', price: 21 },
        { name: 'Gold III', division: 'Division I', price: 23 },
        { name: 'Platinum I', division: 'Division I', price: 25 },
        { name: 'Platinum II', division: 'Division I', price: 27 },
        { name: 'Platinum III', division: 'Division I', price: 29 },
        { name: 'Diamond I', division: 'Division I', price: 32 },
        { name: 'Diamond II', division: 'Division I', price: 35 },
        { name: 'Diamond III', division: 'Division I', price: 38 },
        { name: 'Champion I', division: 'Division I', price: 42 },
        { name: 'Champion II', division: 'Division I', price: 46 },
        { name: 'Champion III', division: 'Division I', price: 50 },
        { name: 'Grand Champ I', division: 'Division I', price: 60 },
        { name: 'Grand Champ II', division: 'Division I', price: 70 },
        { name: 'Grand Champ III', division: 'Division I', price: 80 },
        { name: 'SSL', division: '+1500 MMR', price: 120 },
      ],
      'dropshot': [
        { name: 'Bronze I', division: 'Division I', price: 7 },
        { name: 'Bronze II', division: 'Division I', price: 9 },
        { name: 'Bronze III', division: 'Division I', price: 11 },
        { name: 'Silver I', division: 'Division I', price: 13 },
        { name: 'Silver II', division: 'Division I', price: 15 },
        { name: 'Silver III', division: 'Division I', price: 17 },
        { name: 'Gold I', division: 'Division I', price: 19 },
        { name: 'Gold II', division: 'Division I', price: 21 },
        { name: 'Gold III', division: 'Division I', price: 23 },
        { name: 'Platinum I', division: 'Division I', price: 25 },
        { name: 'Platinum II', division: 'Division I', price: 27 },
        { name: 'Platinum III', division: 'Division I', price: 29 },
        { name: 'Diamond I', division: 'Division I', price: 32 },
        { name: 'Diamond II', division: 'Division I', price: 35 },
        { name: 'Diamond III', division: 'Division I', price: 38 },
        { name: 'Champion I', division: 'Division I', price: 42 },
        { name: 'Champion II', division: 'Division I', price: 46 },
        { name: 'Champion III', division: 'Division I', price: 50 },
        { name: 'Grand Champ I', division: 'Division I', price: 60 },
        { name: 'Grand Champ II', division: 'Division I', price: 70 },
        { name: 'Grand Champ III', division: 'Division I', price: 80 },
        { name: 'SSL', division: '+1300 MMR', price: 120 },
      ],
      'snowday': [
        { name: 'Bronze I', division: 'Division I', price: 7 },
        { name: 'Bronze II', division: 'Division I', price: 9 },
        { name: 'Bronze III', division: 'Division I', price: 11 },
        { name: 'Silver I', division: 'Division I', price: 13 },
        { name: 'Silver II', division: 'Division I', price: 15 },
        { name: 'Silver III', division: 'Division I', price: 17 },
        { name: 'Gold I', division: 'Division I', price: 19 },
        { name: 'Gold II', division: 'Division I', price: 21 },
        { name: 'Gold III', division: 'Division I', price: 23 },
        { name: 'Platinum I', division: 'Division I', price: 25 },
        { name: 'Platinum II', division: 'Division I', price: 27 },
        { name: 'Platinum III', division: 'Division I', price: 29 },
        { name: 'Diamond I', division: 'Division I', price: 32 },
        { name: 'Diamond II', division: 'Division I', price: 35 },
        { name: 'Diamond III', division: 'Division I', price: 38 },
        { name: 'Champion I', division: 'Division I', price: 42 },
        { name: 'Champion II', division: 'Division I', price: 46 },
        { name: 'Champion III', division: 'Division I', price: 50 },
        { name: 'Grand Champ I', division: 'Division I', price: 60 },
        { name: 'Grand Champ II', division: 'Division I', price: 70 },
        { name: 'Grand Champ III', division: 'Division I', price: 80 },
        { name: 'SSL', division: '+1400 MMR', price: 120 },
      ],
      'heatseeker': [
        { name: 'Bronze I', division: 'Division I', price: 7 },
        { name: 'Bronze II', division: 'Division I', price: 9 },
        { name: 'Bronze III', division: 'Division I', price: 11 },
        { name: 'Silver I', division: 'Division I', price: 13 },
        { name: 'Silver II', division: 'Division I', price: 15 },
        { name: 'Silver III', division: 'Division I', price: 17 },
        { name: 'Gold I', division: 'Division I', price: 19 },
        { name: 'Gold II', division: 'Division I', price: 21 },
        { name: 'Gold III', division: 'Division I', price: 23 },
        { name: 'Platinum I', division: 'Division I', price: 25 },
        { name: 'Platinum II', division: 'Division I', price: 27 },
        { name: 'Platinum III', division: 'Division I', price: 29 },
        { name: 'Diamond I', division: 'Division I', price: 32 },
        { name: 'Diamond II', division: 'Division I', price: 35 },
        { name: 'Diamond III', division: 'Division I', price: 38 },
        { name: 'Champion I', division: 'Division I', price: 42 },
        { name: 'Champion II', division: 'Division I', price: 46 },
        { name: 'Champion III', division: 'Division I', price: 50 },
        { name: 'Grand Champ I', division: 'Division I', price: 60 },
        { name: 'Grand Champ II', division: 'Division I', price: 70 },
        { name: 'Grand Champ III', division: 'Division I', price: 80 },
        { name: 'SSL', division: '+1350 MMR', price: 120 },
      ],
    };

    let currentRanks = ranksByPlaylist['2v2']; // Default to 2v2
    let activePlaylist = null; // Currently active playlist being configured
    let playlistSelections = {}; // Store selections for each playlist

    // Initialize the page
    document.addEventListener('DOMContentLoaded', () => {
      initializeRankOptions();
      setupEventListeners();
      updatePriceSummary();
      updateOrderSummary();
    });

    // Create rank options
    function initializeRankOptions() {
      const currentRankContainer = document.getElementById('currentRankOptions');
      const desiredRankContainer = document.getElementById('desiredRankOptions');
      
      // Clear existing options
      currentRankContainer.innerHTML = '';
      desiredRankContainer.innerHTML = '';
      
      currentRanks.forEach((rank, index) => {
        // Current rank options
        const currentRankOption = document.createElement('div');
        currentRankOption.className = 'rank-option';
        currentRankOption.innerHTML = `
          <input type="radio" id="current-${index}" name="currentRank" value="${rank.name}" data-price="${rank.price}">
          <label class="rank-label" for="current-${index}">
            <div class="rank-name">${rank.name}</div>
            <div class="rank-division">${rank.division}</div>
          </label>
        `;
        currentRankContainer.appendChild(currentRankOption);
        
        // Desired rank options (only from next rank onwards)
        const desiredRankOption = document.createElement('div');
        desiredRankOption.className = 'rank-option';
        
        desiredRankOption.innerHTML = `
          <input type="radio" id="desired-${index}" name="desiredRank" value="${rank.name}" data-price="${rank.price}">
          <label class="rank-label" for="desired-${index}">
            <div class="rank-name">${rank.name}</div>
            <div class="rank-division">${rank.division}</div>
            <div class="rank-price">$${rank.price}</div>
          </label>
        `;
        desiredRankContainer.appendChild(desiredRankOption);
      });
    }

    // Handle playlist change
    function handlePlaylistChange() {
      const selectedPlaylists = Array.from(document.querySelectorAll('input[name="playlist"]:checked')).map(cb => cb.value);
      const activePlaylistSelector = document.getElementById('activePlaylistSelector');
      const activePlaylistTabs = document.getElementById('activePlaylistTabs');
      
      if (selectedPlaylists.length > 0) {
        // Show the active playlist selector
        activePlaylistSelector.style.display = 'block';
        
        // Generate tabs for selected playlists
        activePlaylistTabs.innerHTML = '';
        const playlistLabels = {
          '1v1': 'Ranked 1v1 Duel',
          '2v2': 'Ranked 2v2 Doubles',
          '3v3': 'Ranked 3v3 Standard',
          '4v4': 'Ranked 4v4 Quads',
          'hoops': 'Hoops',
          'rumble': 'Rumble',
          'dropshot': 'Dropshot',
          'snowday': 'Snowday',
          'heatseeker': 'Heatseeker'
        };
        
        selectedPlaylists.forEach((playlist, index) => {
          const tab = document.createElement('div');
          tab.className = 'playlist-tab' + (index === 0 && !activePlaylist ? ' active' : (activePlaylist === playlist ? ' active' : ''));
          tab.textContent = playlistLabels[playlist] || playlist;
          tab.dataset.playlist = playlist;
          tab.addEventListener('click', () => switchToPlaylist(playlist));
          activePlaylistTabs.appendChild(tab);
        });
        
        // If no active playlist or current active is not selected anymore, switch to first
        if (!activePlaylist || !selectedPlaylists.includes(activePlaylist)) {
          switchToPlaylist(selectedPlaylists[0]);
        }
      } else {
        activePlaylistSelector.style.display = 'none';
        activePlaylist = null;
      }
      
      updateOrderSummary();
    }
    
    // Switch to a specific playlist for configuration
    function switchToPlaylist(playlist) {
      // Save current rank selections for the active playlist before switching
      if (activePlaylist) {
        saveCurrentPlaylistSelections();
      }
      
      activePlaylist = playlist;
      currentRanks = ranksByPlaylist[playlist] || ranksByPlaylist['2v2'];
      
      // Update active tab
      document.querySelectorAll('.playlist-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.playlist === playlist);
      });
      
      // Reload rank options for this playlist
      initializeRankOptions();
      
      // Restore saved selections for this playlist
      if (playlistSelections[playlist]) {
        restorePlaylistSelections(playlist);
      }
      
      setupRankEventListeners();
      updatePriceSummary();
    }
    
    // Save current playlist selections
    function saveCurrentPlaylistSelections() {
      const currentRank = document.querySelector('input[name="currentRank"]:checked');
      const desiredRank = document.querySelector('input[name="desiredRank"]:checked');
      
      if (currentRank && desiredRank) {
        playlistSelections[activePlaylist] = {
          currentRank: currentRank.value,
          desiredRank: desiredRank.value
        };
      }
    }
    
    // Restore playlist selections
    function restorePlaylistSelections(playlist) {
      const selections = playlistSelections[playlist];
      if (selections) {
        const currentRankInput = document.querySelector(`input[name="currentRank"][value="${selections.currentRank}"]`);
        const desiredRankInput = document.querySelector(`input[name="desiredRank"][value="${selections.desiredRank}"]`);
        
        if (currentRankInput) currentRankInput.checked = true;
        if (desiredRankInput) desiredRankInput.checked = true;
        
        autoSelectRewards();
      }
    }

    // Handle tournament selection - prevent selecting both normal and 3-in-a-row versions
    function handleTournamentSelection() {
      const champTournament = document.getElementById('champTournament');
      const champTournament3 = document.getElementById('champTournament3');
      const gcTournament = document.getElementById('gcTournament');
      const gcTournament3 = document.getElementById('gcTournament3');
      const sslTournament = document.getElementById('sslTournament');
      const sslTournament3 = document.getElementById('sslTournament3');
      
      // If Champion 3 In A Row is selected, uncheck normal Champion
      if (champTournament3.checked && champTournament.checked) {
        champTournament.checked = false;
      }
      // If normal Champion is selected, uncheck Champion 3 In A Row
      if (champTournament.checked && champTournament3.checked) {
        champTournament3.checked = false;
      }
      
      // If GC 3 In A Row is selected, uncheck normal GC
      if (gcTournament3.checked && gcTournament.checked) {
        gcTournament.checked = false;
      }
      // If normal GC is selected, uncheck GC 3 In A Row
      if (gcTournament.checked && gcTournament3.checked) {
        gcTournament3.checked = false;
      }
      
      // If SSL 3 In A Row is selected, uncheck normal SSL
      if (sslTournament3.checked && sslTournament.checked) {
        sslTournament.checked = false;
      }
      // If normal SSL is selected, uncheck SSL 3 In A Row
      if (sslTournament.checked && sslTournament3.checked) {
        sslTournament3.checked = false;
      }
    }

    // Update order summary display
    function updateOrderSummary() {
      // Save current active playlist selections before summarizing
      if (activePlaylist) {
        saveCurrentPlaylistSelections();
      }
      
      // Playlists - show all selected with rank ranges
      const summaryPlaylist = document.getElementById('summaryPlaylist');
      const summaryCurrentRank = document.getElementById('summaryCurrentRank');
      const summaryDesiredRank = document.getElementById('summaryDesiredRank');
      
      const selectedPlaylists = Array.from(document.querySelectorAll('input[name="playlist"]:checked')).map(cb => cb.value);
      const playlistLabels = {
        '1v1': 'Ranked 1v1 Duel',
        '2v2': 'Ranked 2v2 Doubles',
        '3v3': 'Ranked 3v3 Standard',
        '4v4': 'Ranked 4v4 Quads',
        'hoops': 'Hoops',
        'rumble': 'Rumble',
        'dropshot': 'Dropshot',
        'snowday': 'Snowday',
        'heatseeker': 'Heatseeker'
      };
      
      if (selectedPlaylists.length > 0) {
        const playlistSummaryLines = [];
        selectedPlaylists.forEach(playlist => {
          const selection = playlistSelections[playlist];
          if (selection) {
            playlistSummaryLines.push(`${playlistLabels[playlist]}: ${selection.currentRank} → ${selection.desiredRank}`);
          } else {
            playlistSummaryLines.push(`${playlistLabels[playlist]}: Not configured`);
          }
        });
        summaryPlaylist.innerHTML = playlistSummaryLines.join('<br>');
        summaryCurrentRank.textContent = '-';
        summaryDesiredRank.textContent = '-';
      } else {
        summaryPlaylist.textContent = 'No playlists selected';
        summaryCurrentRank.textContent = '-';
        summaryDesiredRank.textContent = '-';
      }

      // Rewards
      const gcReward = document.getElementById('gcReward');
      const sslReward = document.getElementById('sslReward');
      const summaryRewards = document.getElementById('summaryRewards');
      const rewards = [];
      if (gcReward && gcReward.checked) rewards.push('Grand Champion');
      if (sslReward && sslReward.checked) rewards.push('SSL');
      summaryRewards.textContent = rewards.length > 0 ? rewards.join(', ') : 'None';

      // Tournaments
      const tournaments = document.querySelectorAll('input[name="tournament"]:checked');
      const summaryTournaments = document.getElementById('summaryTournaments');
      const tournamentLabels = {
        'champion': 'Champion Tournament',
        'champion3': 'Champion (3 In A Row)',
        'gc': 'GC Tournament',
        'gc3': 'GC (3 In A Row)',
        'ssl': 'SSL Tournament',
        'ssl3': 'SSL (3 In A Row)'
      };
      const tournamentList = Array.from(tournaments).map(t => tournamentLabels[t.value] || t.value);
      summaryTournaments.textContent = tournamentList.length > 0 ? tournamentList.join(', ') : 'None';

      // Platform
      const platform = document.querySelector('input[name="platform"]:checked');
      const summaryPlatform = document.getElementById('summaryPlatform');
      const platformLabels = {
        'psn': 'PlayStation (PSN)',
        'epic': 'Epic Games',
        'steam': 'Steam'
      };
      summaryPlatform.textContent = platform ? platformLabels[platform.value] || platform.value : 'Not selected';
    }

    // Setup rank event listeners
    function setupRankEventListeners() {
      // Rank selection
      document.querySelectorAll('input[name="currentRank"], input[name="desiredRank"]').forEach(input => {
        input.addEventListener('change', () => {
          validateRankSelection();
          autoSelectRewards();
          updatePriceSummary();
          updateProgressSteps();
          updateOrderSummary();
        });
      });
    }

    // Setup event listeners
    function setupEventListeners() {
      setupRankEventListeners();
      
      // Reward selection
      document.querySelectorAll('input[name="reward"]').forEach(input => {
        input.addEventListener('change', () => {
          updatePriceSummary();
          updateOrderSummary();
        });
      });
      
      // Playlist selection
      document.querySelectorAll('input[name="playlist"]').forEach(input => {
        input.addEventListener('change', () => {
          handlePlaylistChange();
          updateProgressSteps();
          updateOrderSummary();
        });
      });
      
      // Tournament selection
      document.querySelectorAll('input[name="tournament"]').forEach(input => {
        input.addEventListener('change', () => {
          handleTournamentSelection();
          updatePriceSummary();
          updateOrderSummary();
        });
      });
      
      // Platform selection
      document.querySelectorAll('input[name="platform"]').forEach(input => {
        input.addEventListener('change', () => {
          updatePriceSummary();
          updateOrderSummary();
        });
      });
      
      // Form input validation
      document.getElementById('email').addEventListener('input', validateForm);
      document.getElementById('password').addEventListener('input', validateForm);
      
      // Submit button
      document.getElementById('submitOrder').addEventListener('click', submitOrder);
    }

    // Validate rank selection
    function validateRankSelection() {
      const currentRank = document.querySelector('input[name="currentRank"]:checked');
      const desiredRank = document.querySelector('input[name="desiredRank"]:checked');
      
      if (currentRank && desiredRank) {
        const currentIndex = currentRanks.findIndex(r => r.name === currentRank.value);
        const desiredIndex = currentRanks.findIndex(r => r.name === desiredRank.value);
        
        if (desiredIndex <= currentIndex) {
          alert('Desired rank must be higher than current rank!');
          desiredRank.checked = false;
          updatePriceSummary();
        }
      }
    }

    // Auto-select and lock rewards based on desired rank
    function autoSelectRewards() {
      const desiredRank = document.querySelector('input[name="desiredRank"]:checked');
      const gcReward = document.getElementById('gcReward');
      const sslReward = document.getElementById('sslReward');
      const gcLabel = document.querySelector('label[for="gcReward"]');
      const sslLabel = document.querySelector('label[for="sslReward"]');
      
      if (!desiredRank) {
        // Reset to default state if no desired rank is selected
        gcReward.disabled = false;
        sslReward.disabled = false;
        gcReward.checked = false;
        sslReward.checked = false;
        if (gcLabel) gcLabel.style.opacity = '1';
        if (sslLabel) sslLabel.style.opacity = '1';
        return;
      }
      
      const desiredRankName = desiredRank.value;
      const desiredIndex = currentRanks.findIndex(r => r.name === desiredRankName);
      
      // Find key rank indices
      const gcIIndex = currentRanks.findIndex(r => r.name === 'Grand Champ I');
      const gcIIIndex = currentRanks.findIndex(r => r.name === 'Grand Champ II');
      const gcIIIIndex = currentRanks.findIndex(r => r.name === 'Grand Champ III');
      const mmr2000Index = currentRanks.findIndex(r => r.name.includes('MMR') && parseInt(r.name) >= 1400);
      
      // 2000 MMR and above: Both rewards auto-selected and locked
      if (desiredIndex >= mmr2000Index) {
        gcReward.checked = true;
        gcReward.disabled = true;
        sslReward.checked = true;
        sslReward.disabled = true;
        if (gcLabel) gcLabel.style.opacity = '0.7';
        if (sslLabel) sslLabel.style.opacity = '0.7';
      }
      // Grand Champ III to SSL: GC auto-locked, SSL optional
      else if (desiredIndex >= gcIIIIndex && desiredIndex < mmr2000Index) {
        gcReward.checked = true;
        gcReward.disabled = true;
        sslReward.checked = false;
        sslReward.disabled = false;
        if (gcLabel) gcLabel.style.opacity = '0.7';
        if (sslLabel) sslLabel.style.opacity = '1';
      }
      // Grand Champ II: GC auto-locked, SSL disabled
      else if (desiredIndex >= gcIIIndex && desiredIndex < gcIIIIndex) {
        gcReward.checked = true;
        gcReward.disabled = true;
        sslReward.checked = false;
        sslReward.disabled = true;
        if (gcLabel) gcLabel.style.opacity = '0.7';
        if (sslLabel) sslLabel.style.opacity = '0.7';
      }
      // Grand Champ I: GC optional, SSL disabled
      else if (desiredIndex >= gcIIndex && desiredIndex < gcIIIndex) {
        gcReward.checked = false;
        gcReward.disabled = false;
        sslReward.checked = false;
        sslReward.disabled = true;
        if (gcLabel) gcLabel.style.opacity = '1';
        if (sslLabel) sslLabel.style.opacity = '0.7';
      }
      // Below Grand Champ I: Both disabled
      else {
        gcReward.checked = false;
        gcReward.disabled = true;
        sslReward.checked = false;
        sslReward.disabled = true;
        if (gcLabel) gcLabel.style.opacity = '0.7';
        if (sslLabel) sslLabel.style.opacity = '0.7';
      }
    }

    // Update price summary
    function updatePriceSummary() {
      // Save current active playlist selections before calculating
      if (activePlaylist) {
        saveCurrentPlaylistSelections();
      }
      
      const gcReward = document.getElementById('gcReward');
      const sslReward = document.getElementById('sslReward');
      const platform = document.querySelector('input[name="platform"]:checked');
      
      let totalBasePrice = 0;
      let gcPrice = 0;
      let sslPrice = 0;
      let tournamentPrice = 0;
      let platformFee = 0;
      
      // Calculate base price for ALL selected playlists
      const selectedPlaylists = Array.from(document.querySelectorAll('input[name="playlist"]:checked')).map(cb => cb.value);
      
      selectedPlaylists.forEach(playlist => {
        const selection = playlistSelections[playlist];
        if (selection && selection.currentRank && selection.desiredRank) {
          const playlistRanks = ranksByPlaylist[playlist] || ranksByPlaylist['2v2'];
          const currentIndex = playlistRanks.findIndex(r => r.name === selection.currentRank);
          const desiredIndex = playlistRanks.findIndex(r => r.name === selection.desiredRank);
          
          if (desiredIndex > currentIndex) {
            // Calculate price based on rank difference for this playlist
            for (let i = currentIndex + 1; i <= desiredIndex; i++) {
              totalBasePrice += playlistRanks[i].price;
            }
          }
        }
      });
      
      // Add reward prices (applied once, not per playlist)
      if (gcReward && gcReward.checked) {
        gcPrice = 5;
      }
      
      if (sslReward && sslReward.checked) {
        sslPrice = 8;
      }
      
      // Add tournament prices (applied once, not per playlist)
      const tournaments = {
        'champion': 9.99,
        'champion3': 14.99,
        'gc': 34.99,
        'gc3': 49.99,
        'ssl': 59.99,
        'ssl3': 79.99
      };
      
      document.querySelectorAll('input[name="tournament"]:checked').forEach(input => {
        tournamentPrice += tournaments[input.value] || 0;
      });
      
      // Add platform fee (applied once, not per playlist)
      if (platform) {
        platformFee = 2;
      }
      
      // Calculate total
      const total = totalBasePrice + gcPrice + sslPrice + tournamentPrice + platformFee;
      
      // Update display
      document.getElementById('basePrice').textContent = `$${totalBasePrice.toFixed(2)}`;
      document.getElementById('gcPrice').textContent = gcPrice > 0 ? `$${gcPrice.toFixed(2)}` : '-';
      document.getElementById('sslPrice').textContent = sslPrice > 0 ? `$${sslPrice.toFixed(2)}` : '-';
      document.getElementById('tournamentPrice').textContent = tournamentPrice > 0 ? `$${tournamentPrice.toFixed(2)}` : '-';
      document.getElementById('platformFee').textContent = platformFee > 0 ? `$${platformFee.toFixed(2)}` : '-';
      document.getElementById('totalPrice').textContent = `$${total.toFixed(2)}`;
      
      // Update submit button state
      validateForm();
    }

    // Update progress steps
    function updateProgressSteps() {
      const currentRank = document.querySelector('input[name="currentRank"]:checked');
      const desiredRank = document.querySelector('input[name="desiredRank"]:checked');
      
      if (currentRank && desiredRank) {
        document.querySelectorAll('.step')[1].classList.add('active');
      } else {
        document.querySelectorAll('.step')[1].classList.remove('active');
        document.querySelectorAll('.step')[2].classList.remove('active');
      }
    }

    // Validate form
    function validateForm() {
      const submitBtn = document.getElementById('submitOrder');
      const currentRank = document.querySelector('input[name="currentRank"]:checked');
      const desiredRank = document.querySelector('input[name="desiredRank"]:checked');
      const platform = document.querySelector('input[name="platform"]:checked');
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      const hasTournament = document.querySelectorAll('input[name="tournament"]:checked').length > 0;
      
      const isEmailValid = email.includes('@') && email.includes('.');
      const isPasswordValid = password.length >= 6;
      
      // User can proceed if they have either rank boosting OR tournament boosting selected
      const hasRankBoosting = currentRank && desiredRank;
      const hasAnyService = hasRankBoosting || hasTournament;
      
      if (hasAnyService && platform && isEmailValid && isPasswordValid) {
        submitBtn.disabled = false;
      } else {
        submitBtn.disabled = true;
      }
    }

    // Add to basket — save the boosting configuration to basket
    function submitOrder() {
      // Save current active playlist selections
      if (activePlaylist) {
        saveCurrentPlaylistSelections();
      }
      
      const platform = document.querySelector('input[name="platform"]:checked');
      const selectedPlaylists = Array.from(document.querySelectorAll('input[name="playlist"]:checked')).map(cb => cb.value);
      
      // Validate playlist selections
      if (selectedPlaylists.length === 0) {
        alert('Please select at least one playlist!');
        return;
      }
      
      // Check if all selected playlists have rank configurations
      let hasIncompleteConfig = false;
      selectedPlaylists.forEach(playlist => {
        if (!playlistSelections[playlist] || !playlistSelections[playlist].currentRank || !playlistSelections[playlist].desiredRank) {
          hasIncompleteConfig = true;
        }
      });
      
      if (hasIncompleteConfig) {
        alert('Please configure ranks for all selected playlists!');
        return;
      }

      // Validate 2FA warning
      const confirm2FA = confirm('IMPORTANT: Have you disabled 2-Factor Authentication (2FA) on your account?\n\nClick OK to confirm, or Cancel to go back and disable it.');
      if (!confirm2FA) return;

      // Build service description for all playlists
      const playlistLabels = {
        '1v1': '1v1',
        '2v2': '2v2',
        '3v3': '3v3',
        '4v4': '4v4',
        'hoops': 'Hoops',
        'rumble': 'Rumble',
        'dropshot': 'Dropshot',
        'snowday': 'Snowday',
        'heatseeker': 'Heatseeker'
      };
      
      const playlistServices = [];
      selectedPlaylists.forEach(playlist => {
        const selection = playlistSelections[playlist];
        if (selection) {
          playlistServices.push(`${playlistLabels[playlist]}: ${selection.currentRank} → ${selection.desiredRank}`);
        }
      });
      
      let service = playlistServices.join(', ');
      
      // Add tournament boosting if selected
      const hasTournament = document.querySelectorAll('input[name="tournament"]:checked').length > 0;
      if (hasTournament) {
        const tournamentNames = [];
        document.querySelectorAll('input[name="tournament"]:checked').forEach(input => {
          const label = document.querySelector(`label[for="${input.id}"] .reward-name`);
          if (label) tournamentNames.push(label.textContent);
        });
        
        if (service) {
          service += ' + ' + tournamentNames.join(', ');
        } else {
          service = 'Tournament Boosting: ' + tournamentNames.join(', ');
        }
      }
      
      const platformVal = platform ? platform.value : '';
      const totalText = document.getElementById('totalPrice').textContent || '$0';
      const total = parseFloat(totalText.replace(/[^0-9.]/g, '')) || 0;
      
      // Add full service name with platform
      const fullServiceName = 'RL Boosting: ' + service + (platformVal ? ' (' + platformVal + ')' : '');

      // Add to basket
      const basketItem = {
        name: fullServiceName,
        price: '$' + total.toFixed(2),
        priceValue: total,
        type: 'boosting',
        url: window.location.href
      };
      
      // Store in localStorage using the correct key
      let basket = JSON.parse(localStorage.getItem('rlAccountBasket') || '[]');
      const exists = basket.find(item => item.name === fullServiceName);
      if (!exists) {
        basket.push(basketItem);
        localStorage.setItem('rlAccountBasket', JSON.stringify(basket));
      }
      
      // Show loading modal
      const loadingModal = document.getElementById('loadingModal');
      loadingModal.style.display = 'flex';
      
      // Redirect to index.html after 5 seconds
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 5000);
    }

    // Bootstrap AI help widget
    (function(){
      var serverBase = (window.location.protocol === 'file:') ? 'http://localhost:3000' : window.location.origin;
      var s = document.createElement('script');
      s.src = serverBase + '/assets/ai-widget.js';
      s.defer = true;
      document.body.appendChild(s);
    })();

  function renderRanks(playlist) {
    const container = document.getElementById('rankOptions');
    if (!container) return;
    container.innerHTML = '';
    const list = ranksByPlaylist[playlist] || [];
    list.forEach((rank, index) => {
      const id = `rank-${playlist}-${index}`;
      const html = `
        <div class="rank-option">
          <input type="radio" id="${id}" name="rank" value="${index}" ${index === 0 ? 'checked' : ''}>
          <label for="${id}" class="rank-label">
            <div class="rank-name">${rank.name}</div>
            <div class="rank-division">Division: ${rank.division}</div>
            <div class="rank-price">$${rank.price}</div>
          </label>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', html);
    });
  }

  function calculatePrice() {
    const playlist = document.querySelector('input[name="playlist"]:checked')?.value || '5v5';
    const rankIndex = parseInt(document.querySelector('input[name="rank"]:checked')?.value || '0');
    const rank = (ranksByPlaylist[playlist] || [])[rankIndex];
    if (!rank) return 0;
    const multiplier = parseFloat(document.getElementById('boostAmount')?.value) || 1;
    const platform = document.querySelector('input[name="platform"]:checked')?.value || 'PC';
    let platformModifier = 1;
    if (platform === 'PS' || platform === 'XB') platformModifier = 1.1;
    const total = Math.max(1, Math.round(rank.price * multiplier * platformModifier));
    const priceEl = document.getElementById('priceValue');
    if (priceEl) priceEl.innerText = `$${total}`;
    return total;
  }

  function submitOrder(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const nameEl = document.getElementById('accountName');
    const name = nameEl ? nameEl.value.trim() : '';
    const note = document.getElementById('accountNote')?.value?.trim();
    if (!name) {
      alert('Please enter your account name.');
      return;
    }
    const playlist = document.querySelector('input[name="playlist"]:checked')?.value || '5v5';
    const rankIndex = parseInt(document.querySelector('input[name="rank"]:checked')?.value || '0');
    const rank = (ranksByPlaylist[playlist] || [])[rankIndex];
    const platform = document.querySelector('input[name="platform"]:checked')?.value || 'PC';
    const boostAmount = parseFloat(document.getElementById('boostAmount')?.value) || 1;
    const price = calculatePrice();
    const item = {
      id: `rl-${Date.now()}`,
      title: `${playlist} - ${rank?.name || ''}`,
      playlist,
      rank: rank?.name || '',
      division: rank?.division || '',
      platform,
      amount: boostAmount,
      price,
      note: note || ''
    };

    const key = 'rlAccountBasket';
    try {
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push(item);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (err) {
      console.error('Failed to save order', err);
    }

    // show success UI if present
    document.querySelector('.success-message')?.classList.add('active');
    document.querySelector('.order-card')?.classList.add('hidden');
    setTimeout(() => { window.location.href = 'PaymentMethods.html'; }, 1200);
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderRanks('5v5');
    const playlistRadios = document.querySelectorAll('input[name="playlist"]');
    playlistRadios.forEach(r => r.addEventListener('change', () => renderRanks(r.value)));
    const inputs = document.querySelectorAll('input[name="platform"], input[name="rank"], #boostAmount');
    inputs.forEach(i => i.addEventListener('change', calculatePrice));
    document.getElementById('boostAmount')?.addEventListener('input', calculatePrice);
    const submitBtn = document.getElementById('submitOrder');
    if (submitBtn) submitBtn.addEventListener('click', submitOrder);
    calculatePrice();
  });

})();

// Appended from userpayments.html <script> block
// Includes security layers, backend config and admin order management
(function() {
  'use strict';

  // SECURITY GUARD: only run this heavy security/admin block on admin pages.
  // Pages should set either `class="admin-protected"` on <body>, include an element
  // with id="adminPanel", or use a `[data-admin]` attribute to enable this block.
  try {
    const body = document && document.body;
    const isAdminPage = body && (body.classList.contains('admin-protected') || document.getElementById('adminPanel') || document.querySelector('[data-admin]'));
    if (!isAdminPage) return; // skip security layer on normal public pages
  } catch (e) { return; }
  // ========== MILITARY-GRADE SECURITY LAYER ==========
  // Multi-Layer Encryption, Behavioral Analysis, VM Detection, Geolocation & Advanced Threat Monitoring
  // (Original code preserved from userpayments.html)

  // Advanced multi-layer encryption system
  const ENCRYPTION_KEY = 'AeR1aL@rC#S3cUr3$2026!M1L1T@RY';
  const SECONDARY_KEY = btoa('ULTRA_SECURE_KEY_' + Date.now());
  const SECURITY_SALT = 'SHA256_SALT_PROTECTION_2026';

  const generateHash = (text) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36) + Date.now().toString(36);
  };

  const signRequest = (data) => {
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2);
    const payload = JSON.stringify(data) + timestamp + nonce;
    const signature = generateHash(payload + ENCRYPTION_KEY);
    return { timestamp, nonce, signature };
  };

  window.__signRequest = signRequest;

  const encrypt = (text) => {
    let layer1 = '';
    for (let i = 0; i < text.length; i++) {
      layer1 += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
    }
    let layer2 = (SECURITY_SALT + layer1).split('').reverse().join('');
    let layer3 = '';
    for (let i = 0; i < layer2.length; i++) {
      layer3 += String.fromCharCode(layer2.charCodeAt(i) ^ SECONDARY_KEY.charCodeAt(i % SECONDARY_KEY.length));
    }
    return btoa(Date.now() + ':' + btoa(layer3));
  };

  const decrypt = (encoded) => {
    try {
      const decoded = atob(encoded);
      const parts = decoded.split(':');
      if (parts.length !== 2) return null;
      const timestamp = parseInt(parts[0]);
      if (Date.now() - timestamp > 48 * 60 * 60 * 1000) return null;
      const layer3 = atob(parts[1]);
      let layer2 = '';
      for (let i = 0; i < layer3.length; i++) {
        layer2 += String.fromCharCode(layer3.charCodeAt(i) ^ SECONDARY_KEY.charCodeAt(i % SECONDARY_KEY.length));
      }
      const layer1 = layer2.split('').reverse().join('').substring(SECURITY_SALT.length);
      let result = '';
      for (let i = 0; i < layer1.length; i++) {
        result += String.fromCharCode(layer1.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
      }
      return result;
    } catch (e) {
      return null;
    }
  };

  const secureStorage = {
    setItem: (key, value) => {
      localStorage.setItem(encrypt(key), encrypt(value));
    },
    getItem: (key) => {
      const encrypted = localStorage.getItem(encrypt(key));
      return encrypted ? decrypt(encrypted) : null;
    },
    removeItem: (key) => {
      localStorage.removeItem(encrypt(key));
    }
  };

  window.__secureStorage = secureStorage;

  const generateFingerprint = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
    const canvasFingerprint = canvas.toDataURL();
    let webglFingerprint = '';
    try {
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        webglFingerprint = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
      }
    } catch (e) {}
    let audioFingerprint = '';
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const context = new AudioContext();
        const oscillator = context.createOscillator();
        const analyser = context.createAnalyser();
        const gainNode = context.createGain();
        oscillator.connect(analyser);
        analyser.connect(gainNode);
        gainNode.connect(context.destination);
        audioFingerprint = analyser.fftSize.toString();
      }
    } catch (e) {}
    return btoa(JSON.stringify({
      ua: navigator.userAgent,
      lang: navigator.language,
      langs: navigator.languages ? navigator.languages.join(',') : '',
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      tz: new Date().getTimezoneOffset(),
      canvas: canvasFingerprint.substring(0, 50),
      webgl: webglFingerprint.substring(0, 30),
      audio: audioFingerprint,
      platform: navigator.platform,
      plugins: navigator.plugins.length,
      hardware: navigator.hardwareConcurrency || 0,
      memory: navigator.deviceMemory || 0,
      touch: navigator.maxTouchPoints || 0,
      vendor: navigator.vendor,
      webdriver: navigator.webdriver || false
    }));
  };

  const detectVirtualMachine = () => {
    const indicators = [];
    if (navigator.platform.includes('Linux') && screen.width === 800 && screen.height === 600) {
      indicators.push('VM_SCREEN_SIZE');
    }
    if (!navigator.plugins.length && !navigator.mimeTypes.length) {
      indicators.push('NO_PLUGINS');
    }
    if (navigator.webdriver) {
      indicators.push('WEBDRIVER_DETECTED');
    }
    if (window.callPhantom || window._phantom || window.phantom) {
      indicators.push('PHANTOM_DETECTED');
    }
    if (window.Buffer) {
      indicators.push('NODE_DETECTED');
    }
    return indicators;
  };

  const detectScreenRecording = () => {
    let recording = false;
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      recording = true;
    }
    return recording;
  };

  let devtoolsOpen = false;
  let debugAttempts = 0;
  const detectDevTools = () => {
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    if (widthDiff > threshold || heightDiff > threshold) {
      devtoolsOpen = true;
      debugAttempts++;
      console.warn('🚨 Security Alert: Developer tools detected (Attempt ' + debugAttempts + ')');
      if (debugAttempts > 3) {
        localStorage.clear();
        location.reload();
      }
    }
  };
  setInterval(detectDevTools, 1000);

  setInterval(() => { (function() { }).constructor('debugger')(); }, 50);

  const originalLog = console.log;
  console.log = function(...args) { originalLog.apply(console, args); };

  let userLocation = null;
  let ipAddress = null;
  (async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      ipAddress = data.ip;
      console.log('🌍 Access from IP:', ipAddress);
      const ipHistory = JSON.parse(localStorage.getItem('ip_access_history') || '[]');
      ipHistory.push({ ip: ipAddress, timestamp: Date.now() });
      if (ipHistory.length > 10) ipHistory.shift();
      localStorage.setItem('ip_access_history', JSON.stringify(ipHistory));
    } catch (e) { console.warn('⚠️ IP detection failed'); }
  })();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      userLocation = { lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy };
      console.log('📍 Location verified');
    }, (error) => { console.warn('⚠️ Location access denied'); }, { timeout: 10000, enableHighAccuracy: false });
  }

  let threatScore = 0;
  const MAX_THREAT_SCORE = 100;
  const updateThreatScore = (points, reason) => {
    threatScore += points;
    console.warn(`⚠️ Threat +${points}: ${reason} (Total: ${threatScore}/${MAX_THREAT_SCORE})`);
    if (threatScore >= MAX_THREAT_SCORE) {
      console.error('🚨 CRITICAL THREAT LEVEL REACHED!');
      localStorage.clear();
      sessionStorage.clear();
      document.body.innerHTML = `...`;
      throw new Error('Critical threat detected');
    }
  };

  const vmIndicators = detectVirtualMachine();
  if (vmIndicators.length > 0) {
    updateThreatScore(30, 'VM/Automation detected: ' + vmIndicators.join(', '));
  }

  let mouseMovements = [];
  let lastMouseTime = 0;
  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastMouseTime > 100) {
      mouseMovements.push({ x: e.clientX, y: e.clientY, time: now });
      if (mouseMovements.length > 50) mouseMovements.shift();
      if (mouseMovements.length > 10) {
        const speeds = [];
        for (let i = 1; i < mouseMovements.length; i++) {
          const dx = mouseMovements[i].x - mouseMovements[i-1].x;
          const dy = mouseMovements[i].y - mouseMovements[i-1].y;
          const dt = mouseMovements[i].time - mouseMovements[i-1].time;
          const speed = Math.sqrt(dx*dx + dy*dy) / dt;
          speeds.push(speed);
        }
        const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
        const variance = speeds.reduce((sum, speed) => sum + Math.pow(speed - avgSpeed, 2), 0) / speeds.length;
        if (variance < 0.001 && speeds.length > 20) {
          updateThreatScore(15, 'Bot-like mouse movement detected');
          mouseMovements = [];
        }
      }
      lastMouseTime = now;
    }
  });

  let keyPressTimings = [];
  let keystrokeDynamics = { downTimes: {}, upTimes: {} };
  document.addEventListener('keydown', (e) => {
    keystrokeDynamics.downTimes[e.key] = Date.now();
    keyPressTimings.push(Date.now());
    if (keyPressTimings.length > 20) keyPressTimings.shift();
    if (keyPressTimings.length >= 10) {
      const intervals = [];
      for (let i = 1; i < keyPressTimings.length; i++) intervals.push(keyPressTimings[i] - keyPressTimings[i-1]);
      const avgInterval = intervals.reduce((a,b)=>a+b,0)/intervals.length;
      const maxDiff = Math.max(...intervals.map(i => Math.abs(i - avgInterval)));
      if (maxDiff < 5 && intervals.length > 15) { updateThreatScore(20, 'Automated keyboard input detected'); keyPressTimings = []; }
    }
  });
  document.addEventListener('keyup', (e) => {
    if (keystrokeDynamics.downTimes[e.key]) {
      const holdTime = Date.now() - keystrokeDynamics.downTimes[e.key];
      keystrokeDynamics.upTimes[e.key] = holdTime;
      const holdTimes = Object.values(keystrokeDynamics.upTimes).slice(-10);
      if (holdTimes.length >= 10) {
        const avgHold = holdTimes.reduce((a,b)=>a+b,0)/holdTimes.length;
        const variance = holdTimes.reduce((sum,t)=>sum+Math.pow(t-avgHold,2),0)/holdTimes.length;
        if (variance < 2 && holdTimes.length >= 10) { updateThreatScore(25, 'Bot-like keystroke pattern detected'); keystrokeDynamics = { downTimes: {}, upTimes: {} }; }
      }
    }
  });

  const deviceId = generateFingerprint();
  const ACCESS_KEY = 'admin_access_verified';
  const DEVICE_KEY = 'authorized_device';
  const MAX_LOAD_ATTEMPTS = 3;
  const LOAD_ATTEMPT_KEY = 'page_load_attempts';
  const LOAD_LOCKOUT_KEY = 'page_load_lockout';
  const IP_TRACK_KEY = 'access_ip_history';
  const LAST_ACCESS_TIME = 'last_access_timestamp';
  window.__threatScore = () => threatScore;
  const now = Date.now();
  const lastAccess = parseInt(localStorage.getItem(LAST_ACCESS_TIME) || '0');
  const timeSinceLastAccess = now - lastAccess;
  if (timeSinceLastAccess > 0 && timeSinceLastAccess < 1000) console.warn('🚨 Suspicious rapid access detected');
  localStorage.setItem(LAST_ACCESS_TIME, now.toString());
  let loadAttempts = parseInt(localStorage.getItem(LOAD_ATTEMPT_KEY) || '0');
  const loadLockout = parseInt(localStorage.getItem(LOAD_LOCKOUT_KEY) || '0');

  const detectProxy = () => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection && connection.type === 'unknown') updateThreatScore(10, 'Unknown connection type (possible VPN)');
    if (document.referrer.includes(':8080') || document.referrer.includes(':3128')) updateThreatScore(15, 'Proxy port detected in referrer');
  };
  detectProxy();

  const totalFailures = parseInt(localStorage.getItem('total_security_failures') || '0');
  if (totalFailures > 10) { localStorage.clear(); sessionStorage.clear(); document.body.innerHTML = `...`; throw new Error('Auto-destruct activated'); }

  if (loadLockout > Date.now()) { const remainingMin = Math.ceil((loadLockout - Date.now()) / 60000); document.body.innerHTML = `...`; localStorage.setItem('total_security_failures', (totalFailures + 1).toString()); throw new Error('Access denied'); }

  const hasValidAccess = localStorage.getItem(ACCESS_KEY) === 'true';
  const authorizedDevice = localStorage.getItem(DEVICE_KEY);
  const isAuthorizedDevice = authorizedDevice === deviceId;
  if (!hasValidAccess || !isAuthorizedDevice) { loadAttempts++; localStorage.setItem(LOAD_ATTEMPT_KEY, loadAttempts.toString()); if (loadAttempts >= MAX_LOAD_ATTEMPTS) { const lockoutTime = Date.now() + (60 * 60 * 1000); localStorage.setItem(LOAD_LOCKOUT_KEY, lockoutTime.toString()); document.body.innerHTML = `...`; throw new Error('Security lockdown activated'); } }

  if (!localStorage.getItem(ACCESS_KEY)) {
    document.title = '404 Not Found';
    const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
    favicon.rel = 'icon';
    favicon.href = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    document.head.appendChild(favicon);
  }

  window.__verifyChallenge = () => {
    const challenges = [
      { q: 'What is 7 + 8?', a: '15' },
      { q: 'What is 12 - 5?', a: '7' },
      { q: 'What is 3 × 4?', a: '12' },
      { q: 'What is 20 ÷ 4?', a: '5' },
      { q: 'What is 9 + 6?', a: '15' }
    ];
    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    const startTime = Date.now();
    const answer = prompt('🔐 Security Challenge:\n\n' + challenge.q);
    const responseTime = Date.now() - startTime;
    if (responseTime < 1000) { console.warn('⚠️ Challenge answered suspiciously fast'); updateThreatScore(15, 'Challenge response too fast (< 1s)'); return false; }
    if (responseTime > 60000) { console.warn('⚠️ Challenge timeout'); return false; }
    return answer && answer.trim() === challenge.a;
  };

  window.__visualCaptcha = () => {
    const shapes = ['⭐', '❤️', '🔷', '🔶', '⬛'];
    const targetShape = shapes[Math.floor(Math.random() * shapes.length)];
    const grid = [];
    for (let i = 0; i < 9; i++) { if (i === 4) { grid.push(targetShape); } else { const randomShape = shapes[Math.floor(Math.random() * shapes.length)]; grid.push(randomShape); } }
    const displayGrid = `\n          ${grid[0]} ${grid[1]} ${grid[2]}\n          ${grid[3]} ${grid[4]} ${grid[5]}\n          ${grid[6]} ${grid[7]} ${grid[8]}\n        `;
    const answer = prompt('🔐 CAPTCHA Verification\n\nFind the shape in the CENTER:\n\n' + displayGrid + '\n\nEnter the center shape:');
    return answer && answer.trim() === targetShape;
  };

  Object.freeze(Object.prototype);
  Object.freeze(Array.prototype);

  let windowBlurCount = 0;
  window.addEventListener('blur', () => { windowBlurCount++; if (windowBlurCount > 20) { console.warn('⚠️ Excessive tab switching detected'); updateThreatScore(5, 'Suspicious tab switching behavior'); } });

  window.addEventListener('beforeprint', (e) => { e.preventDefault(); console.warn('🚨 Print attempt blocked'); updateThreatScore(10, 'Print attempt detected'); return false; });

  if (window.document.documentElement.getAttribute('webdriver')) updateThreatScore(50, 'Selenium WebDriver detected');
  if (window.navigator.languages.length === 0) updateThreatScore(20, 'No browser languages (automation indicator)');

  if (navigator.getBattery) { navigator.getBattery().then((battery) => { if (battery.charging && battery.level === 1) { console.log('🔌 Desktop/VM device detected'); } }).catch(() => { updateThreatScore(5, 'Battery API unavailable'); }); }

  if (window.top !== window.self) { updateThreatScore(50, 'Page loaded in iframe (clickjacking attempt)'); window.top.location = window.self.location; }

  let domModifications = 0;
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.target.id !== 'pendingOrders' && mutation.target.id !== 'doneOrders' && mutation.target.id !== 'deletedOrders' && !mutation.target.classList.contains('order-card')) {
        domModifications++;
        if (domModifications > 50) { console.warn('🚨 Excessive DOM modifications detected'); updateThreatScore(20, 'Suspicious DOM tampering'); domModifications = 0; }
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeOldValue: true });

  const forensicLog = [];
  const MAX_FORENSIC_LOGS = 100;
  const logSecurityEvent = (event, severity, details) => {
    const entry = { timestamp: new Date().toISOString(), event, severity, details, userAgent: navigator.userAgent.substring(0,50), ip: window.__ipAddress ? window.__ipAddress() : 'Unknown', threatScore: window.__threatScore ? window.__threatScore() : 0 };
    forensicLog.push(entry);
    if (forensicLog.length > MAX_FORENSIC_LOGS) forensicLog.shift();
    try { sessionStorage.setItem('security_forensics', JSON.stringify(forensicLog.slice(-50))); } catch (e) {}
    if (severity === 'critical') console.error('🚨 CRITICAL SECURITY EVENT:', entry);
  };
  window.__forensicLog = forensicLog;
  window.__logSecurityEvent = logSecurityEvent;
  logSecurityEvent('PAGE_ACCESS', vmIndicators.length > 0 ? 'high' : 'low', { vmIndicators, deviceId: deviceId.substring(0,30) });
  window.__deviceId = deviceId;
  window.__accessKey = ACCESS_KEY;
  window.__deviceKey = DEVICE_KEY;
  window.__loadAttemptKey = LOAD_ATTEMPT_KEY;
  window.__devtoolsOpen = () => devtoolsOpen;
  window.__vmIndicators = vmIndicators;
  window.__ipAddress = () => ipAddress;
  window.__userLocation = () => userLocation;

  // Backend API Configuration
  const BACKEND_URL = localStorage.getItem('backend_url') || 'http://localhost:3000';
  let authToken = localStorage.getItem('admin_token');
  let orders = [];
  let isLoading = false;

  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 15 * 60 * 1000;
  const ATTEMPT_RESET_TIME = 5 * 60 * 1000;
  const SESSION_TIMEOUT = 30 * 60 * 1000;
  const SESSION_WARNING_TIME = 25 * 60 * 1000;

  let loginAttempts = parseInt(localStorage.getItem('login_attempts') || '0');
  let lastAttemptTime = parseInt(localStorage.getItem('last_attempt_time') || '0');
  let lockoutUntil = parseInt(localStorage.getItem('lockout_until') || '0');
  let lastActivityTime = Date.now();
  let sessionTimeoutTimer = null;
  let sessionWarningShown = false;

  function resetActivityTimer() { lastActivityTime = Date.now(); sessionWarningShown = false; if (authToken) startSessionTimeout(); }

  function startSessionTimeout() { if (sessionTimeoutTimer) clearTimeout(sessionTimeoutTimer); sessionTimeoutTimer = setTimeout(() => { const inactiveTime = Date.now() - lastActivityTime; if (inactiveTime >= SESSION_TIMEOUT) { showNotification('⏱️ Session expired due to inactivity', 'warning'); setTimeout(() => { localStorage.removeItem('admin_token'); authToken = null; location.reload(); }, 2000); } else if (inactiveTime >= SESSION_WARNING_TIME && !sessionWarningShown) { sessionWarningShown = true; const remainingMinutes = Math.ceil((SESSION_TIMEOUT - inactiveTime) / 60000); showNotification(`⚠️ Session will expire in ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''} due to inactivity`, 'warning'); startSessionTimeout(); } else { startSessionTimeout(); } }, 60000); }

  document.addEventListener('click', resetActivityTimer);
  document.addEventListener('keypress', resetActivityTimer);
  document.addEventListener('scroll', resetActivityTimer);
  document.addEventListener('mousemove', (() => { let lastMove = 0; return (e) => { const now = Date.now(); if (now - lastMove > 5000) { lastMove = now; resetActivityTimer(); } }; })());

  if (Date.now() - lastAttemptTime > ATTEMPT_RESET_TIME) { loginAttempts = 0; localStorage.removeItem('login_attempts'); }

  function isAccountLocked() { if (lockoutUntil > Date.now()) return true; else if (lockoutUntil > 0) { lockoutUntil = 0; loginAttempts = 0; localStorage.removeItem('lockout_until'); localStorage.removeItem('login_attempts'); } return false; }

  function getRemainingLockoutTime() { const remaining = Math.ceil((lockoutUntil - Date.now()) / 60000); return remaining > 0 ? remaining : 0; }

  function getLoginDelay() { if (loginAttempts <= 2) return 0; if (loginAttempts === 3) return 2000; if (loginAttempts === 4) return 5000; return 10000; }

  (async function checkAuth() { if (!authToken) { showLoginModal(); return; } try { const response = await fetch(`${BACKEND_URL}/api/admin/verify`, { headers: { 'Authorization': `Bearer ${authToken}` } }); if (!response.ok) throw new Error('Invalid token'); console.log('✅ Authentication verified'); startSessionTimeout(); loadOrders(); } catch (error) { console.warn('⚠️ Token invalid or expired:', error.message); localStorage.removeItem('admin_token'); authToken = null; showLoginModal(); } })();

  function showLoginModal() { const modal = document.getElementById('loginModal'); const errorEl = document.getElementById('loginError'); if (isAccountLocked()) { const remainingTime = getRemainingLockoutTime(); errorEl.innerHTML = `<i class="fas fa-lock"></i> Account locked due to multiple failed attempts.<br>Try again in ${remainingTime} minute${remainingTime !== 1 ? 's' : ''}.`; errorEl.style.display = 'block'; document.getElementById('adminPassword').disabled = true; document.querySelector('#loginModal .action-button').disabled = true; } else { errorEl.style.display = 'none'; document.getElementById('adminPassword').disabled = false; document.querySelector('#loginModal .action-button').disabled = false; } modal.style.display = 'flex'; if (!isAccountLocked()) document.getElementById('adminPassword').focus(); }

  let loginStartTime = 0; const loginTimings = [];
  async function adminLogin() { const password = document.getElementById('adminPassword').value; const errorEl = document.getElementById('loginError'); const loginBtn = document.querySelector('#loginModal .action-button'); const passwordInput = document.getElementById('adminPassword'); const loginTime = Date.now(); if (loginStartTime > 0) { const timeTaken = loginTime - loginStartTime; loginTimings.push(timeTaken); if (loginTimings.length >= 3) { const recentFast = loginTimings.slice(-3).filter(t => t < 500).length; if (recentFast >= 2) { console.warn('🚨 Bot-like behavior detected - too fast'); errorEl.innerHTML = '<i class="fas fa-robot"></i> Automated access detected.'; errorEl.style.display = 'block'; return; } } } loginStartTime = loginTime; const honeypot = document.getElementById('website'); if (honeypot && honeypot.value) { console.warn('🚨 Honeypot triggered - potential bot detected'); errorEl.innerHTML = '<i class="fas fa-times-circle"></i> Authentication failed.'; errorEl.style.display = 'block'; return; } if (window.__devtoolsOpen()) console.warn('⚠️ Developer tools are open'); const threatLevel = window.__threatScore ? window.__threatScore() : 0; const challengeProbability = Math.min(0.3 + (threatLevel / 100), 0.8); if (Math.random() < challengeProbability) { if (!window.__verifyChallenge()) { errorEl.innerHTML = '<i class="fas fa-times-circle"></i> Security challenge failed.'; errorEl.style.display = 'block'; const totalFailures = parseInt(localStorage.getItem('total_security_failures') || '0'); localStorage.setItem('total_security_failures', (totalFailures + 1).toString()); return; } } if (threatLevel > 30) { const confirmed = confirm('⚠️ SECURITY ALERT\n\nSuspicious activity detected on your session.\nThreat Level: ' + threatLevel + '/100\n\nClick OK to proceed with additional verification.'); if (!confirmed) { errorEl.innerHTML = '<i class="fas fa-shield-alt"></i> Security verification cancelled.'; errorEl.style.display = 'block'; window.__logSecurityEvent('VERIFICATION_CANCELLED', 'medium', { threatLevel }); return; } if (threatLevel > 50) { if (!window.__visualCaptcha()) { errorEl.innerHTML = '<i class="fas fa-ban"></i> Visual CAPTCHA failed.'; errorEl.style.display = 'block'; window.__logSecurityEvent('CAPTCHA_FAILED', 'high', { threatLevel }); const totalFailures = parseInt(localStorage.getItem('total_security_failures') || '0'); localStorage.setItem('total_security_failures', (totalFailures + 2).toString()); return; } } if (!window.__verifyChallenge()) { errorEl.innerHTML = '<i class="fas fa-ban"></i> Advanced verification failed.'; errorEl.style.display = 'block'; window.__logSecurityEvent('CHALLENGE_FAILED', 'high', { threatLevel }); return; } } if (isAccountLocked()) { const remainingTime = getRemainingLockoutTime(); errorEl.innerHTML = `<i class="fas fa-lock"></i> Account locked. Try again in ${remainingTime} minute${remainingTime !== 1 ? 's' : ''}.`; errorEl.style.display = 'block'; return; } if (!password) { errorEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Please enter a password'; errorEl.style.display = 'block'; return; } const delay = getLoginDelay(); if (delay > 0) { loginBtn.disabled = true; passwordInput.disabled = true; errorEl.innerHTML = `<i class="fas fa-clock"></i> Please wait ${delay/1000} seconds before trying again...`; errorEl.style.display = 'block'; errorEl.style.background = 'rgba(255, 215, 0, 0.2)'; errorEl.style.borderColor = '#FFD700'; errorEl.style.color = '#FFD700'; await new Promise(resolve => setTimeout(resolve, delay)); loginBtn.disabled = false; passwordInput.disabled = false; errorEl.style.display = 'none'; } loginBtn.disabled = true; loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...'; try { const response = await fetch(`${BACKEND_URL}/api/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) }); const data = await response.json(); if (data.success) { loginAttempts = 0; localStorage.removeItem('login_attempts'); localStorage.removeItem('last_attempt_time'); localStorage.removeItem('lockout_until'); localStorage.removeItem('total_security_failures'); localStorage.setItem(window.__accessKey, 'true'); localStorage.setItem(window.__deviceKey, window.__deviceId); localStorage.removeItem(window.__loadAttemptKey); document.title = 'Admin - Customer Orders | AERIALARC'; authToken = data.token; localStorage.setItem('admin_token', authToken); const securityReport = { timestamp: new Date().toISOString(), ip: window.__ipAddress ? window.__ipAddress() : 'Unknown', location: window.__userLocation ? window.__userLocation() : null, deviceId: window.__deviceId.substring(0, 30) + '...', threatScore: window.__threatScore ? window.__threatScore() : 0, vmIndicators: window.__vmIndicators || [], userAgent: navigator.userAgent.substring(0, 50) + '...', keystrokeDynamics: keystrokeDynamics.upTimes ? Object.keys(keystrokeDynamics.upTimes).length : 0, mouseMovements: mouseMovements.length, forensicLogs: window.__forensicLog ? window.__forensicLog.length : 0 }; console.log('🔐 Security Report:', securityReport); if (window.__logSecurityEvent) window.__logSecurityEvent('LOGIN_SUCCESS', 'low', securityReport); document.getElementById('loginModal').style.display = 'none'; document.getElementById('adminPassword').value = ''; showNotification(`✅ Login successful! Device authorized.\n🛡️ Security Level: ${securityReport.threatScore === 0 ? 'MAXIMUM' : securityReport.threatScore < 20 ? 'HIGH' : securityReport.threatScore < 50 ? 'MEDIUM' : 'LOW'} | Threat: ${securityReport.threatScore}/100`, 'success'); startSessionTimeout(); loadOrders(); } else { loginAttempts++; lastAttemptTime = Date.now(); localStorage.setItem('login_attempts', loginAttempts.toString()); localStorage.setItem('last_attempt_time', lastAttemptTime.toString()); const totalFailures2 = parseInt(localStorage.getItem('total_security_failures') || '0'); localStorage.setItem('total_security_failures', (totalFailures2 + 1).toString()); if (window.__logSecurityEvent) window.__logSecurityEvent('LOGIN_FAILED', 'medium', { attempt: loginAttempts, totalFailures: totalFailures2 + 1, threatScore: window.__threatScore ? window.__threatScore() : 0 }); if (loginAttempts >= MAX_LOGIN_ATTEMPTS) { lockoutUntil = Date.now() + LOCKOUT_DURATION; localStorage.setItem('lockout_until', lockoutUntil.toString()); const lockoutMinutes = Math.ceil(LOCKOUT_DURATION / 60000); errorEl.innerHTML = `<i class="fas fa-ban"></i> Too many failed attempts!<br>Account locked for ${lockoutMinutes} minutes.`; passwordInput.disabled = true; loginBtn.disabled = true; } else { const remaining = MAX_LOGIN_ATTEMPTS - loginAttempts; errorEl.innerHTML = `<i class="fas fa-times-circle"></i> Authentication failed.<br>${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`; } errorEl.style.display = 'block'; errorEl.style.background = 'rgba(255, 68, 68, 0.2)'; errorEl.style.borderColor = '#ff4444'; errorEl.style.color = '#ff4444'; document.getElementById('adminPassword').value = ''; } } catch (error) { console.error('Login error:', error); errorEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> Connection error: ${error.message}`; errorEl.style.display = 'block'; errorEl.style.background = 'rgba(255, 68, 68, 0.2)'; errorEl.style.borderColor = '#ff4444'; errorEl.style.color = '#ff4444'; } finally { loginBtn.disabled = false; loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login'; } }

  function adminLogout() { const fullLogout = confirm('Do you want to logout from this device completely?\n\nYes = Require login again\nNo = Keep quick access'); if (sessionTimeoutTimer) clearTimeout(sessionTimeoutTimer); localStorage.removeItem('admin_token'); localStorage.removeItem('login_attempts'); localStorage.removeItem('last_attempt_time'); localStorage.removeItem('lockout_until'); if (fullLogout) { localStorage.removeItem(window.__accessKey); localStorage.removeItem(window.__deviceKey); showNotification('🔒 Device authorization removed. Full logout completed.', 'warning'); } authToken = null; location.reload(); }

  function getAuthHeaders() { return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` }; }

  document.querySelectorAll('.tab').forEach(tab => { tab.addEventListener('click', () => { const tabName = tab.dataset.tab; document.querySelectorAll('.tab').forEach(t => t.classList.remove('active')); tab.classList.add('active'); document.querySelectorAll('.orders-section').forEach(s => s.classList.remove('active')); document.getElementById(tabName + 'Section').classList.add('active'); }); });

  async function loadOrders() { if (isLoading) return; if (!authToken) { console.warn('⚠️ No authentication token. Please login.'); return; } isLoading = true; try { const response = await fetch(`${BACKEND_URL}/api/orders`, { headers: getAuthHeaders() }); if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`); const data = await response.json(); if (data.success) { orders = data.orders; localStorage.setItem('customerOrders', JSON.stringify(orders)); const pendingOrders = orders.filter(o => o.status === 'pending'); const doneOrders = orders.filter(o => o.status === 'done'); const deletedOrders = orders.filter(o => o.status === 'deleted'); document.getElementById('pendingCount').textContent = pendingOrders.length; document.getElementById('doneCount').textContent = doneOrders.length; document.getElementById('deletedCount').textContent = deletedOrders.length; renderOrders('pendingOrders', pendingOrders); renderOrders('doneOrders', doneOrders); renderOrders('deletedOrders', deletedOrders); console.log(`✅ Loaded ${orders.length} orders from backend`); } else { throw new Error(data.error || 'Failed to load orders'); } } catch (error) { console.error('❌ Error loading orders:', error); if (error.message.includes('401') || error.message.includes('403')) { showNotification('🔒 Session expired. Please login again.', 'warning'); localStorage.removeItem('admin_token'); authToken = null; setTimeout(() => showLoginModal(), 2000); isLoading = false; return; } console.warn('⚠️ Using localStorage fallback'); orders = JSON.parse(localStorage.getItem('customerOrders') || '[]'); const pendingOrders = orders.filter(o => o.status === 'pending'); const doneOrders = orders.filter(o => o.status === 'done'); const deletedOrders = orders.filter(o => o.status === 'deleted'); document.getElementById('pendingCount').textContent = pendingOrders.length; document.getElementById('doneCount').textContent = doneOrders.length; document.getElementById('deletedCount').textContent = deletedOrders.length; renderOrders('pendingOrders', pendingOrders); renderOrders('doneOrders', doneOrders); renderOrders('deletedOrders', deletedOrders); showNotification(`⚠️ Backend offline. Using local data. Error: ${error.message}`, 'warning'); } finally { isLoading = false; } }

  function showNotification(message, type = 'info') { const notification = document.createElement('div'); notification.style.cssText = `position: fixed; top: 20px; right: 20px; background: ${type === 'warning' ? 'rgba(255, 215, 0, 0.2)' : 'rgba(44, 255, 122, 0.2)'}; border: 2px solid ${type === 'warning' ? '#FFD700' : '#2cff7a'}; color: ${type === 'warning' ? '#FFD700' : '#2cff7a'}; padding: 15px 20px; border-radius: 12px; z-index: 10000; max-width: 400px; animation: slideIn 0.3s ease;`; notification.textContent = message; document.body.appendChild(notification); setTimeout(() => { notification.style.animation = 'slideOut 0.3s ease'; setTimeout(() => notification.remove(), 300); }, 5000); }

  function renderOrders(containerId, ordersList) { const container = document.getElementById(containerId); if (ordersList.length === 0) { container.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i><p>No ${containerId.includes('pending') ? 'pending' : containerId.includes('done') ? 'completed' : 'deleted'} orders</p></div>`; return; } container.innerHTML = ordersList.map(order => `...`).join(''); }

  function toggleOrderDetails(event, orderId) { if (event.target.closest('.action-button')) return; const card = event.currentTarget; card.classList.toggle('expanded'); }

  async function markAsDone(event, orderId) { event.stopPropagation(); try { const response = await fetch(`${BACKEND_URL}/api/orders/${orderId}`, { method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify({ status: 'done', completedAt: new Date().toLocaleString() }) }); const data = await response.json(); if (data.success) { showNotification('✅ Order marked as done!', 'success'); await loadOrders(); } else { throw new Error(data.error); } } catch (error) { console.error('Error updating order:', error); const orderIndex = orders.findIndex(o => o.orderId === orderId); if (orderIndex !== -1) { orders[orderIndex].status = 'done'; orders[orderIndex].completedAt = new Date().toLocaleString(); localStorage.setItem('customerOrders', JSON.stringify(orders)); loadOrders(); } showNotification('⚠️ Updated locally only. Backend unavailable.', 'warning'); } }

  async function markAsPending(event, orderId) { event.stopPropagation(); try { const response = await fetch(`${BACKEND_URL}/api/orders/${orderId}`, { method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify({ status: 'pending' }) }); const data = await response.json(); if (data.success) { showNotification('✅ Order moved to pending!', 'success'); await loadOrders(); } else { throw new Error(data.error); } } catch (error) { console.error('Error updating order:', error); const orderIndex = orders.findIndex(o => o.orderId === orderId); if (orderIndex !== -1) { orders[orderIndex].status = 'pending'; delete orders[orderIndex].completedAt; localStorage.setItem('customerOrders', JSON.stringify(orders)); loadOrders(); } showNotification('⚠️ Updated locally only. Backend unavailable.', 'warning'); } }

  async function deleteOrder(event, orderId) { event.stopPropagation(); if (!confirm('Move this order to deleted? You can restore it later.')) return; try { const response = await fetch(`${BACKEND_URL}/api/orders/${orderId}`, { method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify({ status: 'deleted', deletedAt: new Date().toLocaleString() }) }); const data = await response.json(); if (data.success) { showNotification('🗑️ Order moved to deleted!', 'success'); await loadOrders(); } else { throw new Error(data.error); } } catch (error) { console.error('Error deleting order:', error); const orderIndex = orders.findIndex(o => o.orderId === orderId); if (orderIndex !== -1) { orders[orderIndex].status = 'deleted'; orders[orderIndex].deletedAt = new Date().toLocaleString(); localStorage.setItem('customerOrders', JSON.stringify(orders)); loadOrders(); } showNotification('⚠️ Updated locally only. Backend unavailable.', 'warning'); } }

  async function restoreOrder(event, orderId) { event.stopPropagation(); try { const response = await fetch(`${BACKEND_URL}/api/orders/${orderId}`, { method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify({ status: 'pending' }) }); const data = await response.json(); if (data.success) { showNotification('♻️ Order restored to pending!', 'success'); await loadOrders(); } else { throw new Error(data.error); } } catch (error) { console.error('Error restoring order:', error); const orderIndex = orders.findIndex(o => o.orderId === orderId); if (orderIndex !== -1) { orders[orderIndex].status = 'pending'; delete orders[orderIndex].deletedAt; localStorage.setItem('customerOrders', JSON.stringify(orders)); loadOrders(); } showNotification('⚠️ Updated locally only. Backend unavailable.', 'warning'); } }

  window.addEventListener('storage', (e) => { if (e.key === 'customerOrders') loadOrders(); });

  setInterval(() => { if (authToken) loadOrders(); }, 30000);

  (function integrityCheck() { const devtools = /./; devtools.toString = function() { console.warn('🚨 Developer tools detected'); }; let clipboardWarningShown = false; document.getElementById('adminPassword')?.addEventListener('paste', (e) => { if (!clipboardWarningShown) { console.warn('⚠️ Password pasted from clipboard'); clipboardWarningShown = true; } }); document.addEventListener('contextmenu', (e) => { if (!authToken) e.preventDefault(); }); document.addEventListener('keydown', (e) => { if (!authToken && (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && e.keyCode === 73) || (e.ctrlKey && e.shiftKey && e.keyCode === 74) || (e.ctrlKey && e.keyCode === 85) || (e.ctrlKey && e.keyCode === 83))) { e.preventDefault(); return false; } }); if (!authToken) { document.body.style.userSelect = 'none'; document.body.style.webkitUserSelect = 'none'; document.body.style.webkitTouchCallout = 'none'; document.body.style.msUserSelect = 'none'; } const originalCreateElement = document.createElement; document.createElement = function(tagName) { const element = originalCreateElement.call(document, tagName); if (tagName.toLowerCase() === 'script' && !authToken) { console.warn('🚨 Unauthorized script creation attempt blocked'); return document.createTextNode(''); } return element; }; let integrityCheckCount = 0; setInterval(() => { integrityCheckCount++; if (typeof adminLogin !== 'function' || typeof loadOrders !== 'function') { console.error('🚨 Critical function tampering detected!'); localStorage.setItem('total_security_failures', '999'); location.reload(); } if (adminLogin.toString().length < 500 || loadOrders.toString().length < 200) { console.error('🚨 Function modification detected!'); location.reload(); } if (window.__threatScore && window.__threatScore() > 80) { console.error('🚨 Critical threat level reached during session!'); localStorage.clear(); location.reload(); } if (integrityCheckCount % 6 === 0) { const start = performance.now(); (function() {}).constructor('debugger')(); const elapsed = performance.now() - start; if (elapsed > 100) { console.error('🚨 Debugger breakpoint detected!'); const totalFailures3 = parseInt(localStorage.getItem('total_security_failures') || '0'); localStorage.setItem('total_security_failures', (totalFailures3 + 3).toString()); } } }, 5000); let clipboardReadAttempts = 0; document.addEventListener('copy', () => { clipboardReadAttempts++; if (clipboardReadAttempts > 10) { console.warn('⚠️ Excessive clipboard activity detected'); } }); document.addEventListener('keyup', (e) => { if (e.key === 'PrintScreen') { console.warn('⚠️ Screenshot attempt detected'); navigator.clipboard.writeText('').catch(() => {}); } }); })();

  (async function testConnection() { try { const response = await fetch(`${BACKEND_URL}/`); if (response.ok) console.log('✅ Backend connected:', BACKEND_URL); } catch (error) { console.warn('⚠️ Backend connection failed:', error.message); } })();

  function showBackendConfig() { document.getElementById('configModal').style.display = 'flex'; document.getElementById('backendUrlInput').value = BACKEND_URL; }
  function closeBackendConfig() { document.getElementById('configModal').style.display = 'none'; }
  async function testBackendConnection() { const url = document.getElementById('backendUrlInput').value.trim(); const statusEl = document.getElementById('connectionStatus'); statusEl.style.display = 'block'; statusEl.style.background = 'rgba(255, 215, 0, 0.2)'; statusEl.style.border = '1px solid #FFD700'; statusEl.style.color = '#FFD700'; statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing connection...'; try { const response = await fetch(`${url}/`); if (response.ok) { statusEl.style.background = 'rgba(44, 255, 122, 0.2)'; statusEl.style.border = '1px solid #2cff7a'; statusEl.style.color = '#2cff7a'; statusEl.innerHTML = '<i class="fas fa-check-circle"></i> Connection successful!'; } else throw new Error(`HTTP ${response.status}`); } catch (error) { statusEl.style.background = 'rgba(255, 68, 68, 0.2)'; statusEl.style.border = '1px solid #ff4444'; statusEl.style.color = '#ff4444'; statusEl.innerHTML = `<i class="fas fa-times-circle"></i> Connection failed: ${error.message}`; } }
  function saveBackendConfig() { const url = document.getElementById('backendUrlInput').value.trim(); if (url) { localStorage.setItem('backend_url', url); location.reload(); } }

})();

// SSL-PENTATHLON-ACCOUNT1.html page-specific legacy functions
// Expose global functions to preserve onclick handlers from migrated HTML
(function(){
  'use strict';

  window.addToBasket = window.addToBasket || function(itemId, itemName, itemPrice) {
    try {
      const basket = JSON.parse(localStorage.getItem('shoppingBasket') || '[]');
      basket.push({ id: itemId, name: itemName, price: itemPrice });
      localStorage.setItem('shoppingBasket', JSON.stringify(basket));
      alert('Added to basket: ' + itemName);
    } catch (e) { console.error('addToBasket error', e); }
  };

  window.purchaseNow = window.purchaseNow || function(itemId) {
    try {
      const btn = document.querySelector('.purchase-btn');
      if (btn) {
        btn.classList.add('purchasing');
        btn.innerHTML = '<div class="loader"></div> Processing...';
      }
      setTimeout(() => { window.location.href = 'PaymentMethods.html'; }, 1400);
    } catch (e) { console.error('purchaseNow error', e); window.location.href = 'PaymentMethods.html'; }
  };

})();

// Appended from RLCS-CHALLENGER-ACCOUNT1.html: normalize global addToBasket/purchaseNow usage
(function(){
  'use strict';

  const existingAdd = window.addToBasket;
  window.addToBasket = function(itemOrId, maybeName, maybePrice) {
    try {
      // If caller passed an object (preferred), normalize and use existing handler
      if (typeof itemOrId === 'object' && itemOrId !== null) {
        const item = itemOrId;
        // Normalize fields for older handlers
        const normalized = {
          title: item.title || item.name || item.name || 'Item',
          price: item.price || item.priceValue || item.price || '$0',
          platform: item.type || item.platform || ''
        };
        // If there's an internal addToBasket function defined in the module scope, try that
        if (typeof window.__internalAddToBasket === 'function') {
          return window.__internalAddToBasket(normalized);
        }
        // If original global exists and expects (id,name,price), attempt to map
        if (typeof existingAdd === 'function') {
          try { return existingAdd(normalized.id || normalized.title, normalized.title, normalized.price); } catch (e) {}
        }
        // Fallback: store in shoppingBasket localStorage
        const basket = JSON.parse(localStorage.getItem('shoppingBasket') || '[]');
        const exists = basket.find(i => (i.name || i.title) === (item.name || item.title));
        if (!exists) {
          basket.push({ name: item.name || item.title, price: item.price || item.priceValue || normalized.price, type: item.type || item.platform || '', url: item.url || window.location.href });
          localStorage.setItem('shoppingBasket', JSON.stringify(basket));
          alert('Added to basket! Go to the main page to view your basket.');
        } else {
          alert('This item is already in your basket!');
        }
        return;
      }

      // Otherwise delegate to existing handler signature
      if (typeof existingAdd === 'function') return existingAdd(itemOrId, maybeName, maybePrice);
    } catch (e) { console.error('addToBasket wrapper error', e); }
  };

  const existingPurchase = window.purchaseNow;
  window.purchaseNow = function(btnOrArg) {
    try {
      const btn = (btnOrArg instanceof HTMLElement) ? btnOrArg : document.querySelector('.purchase-btn');
      if (btn) {
        btn.classList.remove('purchased');
        btn.classList.add('purchasing');
        btn.innerHTML = 'Purchasing <span class="loader"></span>';
        btn.disabled = true;
      }
      // Redirect to payment page with params used by RLCS page
      setTimeout(() => { window.location.href = 'PaymentMethods.html?service=RLCS Challenger Account&price=349.99&type=account'; }, 1200);
      return;
    } catch (e) { try { if (typeof existingPurchase === 'function') return existingPurchase(btnOrArg); } catch (err) {} console.error('purchaseNow wrapper error', e); }
  };

})();
