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
            <span class="cart-subtotal-val" id="cartSubtotalVal">$0.00</span>
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
        this.showCheckoutSuccess();
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

  addItem(product) {
    // Generate a unique ID based on item name and options
    const optionsKey = product.options 
      ? Object.entries(product.options).sort().map(([k, v]) => `${k}:${v}`).join('|')
      : '';
    const itemId = `${product.name}-${optionsKey}`.replace(/\s+/g, '-').toLowerCase();

    const existingIndex = this.items.findIndex(item => item.id === itemId);

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += 1;
    } else {
      this.items.push({
        id: itemId,
        name: product.name,
        subtitle: product.subtitle || '',
        icon: product.icon || '🍫',
        price: product.price || 15.00,
        options: product.options || {},
        quantity: 1
      });
    }

    this.saveCart();
    this.openCart();
    this.triggerNotification(`Added ${product.name} to your selection`);
  },

  updateQuantity(itemId, change) {
    const index = this.items.findIndex(item => item.id === itemId);
    if (index === -1) return;

    this.items[index].quantity += change;

    if (this.items[index].quantity <= 0) {
      this.items.splice(index, 1);
    }

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
            <div class="cart-item-icon">${item.icon}</div>
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
                </div>
                <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 3. Update Subtotal
    const subtotalEl = document.getElementById('cartSubtotalVal');
    if (subtotalEl) {
      subtotalEl.textContent = `$${this.getCartTotal().toFixed(2)}`;
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
          Your luxury chocolate is being curated with single-origin beans and premium fresh ingredients.
        </p>
        <div class="success-divider"></div>
        <p class="success-shipping">
          Your complimentary premium white-glove packaging is scheduled. We will contact you directly to confirm delivery instructions.
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
