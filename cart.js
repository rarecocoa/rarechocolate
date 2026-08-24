// ── Maintenance Mode Toggle Flag ──────────────────────────────
// Set to true to pause online ordering. Set to false for normal store operation.
const RC_MAINTENANCE_MODE = true;
if (typeof window !== 'undefined') window.RC_MAINTENANCE_MODE = true;

(function() {
  if (!RC_MAINTENANCE_MODE || window.location.search.indexOf('admin=true') !== -1) {
    var s = document.createElement('style');
    s.id = 'rc-admin-mode-style';
    s.innerHTML = '#rc-maintenance-banner { display: none !important; }';
    if (document.head) document.head.appendChild(s);
    else document.addEventListener('DOMContentLoaded', function() { document.head.appendChild(s); });
  }
})();

const HYDERABAD_AREAS = [
  "Addagutta", "Adibatla", "Adikmet", "AG Colony", "Ahmed Nagar", "Allapur", "Allwyn Colony", "Amberpet", "Ameenpur", "Ameerpet", "Anjaiah Nagar", "Asif Nagar", "Attapur",
  "Bachupally", "Badangpet", "Bagh Amberpet", "Bagh Lingampally", "Bahadurpally", "Bairamalguda", "Bakaram", "Balaji Nagar", "Balanagar", "Balapur", "Balram Nagar", "Bandlaguda Jagir", "Banjara Hills", "Bansilalpet", "Bapuji Nagar", "Barkatpura", "Beeramguda", "Beerappagadda", "Begumpet", "Bhagya Nagar Colony", "Bhandari Layout", "Bharathi Nagar", "Bholakpur", "Bhudevi Nagar", "BK Guda", "BN Reddy Nagar", "Boduppal", "Bollaram", "Borabanda", "Boudha Nagar", "Bowrampet",
  "Chaitanyapuri", "Champapet", "Chanda Nagar", "Chandrapuri Colony", "Chengicherla", "Cherlapally", "Chilkalguda", "Chilkanagar", "Chintal", "Chintalkunta",
  "Dammaiguda", "Deepthisri Nagar", "Doctors Colony", "Doolapally", "Dr AS Rao Nagar", "Dundigal",
  "East Anandbagh", "Edulabad", "Erragadda", "Exhibition Grounds",
  "Fateh Nagar", "Film Nagar",
  "Gachibowli", "Gaddiannaram", "Gajularamaram", "Gandhi Nagar", "Gandipet", "Ganesh Nagar", "Gayatri Nagar", "Ghatkesar", "Giri Nagar", "Golconda", "Golnaka", "Goutham Nagar", "GSI", "Gudimalkapur", "Gundlapochampally", "Gunfoundry",
  "H.B. Colony", "Habsiguda", "Hafeezpet", "Hasmathpet", "Hastinapuram", "Hayathnagar", "High Court Colony", "Himayathnagar", "HITEC City", "HMT Nagar", "Hyder Nagar", "Hyderguda", "Hydershahkote",
  "Ibrahimbagh", "Irrum Manzil", "Izzath Nagar",
  "Jagathgiri Gutta", "Jalpally", "Jawahar Nagar", "Jillelaguda", "JP Colony", "Jubilee Hills",
  "Kachiguda", "Kaithalapur", "Kakatiya Nagar", "Kanajiguda", "Kapra", "Karmika Nagar", "Katedan", "Kavadiguda", "Keesara", "Khairatabad", "Kharmanghat", "Kismatpur", "Kokapet", "Kompally", "Kondapur", "Kongara Kalan", "Kothapet", "KPHB Colony", "Krishna Nagar", "Kukatpally", "Kuntloor", "Kushaiguda",
  "Lalapet", "Lecturers Colony", "Lingojiguda",
  "Macha Bollaram", "Madeenaguda", "Madhapur", "Mahadevpuram", "Mailardevpally", "Maktha Mahabubpet", "Malkajgiri", "Mallapur", "Mallepally", "Manikonda", "Mankhal", "Mansoorabad", "Masjid Banda", "Matrusri Nagar", "Mayuri Nagar", "Medipally", "Meerpet", "Mehdipatnam", "Mettuguda", "Mirjalguda", "Miyapur", "Monda Market", "Moosapet", "Moti Nagar", "Moula Ali", "Musheerabad", "Muthangi",
  "Nacharam", "Nadargul", "Nagaram", "Nagole", "Nallagandla", "Nallakunta", "Nanalnagar", "Narsingi", "Neknampur", "Neredmet", "Nizam Colony", "Nizampet", "North Lalaguda", "NTR Nagar",
  "Old Bowenpally", "OU Colony",
  "Padma Nagar", "Padmanabha Nagar", "Padmarao Nagar", "Pahadi Shareef", "Patancheruvu", "Patel Nagar", "Pedda Amberpet", "Peerzadiguda", "Pet Basheerabad", "Pocharam", "Pragathi Nagar", "Prakash Nagar", "Prashanth Nagar", "Prashanthi Hills", "Pudur-Kistapur",
  "Quthbullapur",
  "Rahamath Nagar", "Rajeev Nagar", "Rajendra Nagar", "Ramachandrapuram", "Ramanthapur", "Ramgopalpet", "Ramnagar", "Ranga Reddy Nagar", "Red Hills", "RK Puram", "Rodamestri Nagar",
  "Sahebnagar", "Saibaba Nagar", "Sanathnagar", "Saroornagar", "Seethaphalmandi", "Serilingampally", "Shaheen Nagar", "Shaikpet", "Shakthi Sai Nagar", "Shamirpet", "Shamshiguda", "Shanti Nagar", "Shapur Nagar", "Shastripuram", "Somajiguda", "SR Nagar", "Sri Ram Nagar", "Srinagar Colony", "Subhash Nagar", "Suleman Nagar", "Suraram", "Syed Nagar",
  "Tarnaka", "Tellapur", "Temple Alwal", "Thorrur", "Thukkuguda", "Tilak Nagar", "Tolichowki", "Turkapally", "Turkayamjal",
  "Uppal",
  "Vampuguda", "Vanasthalipuram", "Vasanth Nagar", "Vengal Rao Nagar", "Venkat Reddy Nagar", "Venkatapuram", "Venkateshwara Colony", "Venkateshwara Nagar", "Vijayanagar Colony", "Vinayak Nagar", "Vivekananda Nagar Colony",
  "Yapral", "Yousufguda"
];

const CartSystem = {
  // ── Maintenance Mode Banner & Ordering Pause ──────────────
  initMaintenanceMode: function() {
    const existing = document.getElementById('rc-maintenance-banner');
    if (typeof RC_MAINTENANCE_MODE !== 'undefined' && !RC_MAINTENANCE_MODE) {
      if (existing) existing.remove();
      return;
    }
    const isAdmin = window.location.search.indexOf('admin=true') !== -1;
    if (isAdmin) {
      if (existing) existing.remove();
      return;
    }
    if (existing) return;
    const banner = document.createElement('div');
    banner.id = 'rc-maintenance-banner';
    banner.style.cssText = 'background: #dc2626; color: #ffffff; text-align: center; padding: 7px 16px; font-weight: 600; font-size: 0.8rem; position: fixed; bottom: 0; left: 0; right: 0; width: 100%; z-index: 9999999; box-shadow: 0 -2px 10px rgba(0,0,0,0.25); font-family: var(--font-body, sans-serif); letter-spacing: 0.3px;';
    banner.innerHTML = '⚠️ Currently we are not accepting orders, we will be back soon.';
    document.body.appendChild(banner);
  },

  initHoldPopup: function() {
    if (typeof RC_MAINTENANCE_MODE !== 'undefined' && !RC_MAINTENANCE_MODE) return;
    if (window.location.search.indexOf('admin=true') !== -1) return;
    if (document.getElementById('rc-hold-popup-overlay')) return;

    if (!document.getElementById('rc-popup-styles')) {
      const st = document.createElement('style');
      st.id = 'rc-popup-styles';
      st.innerHTML = `
        @keyframes rcOverlayFadeIn {
          from { opacity: 0; backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
        }
        @keyframes rcModalPopIn {
          0% { opacity: 0; transform: translateY(35px) scale(0.92); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes rcGoldSweep {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes rcGoldGlow {
          0%, 100% { box-shadow: 0 5px 18px rgba(139,105,20,0.35); }
          50% { box-shadow: 0 8px 28px rgba(201,164,86,0.65), 0 0 15px rgba(212,175,55,0.4); }
        }

        #rc-hold-popup-overlay {
          animation: rcOverlayFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .rc-popup-card {
          animation: rcModalPopIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .rc-explore-btn {
          background: linear-gradient(135deg, #7c5d0f 0%, #a88120 35%, #c9a456 50%, #a88120 65%, #7c5d0f 100%) !important;
          background-size: 200% 100% !important;
          animation: rcGoldSweep 3.5s ease-in-out infinite, rcGoldGlow 2.8s ease-in-out infinite !important;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease !important;
        }
        .rc-explore-btn:hover {
          transform: translateY(-2px) scale(1.015) !important;
          box-shadow: 0 10px 30px rgba(201,164,86,0.7), 0 0 20px rgba(212,175,55,0.5) !important;
        }
        .rc-explore-btn:hover .rc-arrow {
          transform: translateX(6px) !important;
        }
        .rc-explore-btn:active {
          transform: translateY(1px) scale(0.98) !important;
        }
        .rc-arrow {
          display: inline-block;
          transition: transform 0.25s ease;
          margin-left: 6px;
        }
        #rcHoldCloseBtn {
          transition: transform 0.2s ease, background-color 0.2s ease !important;
        }
        #rcHoldCloseBtn:hover {
          transform: scale(1.12) rotate(90deg) !important;
          background-color: rgba(0,0,0,0.75) !important;
        }
      `;
      document.head.appendChild(st);
    }

    const overlay = document.createElement('div');
    overlay.id = 'rc-hold-popup-overlay';
    overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 99999999; display: flex; align-items: center; justify-content: center; padding: 16px; box-sizing: border-box;';
    overlay.innerHTML = `
      <div class="rc-popup-card" style="background: #FFFDF9; border-radius: 20px; max-width: 420px; width: 100%; max-height: 90vh; overflow: hidden; text-align: center; box-shadow: 0 25px 60px rgba(0,0,0,0.55); border: 1px solid rgba(139,105,20,0.2); position: relative; box-sizing: border-box; display: flex; flex-direction: column;">
        <button id="rcHoldCloseBtn" aria-label="Close" style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.5); border: none; font-size: 1.25rem; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; color: #ffffff; display: flex; align-items: center; justify-content: center; line-height: 1; z-index: 10;">&times;</button>
        <div style="width: 100%; overflow: hidden; display: flex; justify-content: center; background: #ebd5b3;">
          <img src="assets/orders_hold.avif?v=2" alt="Notice Regarding Orders" style="width: 100%; height: auto; display: block; object-fit: contain; max-height: 65vh;">
        </div>
        <div style="padding: 18px 20px; background: #FFFDF9; border-radius: 0 0 20px 20px; width: 100%; box-sizing: border-box;">
          <button id="rcExploreMenuBtn" class="rc-explore-btn" style="width: 100%; padding: 14px 24px; color: #ffffff; border: none; border-radius: 100px; font-family: var(--font-body, sans-serif); font-size: 0.9rem; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: 0.07em;">Explore Our Menu <span class="rc-arrow">→</span></button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const closePopup = () => {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.25s ease';
      setTimeout(() => overlay.remove(), 250);
    };

    document.getElementById('rcHoldCloseBtn').addEventListener('click', closePopup);
    document.getElementById('rcExploreMenuBtn').addEventListener('click', closePopup);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePopup();
    });
  },

  storageKey: 'rarecocoa_cart',
  items: [],

  init() {
    this.initMaintenanceMode();
    this.initHoldPopup();
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
    // 3. Inject Floating WhatsApp Button
    if (!document.getElementById('floatingWhatsappBtn')) {
      const waBtn = document.createElement('a');
      waBtn.id = 'floatingWhatsappBtn';
      waBtn.href = 'https://wa.me/918374013232';
      waBtn.target = '_blank';
      waBtn.rel = 'noopener';
      waBtn.setAttribute('aria-label', 'Chat on WhatsApp');
      waBtn.style.cssText = 'position:fixed;bottom:20px;left:20px;z-index:99999;width:54px;height:54px;border-radius:50%;background:#25D366;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(0,0,0,0.35);transition:transform 0.3s;text-decoration:none;-webkit-tap-highlight-color:transparent;';
      waBtn.onmouseover = function(){ this.style.transform = 'scale(1.12)'; };
      waBtn.onmouseout = function(){ this.style.transform = 'scale(1)'; };
      waBtn.innerHTML = '<svg width="28" height="28" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/></svg>';
      document.body.appendChild(waBtn);
    }

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
          <div class="cart-summary-row" style="margin-top: 4px; font-size: 0.85rem; color: var(--text-muted);">
            <span>Delivery Fee</span>
            <span id="cartDeliveryFeeVal" style="font-size: 0.8rem; font-weight: 500;">From ₹30 (Selected at checkout)</span>
          </div>
          <button class="cart-checkout-btn" id="cartCheckoutBtn" style="margin-top: 12px;">Proceed to Checkout</button>
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
        if (this.getCartTotal() < 350) return;
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
        const optionsHtml = Object.entries(item.options || {})
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
    const subtotal = this.getCartTotal();
    const subtotalEl = document.getElementById('cartSubtotalVal');
    if (subtotalEl) {
      subtotalEl.textContent = `₹${Math.round(subtotal)}`;
    }

    // 4. Update checkout button disabled state
    const checkoutBtn = document.getElementById('cartCheckoutBtn');
    if (checkoutBtn) {
      if (this.items.length === 0) {
        checkoutBtn.setAttribute('disabled', 'true');
        checkoutBtn.classList.add('disabled');
        checkoutBtn.textContent = 'Proceed to Checkout';
      } else if (subtotal < 350) {
        checkoutBtn.setAttribute('disabled', 'true');
        checkoutBtn.classList.add('disabled');
        checkoutBtn.textContent = `Min. Order ₹350 (Add ₹${350 - Math.round(subtotal)} more)`;
      } else {
        checkoutBtn.removeAttribute('disabled');
        checkoutBtn.classList.remove('disabled');
        checkoutBtn.textContent = 'Proceed to Checkout';
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
    const MSGS = {
      'Vijayawada': "Our luxury chocolates are extremely temperature-sensitive, which is why we deliver them in person within Vijayawada city limits (₹30 delivery fee). Please ensure you or someone else is available to receive them. (Note: If your delivery address is outside city limits, standard charges will apply).",
      'Andhra Pradesh, Chennai, Bangalore': "Our chocolates are temperature-sensitive, so we deliver across Andhra Pradesh, Chennai, and Bangalore via direct bus connectivity in insulated thermal packaging (₹200 delivery fee). Please ensure you are available at the transit point to collect your order.",
      'Hyderabad': "Our luxury chocolates are extremely temperature-sensitive, which is why we personally deliver them to your door in Hyderabad (₹100 delivery fee). Please ensure you or someone else is available to receive them.",
      'Other States': "As our signature chocolates are highly temperature-sensitive, we cannot ship chocolates, clusters, or dragées to other states. However, we can safely deliver slabs, hot chocolate, and butter via standard courier services (₹200 delivery fee). Please review your cart to make sure your selection only contains courier-friendly products."
    };

    // SCREEN 1: Location tile selection
    const locOverlay = document.createElement('div');
    locOverlay.className = 'checkout-form-overlay';
    locOverlay.id = 'checkoutLocOverlay';
    locOverlay.innerHTML = `
      <div class="checkout-form-card loc-select-card">
        <button class="loc-close-btn" id="locOverlayClose" aria-label="Close">&times;</button>
        <h3>Where are you?</h3>
        <p>Select your delivery region to calculate exact delivery charges</p>
        <div class="location-options">
          <label class="location-tile">
            <input type="radio" name="deliveryLocation" value="Vijayawada">
            <span class="location-tile-content">
              <span class="loc-icon">📍</span>
              <span class="loc-text">
                <span class="location-name">Vijayawada</span>
                <span class="location-sub">City Limits · ₹30 Delivery</span>
              </span>
            </span>
          </label>
          <label class="location-tile">
            <input type="radio" name="deliveryLocation" value="Hyderabad">
            <span class="location-tile-content">
              <span class="loc-icon">🏙️</span>
              <span class="loc-text">
                <span class="location-name">Hyderabad</span>
                <span class="location-sub">Personal Delivery · ₹100 Delivery</span>
              </span>
            </span>
          </label>
          <label class="location-tile">
            <input type="radio" name="deliveryLocation" value="Andhra Pradesh, Chennai, Bangalore">
            <span class="location-tile-content">
              <span class="loc-icon">🚌</span>
              <span class="loc-text">
                <span class="location-name">Andhra Pradesh · Chennai · Bangalore</span>
                <span class="location-sub">Direct Bus Connectivity · ₹200 Delivery</span>
              </span>
            </span>
          </label>
          <label class="location-tile">
            <input type="radio" name="deliveryLocation" value="Other States">
            <span class="location-tile-content">
              <span class="loc-icon">📦</span>
              <span class="loc-text">
                <span class="location-name">Other States (Rest of India)</span>
                <span class="location-sub">Standard Courier · ₹200 Delivery</span>
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
    const isHyderabad = location === 'Hyderabad';
    const deliveryFee = location === 'Vijayawada' ? 30 : (location === 'Hyderabad' ? 100 : 200);
    const subtotalVal = this.getCartTotal();
    const totalVal = subtotalVal + deliveryFee;

    const overlay = document.createElement('div');
    overlay.className = 'checkout-form-overlay';
    overlay.id = 'checkoutFormOverlay';
    overlay.innerHTML = `
      <div class="checkout-form-card">
        <h3>Delivery Details</h3>
        <p>Please enter your details to place your order via WhatsApp.</p>

        <div class="checkout-summary-box" style="background: rgba(26,14,8,0.04); border-radius: 12px; padding: 14px 16px; margin-bottom: 20px; border: 1px solid rgba(26,14,8,0.08); text-align: left;">
          <div style="display:flex; justify-content:space-between; margin-bottom: 6px; font-size: 0.85rem; color: #555;">
            <span>Delivery Region:</span>
            <strong style="color: #1A0E08;">${location}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom: 6px; font-size: 0.85rem; color: #555;">
            <span>Items Subtotal:</span>
            <strong style="color: #1A0E08;">₹${Math.round(subtotalVal)}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom: 8px; font-size: 0.85rem; color: #555;">
            <span>Delivery Fee (${location === 'Vijayawada' ? 'City Limits' : location === 'Hyderabad' ? 'Personal' : 'Standard'}):</span>
            <strong style="color: #1A0E08;">₹${deliveryFee}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; padding-top: 8px; border-top: 1px dashed rgba(26,14,8,0.15); font-size: 0.95rem; font-weight: 700; color: #1A0E08;">
            <span>Total Payable:</span>
            <span>₹${Math.round(totalVal)}</span>
          </div>
          ${location === 'Vijayawada' ? `<p style="font-size: 0.72rem; color: #777; margin: 8px 0 0 0; line-height: 1.3;">*Note: ₹30 delivery applies within Vijayawada city limits. If outside city limits, standard charges will apply.</p>` : ''}
        </div>

        <form id="checkoutDetailsForm">
          <div class="checkout-form-group" style="margin-bottom: 24px;">
            <label style="margin-bottom: 10px; font-weight: 600; color: #1A0E08; letter-spacing: 0.05em; font-size: 0.75rem;">ORDERING FOR:</label>
            <div class="recipient-toggle-tabs" style="display: flex; gap: 16px; width: 100%;">
              <button type="button" class="recipient-tab active" id="btnOrderSelf" style="flex: 1; padding: 12px 20px; font-family: var(--font-body); font-size: 0.85rem; font-weight: 600; border-radius: 30px; border: 1.5px solid #1A0E08; background: #1A0E08; color: #fff; cursor: pointer; transition: all 0.2s ease; text-transform: uppercase; letter-spacing: 0.05em; text-align: center;">Yourself</button>
              <button type="button" class="recipient-tab" id="btnOrderOther" style="flex: 1; padding: 12px 20px; font-family: var(--font-body); font-size: 0.85rem; font-weight: 600; border-radius: 30px; border: 1.5px solid rgba(26,14,8,0.15); background: transparent; color: #1A0E08; cursor: pointer; transition: all 0.2s ease; text-transform: uppercase; letter-spacing: 0.05em; text-align: center;">Someone Else</button>
            </div>
          </div>

          <div id="selfFields">
            <div class="checkout-form-group">
              <label for="checkoutName">Full Name</label>
              <input type="text" id="checkoutName" required placeholder="e.g. Praveen Kumar">
            </div>
            <div class="checkout-form-group">
              <label for="checkoutPhone">Phone Number</label>
              <input type="tel" id="checkoutPhone" required placeholder="e.g. 9876543210">
            </div>
          </div>

          <div id="otherFields" style="display: none;">
            <div class="checkout-form-group">
              <label for="checkoutReceiverName">Receiver's Name</label>
              <input type="text" id="checkoutReceiverName" placeholder="e.g. Rohan Sharma">
            </div>
            <div class="checkout-form-group">
              <label for="checkoutReceiverPhone">Receiver's Phone Number</label>
              <input type="tel" id="checkoutReceiverPhone" placeholder="e.g. 9876543210">
            </div>
            <div class="checkout-form-group">
              <label for="checkoutSenderName">Your Name (Sender)</label>
              <input type="text" id="checkoutSenderName" placeholder="e.g. Praveen Kumar">
            </div>
            <div class="checkout-form-group">
              <label for="checkoutSenderPhone">Your Phone Number (Sender)</label>
              <input type="tel" id="checkoutSenderPhone" placeholder="e.g. 918374013232">
            </div>
          </div>

          ${isHyderabad ? `
          <div class="checkout-form-group" style="margin-bottom: 16px;">
            <label for="checkoutAreaSelect" style="display: block; font-weight: 600; color: #1A0E08; margin-bottom: 6px; font-size: 0.85rem;">Area Name</label>
            <select id="checkoutAreaSelect" required style="width: 100%; padding: 12px 14px; border: 1.5px solid rgba(26,14,8,0.2); border-radius: 8px; font-family: var(--font-body); font-size: 0.95rem; background: #fff; color: #1A0E08; outline: none;">
              <option value="">-- Select Area Name --</option>
              ${HYDERABAD_AREAS.map(a => `<option value="${a}">${a}</option>`).join('')}
              <option value="Other">Other (Not in list)</option>
            </select>
            <div id="customAreaGroup" style="display: none; margin-top: 10px;">
              <label for="checkoutAreaCustomInput" style="display: block; font-weight: 600; color: #1A0E08; margin-bottom: 6px; font-size: 0.8rem;">Custom Area Name</label>
              <input type="text" id="checkoutAreaCustomInput" placeholder="Enter your Area Name" style="width: 100%; padding: 12px 14px; border: 1.5px solid rgba(26,14,8,0.2); border-radius: 8px; font-family: var(--font-body); font-size: 0.95rem; outline: none;">
            </div>
          </div>
          ` : ''}
          <div class="checkout-form-group">
            <label for="checkoutAddress">Delivery Address</label>
            <textarea id="checkoutAddress" required placeholder="e.g. Flat 304, Royal Apartments, HSR Layout" rows="3"></textarea>
          </div>
          <div class="checkout-form-group">
            <label for="checkoutCity">City / Town Name *</label>
            <input type="text" id="checkoutCity" required placeholder="e.g. Visakhapatnam, Guntur, Vijayawada, Bangalore, Chennai">
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
            <button type="submit" class="checkout-submit-btn" id="checkoutSubmitBtn" disabled>Review &amp; Place Order →</button>
            <button type="button" class="checkout-cancel-btn" id="btnBackToLoc">← Back</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);

    const form = document.getElementById('checkoutDetailsForm');
    const nameInput = document.getElementById('checkoutName');
    const phoneInput = document.getElementById('checkoutPhone');
    const receiverNameInput = document.getElementById('checkoutReceiverName');
    const receiverPhoneInput = document.getElementById('checkoutReceiverPhone');
    const senderNameInput = document.getElementById('checkoutSenderName');
    const senderPhoneInput = document.getElementById('checkoutSenderPhone');
    const areaSelect = document.getElementById('checkoutAreaSelect');
    const customAreaGroup = document.getElementById('customAreaGroup');
    const areaCustomInput = document.getElementById('checkoutAreaCustomInput');

    const getAreaName = () => {
      if (!isHyderabad || !areaSelect) return '';
      if (areaSelect.value === 'Other') {
        return areaCustomInput ? areaCustomInput.value.trim() : '';
      }
      return areaSelect.value.trim();
    };
    const addressInput = document.getElementById('checkoutAddress');
    const cityInput = document.getElementById('checkoutCity');
    const pincodeInput = document.getElementById('checkoutPincode');
    const mapsLinkInput = document.getElementById('checkoutMapsLink');
    const submitBtn = document.getElementById('checkoutSubmitBtn');

    const btnOrderSelf = document.getElementById('btnOrderSelf');
    const btnOrderOther = document.getElementById('btnOrderOther');
    const selfFields = document.getElementById('selfFields');
    const otherFields = document.getElementById('otherFields');

    let orderFor = 'self';

    btnOrderSelf.addEventListener('click', () => {
      orderFor = 'self';
      
      btnOrderSelf.style.background = '#1A0E08';
      btnOrderSelf.style.color = '#fff';
      btnOrderSelf.style.borderColor = '#1A0E08';
      
      btnOrderOther.style.background = 'transparent';
      btnOrderOther.style.color = '#1A0E08';
      btnOrderOther.style.borderColor = 'rgba(26,14,8,0.15)';
      
      selfFields.style.display = 'block';
      otherFields.style.display = 'none';

      nameInput.setAttribute('required', 'true');
      phoneInput.setAttribute('required', 'true');
      receiverNameInput.removeAttribute('required');
      receiverPhoneInput.removeAttribute('required');
      senderNameInput.removeAttribute('required');
      senderPhoneInput.removeAttribute('required');

      validateForm();
    });

    btnOrderOther.addEventListener('click', () => {
      orderFor = 'other';
      
      btnOrderOther.style.background = '#1A0E08';
      btnOrderOther.style.color = '#fff';
      btnOrderOther.style.borderColor = '#1A0E08';
      
      btnOrderSelf.style.background = 'transparent';
      btnOrderSelf.style.color = '#1A0E08';
      btnOrderSelf.style.borderColor = 'rgba(26,14,8,0.15)';
      
      selfFields.style.display = 'none';
      otherFields.style.display = 'block';

      nameInput.removeAttribute('required');
      phoneInput.removeAttribute('required');
      receiverNameInput.setAttribute('required', 'true');
      receiverPhoneInput.setAttribute('required', 'true');
      senderNameInput.setAttribute('required', 'true');
      senderPhoneInput.setAttribute('required', 'true');

      validateForm();
    });

    const validateForm = () => {
      let isNamePhoneValid = false;
      if (orderFor === 'self') {
        isNamePhoneValid = nameInput.value.trim() !== '' && phoneInput.value.trim() !== '';
      } else {
        isNamePhoneValid = receiverNameInput.value.trim() !== '' && 
                           receiverPhoneInput.value.trim() !== '' && 
                           senderNameInput.value.trim() !== '' && 
                           senderPhoneInput.value.trim() !== '';
      }

      const address = addressInput.value.trim();
      const city = cityInput ? cityInput.value.trim() : '';
      const pincode = pincodeInput.value.trim();
      const mapsLink = needsMapLink ? (mapsLinkInput?.value.trim() || '') : '';
      const areaName = getAreaName();

      const isPincodeValid = /^[0-9]{6}$/.test(pincode);
      const isMapsValid = !needsMapLink || (mapsLink !== '');
      const isAreaValid = !isHyderabad || (areaName !== '');
      const isCityValid = (city !== '');

      if (isNamePhoneValid && address && isCityValid && isPincodeValid && isMapsValid && isAreaValid) {
        submitBtn.removeAttribute('disabled');
      } else {
        submitBtn.setAttribute('disabled', 'true');
      }
    };

    [nameInput, phoneInput, receiverNameInput, receiverPhoneInput, senderNameInput, senderPhoneInput, addressInput, cityInput, pincodeInput].forEach(input => {
      if (input) input.addEventListener('input', validateForm);
    });
    if (needsMapLink && mapsLinkInput) {
      mapsLinkInput.addEventListener('input', validateForm);
    }
    if (isHyderabad && areaSelect) {
      areaSelect.addEventListener('change', () => {
        if (areaSelect.value === 'Other') {
          if (customAreaGroup) customAreaGroup.style.display = 'block';
          if (areaCustomInput) {
            areaCustomInput.value = '';
            areaCustomInput.focus();
          }
        } else {
          if (customAreaGroup) customAreaGroup.style.display = 'none';
          if (areaCustomInput) areaCustomInput.value = '';
        }
        validateForm();
      });
      if (areaCustomInput) {
        areaCustomInput.addEventListener('input', validateForm);
      }
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
      const address = addressInput.value.trim();
      const city = cityInput ? cityInput.value.trim() : '';
      const pincode = pincodeInput.value.trim();
      const mapsLink = needsMapLink ? (mapsLinkInput?.value.trim() || '') : '';
      const areaName = getAreaName();

      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      const receiverName = receiverNameInput.value.trim();
      const receiverPhone = receiverPhoneInput.value.trim();
      const senderName = senderNameInput.value.trim();
      const senderPhone = senderPhoneInput.value.trim();

      if (orderFor === 'self') {
        if (!name || !phone) { alert('Please fill out all fields.'); return; }
      } else {
        if (!receiverName || !receiverPhone || !senderName || !senderPhone) { alert('Please fill out all fields.'); return; }
      }
      if (isHyderabad && !areaName) { alert('Please enter your Area Name.'); return; }
      if (!address || !city || !pincode) { alert('Please fill out all compulsory fields.'); return; }
      if (needsMapLink && !mapsLink) { alert('Please paste your Google Maps Location Link.'); return; }
      if (!/^[0-9]{6}$/.test(pincode)) { alert('Please enter a valid 6-digit pincode.'); return; }

      let message = `*RARE COCOA™* 🍫\n_The Soul of Chocolate_\n=================================\n`;
      message += `• *Delivery Region:* ${location}\n`;
      if (isHyderabad && areaName) message += `• *Area Name:* ${areaName}\n`;
      if (city) message += `• *City / Town:* ${city}\n`;
      if (location !== 'Other States') message += `• *Temperature Agreement:* Accepted ✓\n`;
      message += `• *Delivery Pincode:* ${pincode}\n=================================\n\n`;
      
      if (orderFor === 'self') {
        message += `*Recipient Information:*\n• *Name:* ${name}\n• *Contact:* ${phone}\n• *Address:* ${address}\n`;
      } else {
        message += `*Delivery Information (Gift/For Other):*\n• *Receiver Name:* ${receiverName}\n• *Receiver Phone:* ${receiverPhone}\n• *Sender Name:* ${senderName}\n• *Sender Phone:* ${senderPhone}\n• *Address:* ${address}\n`;
      }
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
      const deliveryFee = location === 'Vijayawada' ? 30 : (location === 'Hyderabad' ? 100 : 200);
      const subtotalVal = this.getCartTotal();
      const finalTotal = subtotalVal + deliveryFee;

      message += `---------------------------------\n`;
      message += `*Subtotal:* ₹${Math.round(subtotalVal)}\n`;
      message += `*Delivery Fee (${location === 'Vijayawada' ? 'Vijayawada City Limits' : location}):* ₹${deliveryFee}\n`;
      message += `*Total Order Value:* ₹${Math.round(finalTotal)}\n`;
      message += `---------------------------------\n_Thank you for choosing Rare Cocoa™._ ✨`;

      window.open(`https://api.whatsapp.com/send?phone=918374013232&text=${encodeURIComponent(message)}`, '_blank');
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

// Auto initialize on DOM ready or immediately if already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => CartSystem.init());
} else {
  CartSystem.init();
}


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
