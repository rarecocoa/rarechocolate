/* ==========================================================
   RARE COCOA™ — Global Shopping Cart System
   Persistent State · Premium Slide-out Drawer · Dynamic Injection
   ========================================================== */

const CartSystem = {
  storageKey: 'rarecocoa_cart',
  items: [],

  init() {
    this.loadCart();
    this.injectCartMarkup();
    this.setupListeners();
    this.updateUI();
  },

  loadCart() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      this.items = stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
      this.items = [];
    }
  },

  saveCart() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
    this.updateUI();
  },

  injectCartMarkup() {
    // 1. Inject Cart Button into Nav Bar
    const navInner = document.querySelector('.nav-inner');
    if (navInner && !document.getElementById('navCartBtn')) {
      const cartBtn = document.createElement('button');
      cartBtn.id = 'navCartBtn';
      cartBtn.className = 'nav-cart-btn';
      cartBtn.setAttribute('aria-label', 'Open Cart');
      cartBtn.innerHTML = `
        <svg class="nav-cart-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <span class="nav-cart-badge" id="navCartBadge">0</span>
      `;
      
      // Insert before mobile menu button if exists, otherwise append
      const menuBtn = document.getElementById('menuBtn');
      if (menuBtn) {
        navInner.insertBefore(cartBtn, menuBtn);
      } else {
        navInner.appendChild(cartBtn);
      }
    }

    // 2. Inject Cart Drawer and Backdrop at body bottom
    if (!document.getElementById('cartDrawer')) {
      const backdrop = document.createElement('div');
      backdrop.id = 'cartBackdrop';
      backdrop.className = 'cart-backdrop';
      document.body.appendChild(backdrop);

      const drawer = document.createElement('div');
      drawer.id = 'cartDrawer';
      drawer.className = 'cart-drawer';
      drawer.innerHTML = `
        <div class="cart-header">
          <h3>Your Luxury Bag</h3>
          <button class="cart-close-btn" id="cartCloseBtn" aria-label="Close Cart">&times;</button>
        </div>
        <div class="cart-items" id="cartItemsContainer"></div>
        <div class="cart-footer">
          <div class="cart-summary-row">
            <span>Subtotal</span>
            <span class="cart-subtotal-val" id="cartSubtotalVal">₹0</span>
          </div>
          <p class="cart-shipping-note">Complimentary premium white-glove shipping on all orders.</p>
          <button class="cart-checkout-btn" id="cartCheckoutBtn">Proceed to Checkout</button>
        </div>
      `;
      document.body.appendChild(drawer);
    }
  },

  setupListeners() {
    const backdrop = document.getElementById('cartBackdrop');
    const drawer = document.getElementById('cartDrawer');
    const openBtn = document.getElementById('navCartBtn');
    const closeBtn = document.getElementById('cartCloseBtn');
    const checkoutBtn = document.getElementById('cartCheckoutBtn');

    if (openBtn) openBtn.addEventListener('click', () => this.openCart());
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeCart());
    if (backdrop) backdrop.addEventListener('click', () => this.closeCart());

    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (this.items.length === 0) return;
        this.showCheckoutForm();
      });
    }
  },

  openCart() {
    const backdrop = document.getElementById('cartBackdrop');
    const drawer = document.getElementById('cartDrawer');
    if (backdrop && drawer) {
      backdrop.classList.add('active');
      drawer.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  closeCart() {
    const backdrop = document.getElementById('cartBackdrop');
    const drawer = document.getElementById('cartDrawer');
    if (backdrop && drawer) {
      backdrop.classList.remove('active');
      drawer.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  addItem(product, qty = 1) {
    // Generate a unique ID based on item name and options
    const optionsKey = product.options 
      ? Object.entries(product.options).sort().map(([k, v]) => `${k}:${v}`).join('|')
      : '';
    const itemId = `${product.name}-${optionsKey}`.replace(/\s+/g, '-').toLowerCase();

    const existingIndex = this.items.findIndex(item => item.id === itemId);

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += qty;
    } else {
      const initialQty = Math.max(qty, product.minQty || 1);
      this.items.push({
        id: itemId,
        name: product.name,
        subtitle: product.subtitle || '',
        icon: product.icon || '🍫',
        price: product.price || 15.00,
        options: product.options || {},
        quantity: initialQty,
        category: product.category || 'Other',
        minQty: product.minQty || 1
      });
    }

    this.saveCart();
    // Do not automatically open cart to avoid disrupting the user experience
    this.triggerNotification(`Added ${qty} ${product.name} to your selection`);
  },

  updateQuantity(itemId, change) {
    const index = this.items.findIndex(item => item.id === itemId);
    if (index === -1) return;

    const item = this.items[index];
    const targetQty = item.quantity + change;

    if (targetQty < 1) {
      this.items.splice(index, 1);
      this.saveCart();
      return;
    }

    const minQty = item.minQty || 1;
    if (change < 0 && targetQty < minQty) {
      this.triggerNotification(`Minimum order quantity for ${item.name} is ${minQty}`);
      return;
    }

    item.quantity = targetQty;
    this.saveCart();
  },

  removeItem(itemId) {
    this.items = this.items.filter(item => item.id !== itemId);
    this.saveCart();
  },

  getCartCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getCartTotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  updateUI() {
    // 1. Update Badge
    const badge = document.getElementById('navCartBadge');
    const count = this.getCartCount();
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }

    // 2. Render Cart Items
    const container = document.getElementById('cartItemsContainer');
    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon">👜</div>
          <h4>Your luxury bag is empty</h4>
          <p>Explore our exquisite collections and select your premium chocolates.</p>
          <a href="index.html#collections" class="cart-explore-btn" id="cartExploreBtn">Explore Collections</a>
        </div>
      `;
      // Close cart drawer click handler for explore button
      const exploreBtn = document.getElementById('cartExploreBtn');
      if (exploreBtn) exploreBtn.addEventListener('click', () => this.closeCart());
    } else {
      container.innerHTML = this.items.map(item => {
        // Format options list
        const optionsHtml = Object.entries(item.options)
          .map(([key, value]) => `
            <div class="cart-item-option-row">
              <span class="option-name">${key}:</span>
              <span class="option-val">${value}</span>
            </div>
          `).join('');

        return `
          <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-icon">
              ${item.icon && /\.(png|jpe?g|svg|webp|avif)(\?.*)?$/i.test(item.icon) 
                ? `<img src="${item.icon}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">` 
                : item.icon}
            </div>
            <div class="cart-item-details">
              <div class="cart-item-header">
                <h4 class="cart-item-title">${item.name}</h4>
                <button class="cart-item-remove" onclick="CartSystem.removeItem('${item.id}')" aria-label="Remove item">&times;</button>
              </div>
              <p class="cart-item-subtitle">${item.subtitle}</p>
              <div class="cart-item-options-list">
                ${optionsHtml}
              </div>
              <div class="cart-item-footer">
                <div class="cart-item-qty">
                  <button class="qty-btn" onclick="CartSystem.updateQuantity('${item.id}', -1)" aria-label="Decrease quantity">-</button>
                  <span class="qty-num">${item.quantity}</span>
                  <button class="qty-btn" onclick="CartSystem.updateQuantity('${item.id}', 1)" aria-label="Increase quantity">+</button>
                  ${item.minQty > 1 ? `<span style="font-size:0.7rem;color:var(--text-muted);margin-left:6px;align-self:center;">(Min: ${item.minQty})</span>` : ''}
                </div>
                <span class="cart-item-price">₹${Math.round(item.price * item.quantity)}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 3. Update Subtotal
    const subtotalEl = document.getElementById('cartSubtotalVal');
    if (subtotalEl) {
      subtotalEl.textContent = `₹${Math.round(this.getCartTotal())}`;
    }

    // 4. Update checkout button disabled state
    const checkoutBtn = document.getElementById('cartCheckoutBtn');
    if (checkoutBtn) {
      if (this.items.length === 0) {
        checkoutBtn.setAttribute('disabled', 'true');
        checkoutBtn.classList.add('disabled');
      } else {
        checkoutBtn.removeAttribute('disabled');
        checkoutBtn.classList.remove('disabled');
      }
    }
  },

  triggerNotification(message) {
    // Remove existing notifications
    const existing = document.querySelector('.cart-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'cart-toast';
    toast.innerHTML = `
      <span class="toast-icon">✨</span>
      <span class="toast-msg">${message}</span>
    `;
    document.body.appendChild(toast);

    // Fade in
    setTimeout(() => toast.classList.add('active'), 50);

    // Fade out and remove
    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  },

  showCheckoutForm() {
    CartSystem.closeCart();

    const MSGS = {
      'Vijayawada': "Our luxury chocolates are extremely temperature-sensitive, which is why we deliver them in person. Please ensure you or someone else is available to receive them. If requested, we can hand the delivery over to a neighbor, but we absolutely will not leave it outside or on a shoe rack. We want you to experience pure, exquisite luxury—not dead chocolates.",
      'Andhra Pradesh, Chennai, Bangalore': "Our chocolates are temperature-sensitive, so we only deliver to cities and towns with direct Andhra Pradesh bus connectivity, using insulated packaging with thermal boxes. Please ensure you are available at the transit point to collect your order. For towns without direct bus connectivity, we cannot send temperature-sensitive items (chocolates, clusters, dragées). However, we can ship slabs, hot chocolate, and butter via courier. Please review your cart to confirm.",
      'Hyderabad': "Our luxury chocolates are extremely temperature-sensitive, which is why I personally deliver them to your door. Please ensure you or someone else is available to receive them. If requested, we can hand the delivery over to a neighbor, but we absolutely will not leave it outside or on a shoe rack. We want you to experience pure, exquisite luxury—not dead chocolates.",
      'Other States': "As our signature chocolates are highly temperature-sensitive, we cannot ship chocolates, clusters, or dragées to other states. However, we can safely deliver slabs, hot chocolate, and butter via standard courier services. Please review your cart to make sure your selection only contains courier-friendly products."
    };

    // SCREEN 1: Location tile selection
    const locOverlay = document.createElement('div');
    locOverlay.className = 'checkout-form-overlay';
    locOverlay.id = 'checkoutLocOverlay';
    locOverlay.innerHTML = `
      <div class="checkout-form-card loc-select-card">
        <button class="loc-close-btn" id="locOverlayClose" aria-label="Close">&times;</button>
        <h3>Where are you?</h3>
        <p>Select your region to see delivery details</p>
        <div class="location-options">
          <label class="location-tile">
            <input type="radio" name="deliveryLocation" value="Vijayawada">
            <span class="location-tile-content">
              <span class="loc-icon">📍</span>
              <span class="loc-text">
                <span class="location-name">Vijayawada</span>
                <span class="location-sub">In-Person Delivery</span>
              </span>
            </span>
          </label>
          <label class="location-tile">
            <input type="radio" name="deliveryLocation" value="Andhra Pradesh, Chennai, Bangalore">
            <span class="location-tile-content">
              <span class="loc-icon">🚌</span>
              <span class="loc-text">
                <span class="location-name">Andhra Pradesh · Chennai · Bangalore</span>
                <span class="location-sub">Andhra Pradesh Connectivity</span>
              </span>
            </span>
          </label>
          <label class="location-tile">
            <input type="radio" name="deliveryLocation" value="Hyderabad">
            <span class="location-tile-content">
              <span class="loc-icon">🏙️</span>
              <span class="loc-text">
                <span class="location-name">Hyderabad</span>
                <span class="location-sub">Personal Delivery</span>
              </span>
            </span>
          </label>
          <label class="location-tile">
            <input type="radio" name="deliveryLocation" value="Other States">
            <span class="location-tile-content">
              <span class="loc-icon">📦</span>
              <span class="loc-text">
                <span class="location-name">Other States</span>
                <span class="location-sub">Courier (temp-safe items only)</span>
              </span>
            </span>
          </label>
        </div>
      </div>
    `;
    document.body.appendChild(locOverlay);

    document.getElementById('locOverlayClose').addEventListener('click', () => {
      locOverlay.remove();
      CartSystem.openCart();
    });

    const showWarningPopup = (loc) => {
      const existing = document.getElementById('locWarnOverlay');
      if (existing) existing.remove();

      const isOther = loc === 'Other States';
      const warnOverlay = document.createElement('div');
      warnOverlay.className = 'checkout-form-overlay loc-warn-overlay';
      warnOverlay.id = 'locWarnOverlay';
      warnOverlay.innerHTML = `
        <div class="checkout-form-card loc-warn-card">
          <button class="loc-close-btn" id="locWarnClose" aria-label="Close">&times;</button>
          <div class="loc-warn-region-badge">${loc}</div>
          <div class="location-warning-box" style="color: #1A0E08 !important;">${MSGS[loc]}</div>
          ${!isOther ? `
            <div class="checkbox-group" id="agreeGroup">
              <label class="checkbox-label" style="color: #1A0E08 !important;">
                <input type="checkbox" id="agreeBox">
                <span>I understand and agree to proceed</span>
              </label>
            </div>
            <div class="checkout-form-actions">
              <button type="button" class="checkout-submit-btn" id="btnProceed" disabled>Proceed to Delivery Details</button>
              <button type="button" class="checkout-cancel-btn" id="btnChangeRegion">← Change Region</button>
            </div>
          ` : `
            <div class="checkout-form-actions other-states-actions">
              <button type="button" class="checkout-submit-btn" id="btnOtherProceed">Proceed to Delivery</button>
              <button type="button" class="checkout-cancel-btn" id="btnReviewCart">Review Cart</button>
            </div>
          `}
        </div>
      `;
      document.body.appendChild(warnOverlay);

      const closeWarn = () => {
        warnOverlay.remove();
        locOverlay.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
      };
      document.getElementById('locWarnClose').addEventListener('click', closeWarn);

      if (!isOther) {
        const agreeBox = document.getElementById('agreeBox');
        const btnProceed = document.getElementById('btnProceed');
        agreeBox.addEventListener('change', () => {
          btnProceed.disabled = !agreeBox.checked;
        });
        btnProceed.addEventListener('click', () => {
          warnOverlay.remove();
          locOverlay.remove();
          CartSystem.showDeliveryForm(loc);
        });
        document.getElementById('btnChangeRegion').addEventListener('click', closeWarn);
      } else {
        document.getElementById('btnOtherProceed').addEventListener('click', () => {
          warnOverlay.remove();
          locOverlay.remove();
          CartSystem.showDeliveryForm(loc);
        });
        document.getElementById('btnReviewCart').addEventListener('click', () => {
          warnOverlay.remove();
          locOverlay.remove();
          CartSystem.openCart();
        });
      }
    };

    locOverlay.querySelectorAll('input[type="radio"]').forEach(r => {
      r.addEventListener('change', () => showWarningPopup(r.value));
    });
  },

  showDeliveryForm(location) {
    const needsMapLink = location === 'Vijayawada' || location === 'Hyderabad';

    const overlay = document.createElement('div');
    overlay.className = 'checkout-form-overlay';
    overlay.id = 'checkoutFormOverlay';
    overlay.innerHTML = `
      <div class="checkout-form-card">
        <h3>Delivery Details</h3>
        <p>Please enter your details to place your order via WhatsApp.</p>
        <form id="checkoutDetailsForm">
          <div class="checkout-form-group">
            <label for="checkoutName">Full Name</label>
            <input type="text" id="checkoutName" required placeholder="e.g. Praveen Kumar">
          </div>
          <div class="checkout-form-group">
            <label for="checkoutPhone">Phone Number</label>
            <input type="tel" id="checkoutPhone" required placeholder="e.g. 9876543210">
          </div>
          <div class="checkout-form-group">
            <label for="checkoutAddress">Delivery Address</label>
            <textarea id="checkoutAddress" required placeholder="e.g. Flat 304, Royal Apartments, HSR Layout" rows="3"></textarea>
          </div>
          ${needsMapLink ? `
          <div class="checkout-form-group" style="margin-top: -10px; margin-bottom: 20px;">
            <label for="checkoutMapsLink" style="font-weight: 600; color: var(--accent);">Paste your Google Maps Location Link</label>
            <input type="url" id="checkoutMapsLink" required placeholder="e.g., https://maps.app.goo.gl/..." style="border-color: var(--accent-light);">
            <button type="button" class="maps-help-link-btn" id="mapsHelpBtn">How to find and copy your location link?</button>
          </div>
          ` : ''}
          <div class="checkout-form-group">
            <label for="checkoutPincode">Delivery Pincode</label>
            <input type="text" id="checkoutPincode" required placeholder="e.g. 560001" pattern="^[0-9]{6}$" maxlength="6">
          </div>
          <div class="checkout-form-actions">
            <button type="submit" class="checkout-submit-btn" id="checkoutSubmitBtn" disabled>Send Order via WhatsApp</button>
            <button type="button" class="checkout-cancel-btn" id="btnBackToLoc">← Back</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);

    const form = document.getElementById('checkoutDetailsForm');
    const nameInput = document.getElementById('checkoutName');
    const phoneInput = document.getElementById('checkoutPhone');
    const addressInput = document.getElementById('checkoutAddress');
    const pincodeInput = document.getElementById('checkoutPincode');
    const mapsLinkInput = document.getElementById('checkoutMapsLink');
    const submitBtn = document.getElementById('checkoutSubmitBtn');

    const validateForm = () => {
      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const address = addressInput.value.trim();
      const pincode = pincodeInput.value.trim();
      const mapsLink = needsMapLink ? (mapsLinkInput?.value.trim() || '') : '';

      const isPincodeValid = /^[0-9]{6}$/.test(pincode);
      const isMapsValid = !needsMapLink || (mapsLink !== '');

      if (name && phone && address && isPincodeValid && isMapsValid) {
        submitBtn.removeAttribute('disabled');
      } else {
        submitBtn.setAttribute('disabled', 'true');
      }
    };

    [nameInput, phoneInput, addressInput, pincodeInput].forEach(input => {
      input.addEventListener('input', validateForm);
    });
    if (needsMapLink && mapsLinkInput) {
      mapsLinkInput.addEventListener('input', validateForm);
    }

    document.getElementById('btnBackToLoc').addEventListener('click', () => {
      overlay.remove();
      CartSystem.showCheckoutForm();
    });

    if (needsMapLink) {
      document.getElementById('mapsHelpBtn').addEventListener('click', () => {
        const helpModal = document.createElement('div');
        helpModal.className = 'checkout-form-overlay maps-help-overlay';
        helpModal.id = 'mapsHelpModal';
        helpModal.innerHTML = `
          <div class="checkout-form-card maps-help-card">
            <button class="loc-close-btn" id="mapsHelpClose" aria-label="Close">&times;</button>
            <h3>How to Copy Your Location Link</h3>
            
            <div class="maps-slider">
              <div class="maps-slides-container" id="mapsSlidesContainer">
                <div class="maps-slide">
                  <img src="assets/instruction_1.jpg" alt="Step 1" onerror="this.src='https://placehold.co/600x800/1a0e08/ffffff?text=1.+Open+Google+Maps'">
                  <p><strong>Step 1:</strong> Open <strong>Google Maps</strong> app on your mobile phone.</p>
                </div>
                <div class="maps-slide">
                  <img src="assets/instruction_2.jpg" alt="Step 2" onerror="this.src='https://placehold.co/600x800/1a0e08/ffffff?text=2.+Long-press+exact+location'">
                  <p><strong>Step 2:</strong> Long-press on your exact delivery location until a red pin drops.</p>
                </div>
                <div class="maps-slide">
                  <img src="assets/instruction_3.png" alt="Step 3" onerror="this.src='https://placehold.co/600x800/1a0e08/ffffff?text=3.+Tap+on+Dropped+Pin+bar'">
                  <p><strong>Step 3:</strong> Tap on the <strong>Dropped Pin</strong> address bar that appears at the bottom.</p>
                </div>
                <div class="maps-slide">
                  <img src="assets/instruction_4.jpg" alt="Step 4" onerror="this.src='https://placehold.co/600x800/1a0e08/ffffff?text=4.+Tap+Share+and+select+Copy+Link'">
                  <p><strong>Step 4:</strong> Tap the <strong>Share</strong> button and select <strong>Copy Link</strong> to save it to your clipboard.</p>
                </div>
              </div>
              
              <div class="maps-slider-nav">
                <button type="button" class="maps-nav-btn" id="mapsPrevBtn" disabled>← Prev</button>
                <div class="maps-slider-dots">
                  <span class="maps-dot active" data-index="0"></span>
                  <span class="maps-dot" data-index="1"></span>
                  <span class="maps-dot" data-index="2"></span>
                  <span class="maps-dot" data-index="3"></span>
                </div>
                <button type="button" class="maps-nav-btn" id="mapsNextBtn">Next →</button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(helpModal);

        // Slide logic
        const container = document.getElementById('mapsSlidesContainer');
        const dots = helpModal.querySelectorAll('.maps-dot');
        const prevBtn = document.getElementById('mapsPrevBtn');
        const nextBtn = document.getElementById('mapsNextBtn');
        let currentIdx = 0;

        const updateSlider = (idx) => {
          currentIdx = idx;
          container.style.transform = `translateX(-${currentIdx * 25}%)`;
          dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIdx);
          });
          prevBtn.disabled = currentIdx === 0;
          nextBtn.disabled = currentIdx === 3;
        };

        prevBtn.addEventListener('click', () => {
          if (currentIdx > 0) updateSlider(currentIdx - 1);
        });
        nextBtn.addEventListener('click', () => {
          if (currentIdx < 3) updateSlider(currentIdx + 1);
        });

        document.getElementById('mapsHelpClose').addEventListener('click', () => helpModal.remove());
        helpModal.addEventListener('click', (e) => { if (e.target === helpModal) helpModal.remove(); });
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const address = addressInput.value.trim();
      const pincode = pincodeInput.value.trim();
      const mapsLink = needsMapLink ? (mapsLinkInput?.value.trim() || '') : '';

      if (!name || !phone || !address || !pincode) { alert('Please fill out all fields.'); return; }
      if (needsMapLink && !mapsLink) { alert('Please paste your Google Maps Location Link.'); return; }
      if (!/^[0-9]{6}$/.test(pincode)) { alert('Please enter a valid 6-digit pincode.'); return; }

      let message = `*RARE COCOA™* 🍫\n_The Soul of Chocolate_\n=================================\n`;
      message += `• *Delivery Region:* ${location}\n`;
      if (location !== 'Other States') message += `• *Temperature Agreement:* Accepted ✓\n`;
      message += `• *Delivery Pincode:* ${pincode}\n=================================\n\n`;
      message += `*Recipient Information:*\n• *Name:* ${name}\n• *Contact:* ${phone}\n• *Address:* ${address}\n`;
      if (mapsLink) message += `• *Location Link:* ${mapsLink}\n`;
      message += `\n*Curated Selection:*\n`;

      const categories = {};
      this.items.forEach(item => {
        const cat = item.category || 'Other';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(item);
      });
      Object.entries(categories).forEach(([categoryName, itemsList]) => {
        message += `\n*■ ${categoryName}*\n`;
        itemsList.forEach(item => {
          let optionsStr = '';
          if (item.options && Object.keys(item.options).length > 0) {
            optionsStr = Object.entries(item.options).map(([k, v]) => {
              let cleanedKey = k.replace(/^(Choose|Enter)\s+(your\s+)?/i, '');
              cleanedKey = cleanedKey.charAt(0).toUpperCase() + cleanedKey.slice(1);
              const cleanedVal = v.replace(/\s*\(?[₹$]\s*\d+\)?/g, '');
              return `    _• ${cleanedKey}: ${cleanedVal}_`;
            }).join('\n');
          }
          message += `• *${item.name}* (Qty: ${item.quantity})\n`;
          if (optionsStr) message += `${optionsStr}\n`;
          message += `  _Price: ₹${Math.round(item.price * item.quantity)}_\n\n`;
        });
      });
      message += `---------------------------------\n*Total Order Value:* ₹${Math.round(this.getCartTotal())}\n---------------------------------\n_Thank you for choosing Rare Cocoa™._ ✨`;

      window.open(`https://api.whatsapp.com/send?phone=917674931380&text=${encodeURIComponent(message)}`, '_blank');
      overlay.remove();
      this.showCheckoutSuccess();
    });
  },

  showCheckoutSuccess() {
    this.closeCart();
    
    // Create popup modal
    const overlay = document.createElement('div');
    overlay.className = 'checkout-success-overlay';
    overlay.innerHTML = `
      <div class="checkout-success-card">
        <div class="success-icon">✨</div>
        <h2>Order Received With Care</h2>
        <p class="success-message">
          Thank you for choosing Rare Cocoa™. Praveen and the culinary team have received your order details. 
          Because we never pre-prepare our chocolate, your order is now scheduled to be crafted fresh in this week's batch.
        </p>
        <div class="success-divider"></div>
        <p class="success-shipping">
          All orders are dispatched fresh in our weekly shipping cycle. We will contact you directly with your shipping confirmation and dispatch details.
        </p>
        <button class="success-close-btn" id="successCloseBtn">Continue Exploring</button>
      </div>
    `;
    document.body.appendChild(overlay);

    // Add listener to close
    document.getElementById('successCloseBtn').addEventListener('click', () => {
      overlay.remove();
      this.items = [];
      this.saveCart();
    });
  }
};

// Auto initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  CartSystem.init();
});

// Register Service Worker for background pre-caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => {
        console.log('Service Worker registered successfully with scope:', reg.scope);
      })
      .catch(err => {
        console.error('Service Worker registration failed:', err);
      });
  });
}
