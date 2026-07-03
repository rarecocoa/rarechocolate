/* ==========================================================
   RARE COCOA™ — Collection Pages Interactive Scripts
   Product Modal · Filter Options · Sub-tabs · Builder
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ── Navigation (shared) ───────────────────────────────────
  const nav = document.getElementById('nav');

  const handleNavScroll = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // ── Mobile Menu ──────────────────────────────────────────
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  let menuOpen = false;

  const toggleMenu = () => {
    menuOpen = !menuOpen;
    menuBtn.classList.toggle('active', menuOpen);
    mobileMenu.classList.toggle('open', menuOpen);
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  };

  if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => { if (menuOpen) toggleMenu(); });
    });
  }

  // ── Scroll Reveal ────────────────────────────────────────
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target.dataset.delay) {
            entry.target.style.transitionDelay = entry.target.dataset.delay + 'ms';
          }
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  );
  revealElements.forEach(el => revealObserver.observe(el));


  // ═══════════════════════════════════════════════════════════
  // PRODUCT MODAL SYSTEM (Add to Cart Integration)
  // ═══════════════════════════════════════════════════════════

  const backdrop = document.getElementById('modalBackdrop');
  const modal = document.getElementById('productModal');

  // Open modal when product card is clicked
  document.querySelectorAll('.product-grid-card[data-product]').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-carousel-btn')) return; // don't open modal on carousel click
      const productData = JSON.parse(card.getAttribute('data-product'));
      openModal(productData);
    });
  });

  // ── Card Carousel Initializer ───────────────────────────────
  function initCardCarousels() {
    const carousels = [];

    document.querySelectorAll('.card-carousel').forEach(carousel => {
      if (carousel.dataset.carouselInit) return;
      carousel.dataset.carouselInit = '1';

      const track = carousel.querySelector('.card-carousel-track');
      const originalSlides = carousel.querySelectorAll('.card-carousel-slide');
      const dots = carousel.querySelectorAll('.card-carousel-dot');
      const total = originalSlides.length;
      if (total <= 1) return;

      // Clone slides for infinite loop
      const firstClone = originalSlides[0].cloneNode(true);
      const lastClone = originalSlides[total - 1].cloneNode(true);
      track.appendChild(firstClone);
      track.insertBefore(lastClone, originalSlides[0]);

      let current = 1; // start at first original slide

      function goTo(idx, animate = true) {
        // Pause any playing video from the previous real slide
        const allSlides = track.querySelectorAll('.card-carousel-slide');
        const prevSlide = allSlides[current];
        if (prevSlide) {
          const prevVideo = prevSlide.querySelector('video');
          if (prevVideo) {
            prevVideo.pause();
            prevVideo.currentTime = 0;
          }
        }

        current = idx;
        if (animate) {
          track.style.transition = 'transform 0.55s cubic-bezier(0.77, 0, 0.18, 1)';
        } else {
          track.style.transition = 'none';
        }
        track.style.transform = `translateX(-${current * 100}%)`;

        // Update dots (active dot index is current - 1 wrapped)
        const dotActiveIdx = (current - 1 + total) % total;
        dots.forEach((d, i) => d.classList.toggle('active', i === dotActiveIdx));

        // Play video in the new current real slide (after a tiny delay for transition to begin)
        const newSlides = track.querySelectorAll('.card-carousel-slide');
        const newSlide = newSlides[current];
        if (newSlide && animate) {
          const newVideo = newSlide.querySelector('video');
          if (newVideo) {
            setTimeout(() => {
              newVideo.play().catch(() => {});
            }, 100);
          }
        }
      }

      // Handle transition wrapping for infinite loop — also handle video sync
      track.addEventListener('transitionend', () => {
        if (current === 0) {
          goTo(total, false);
        } else if (current === total + 1) {
          goTo(1, false);
        }
      });

      carousel.querySelector('.card-carousel-btn.prev')?.addEventListener('click', (e) => {
        e.stopPropagation();
        goTo(current - 1);
        resetGlobalAuto();
      });
      carousel.querySelector('.card-carousel-btn.next')?.addEventListener('click', (e) => {
        e.stopPropagation();
        goTo(current + 1);
        resetGlobalAuto();
      });
      dots.forEach((dot, i) => dot.addEventListener('click', (e) => {
        e.stopPropagation();
        goTo(i + 1);
        resetGlobalAuto();
      }));

      // Auto-slide reset on button/dot navigation helper
      function resetAutoSlideTimer() {
        resetGlobalAuto();
      }

      // Initial state
      goTo(1, false);
      
      carousels.push({
        goToNext: () => goTo(current + 1)
      });
    });

    // Global Synchronized Auto-Slider Timer (Disabled to prevent "sliding ad videos")
    let globalTimer;
    function startGlobalAuto() {
      // Do nothing — auto-sliding is disabled.
    }
    function resetGlobalAuto(pauseOnly = false) {
      // Do nothing — auto-sliding is disabled.
    }

    if (carousels.length > 0) {
      startGlobalAuto();
    }
  }
  initCardCarousels();

  // (cocoa bar is in the modal, not on cards)

  function openModal(product) {
    if (!backdrop || !modal) return;

    // Set product info
    const nameEl = modal.querySelector('.modal-product-name');
    const subtitleEl = modal.querySelector('.modal-product-subtitle');
    const iconEl = modal.querySelector('.modal-product-icon');

    if (nameEl) nameEl.textContent = product.name;
    if (subtitleEl) subtitleEl.textContent = product.subtitle || '';
    if (iconEl) {
      const icons = Array.isArray(product.icon) ? product.icon : [product.icon];
      const isImg = (s) => s && (s.includes('/') || s.includes('.'));
      if (icons.length > 1) {
        // Mini carousel in modal icon
        let carIdx = 0;
        const renderModalCarousel = () => {
          iconEl.innerHTML = `<img src="${icons[carIdx]}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;transition:opacity 0.4s">`;
        };
        renderModalCarousel();
        iconEl.style.cursor = 'pointer';
        iconEl.title = 'Click to see next image';
        iconEl.onclick = () => { carIdx = (carIdx + 1) % icons.length; renderModalCarousel(); };
      } else if (isImg(icons[0])) {
        iconEl.innerHTML = `<img src="${icons[0]}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
        iconEl.onclick = null;
      } else {
        iconEl.innerHTML = icons[0] || '🍫';
        iconEl.onclick = null;
      }
    }

    // Build option groups
    const body = modal.querySelector('.modal-body');
    if (body) {
      body.innerHTML = '';

      const priceDisplay = modal.querySelector('.modal-price-display');

    function updateModalLivePrice() {
      const nameLower = product.name?.toLowerCase() || '';
      
      // Gather currently selected options
      const selOpts = {};
      modal.querySelectorAll('.modal-option-group').forEach(g => {
        const lbl = g.querySelector('.modal-option-label')?.textContent;
        const sel = g.querySelector('.modal-option-pill.selected')?.textContent;
        if (lbl && sel) selOpts[lbl] = sel;
      });

      // 1. Update Sweetener pills text dynamically to show prices
      const sweetenerGroup = [...modal.querySelectorAll('.modal-option-group')].find(g => {
        const lbl = g.querySelector('.modal-option-label')?.textContent || '';
        return lbl.includes('Sweetener');
      });

      if (sweetenerGroup) {
        const pills = sweetenerGroup.querySelectorAll('.modal-option-pill');
        pills.forEach(pill => {
          // Get clean sweetener name (remove any previous price tag like "(₹300)")
          let sweetName = pill.textContent.split(' (₹')[0].trim();
          sweetName = sweetName.replace(/\s*\(\+₹\d+\/g\)/, '');
          
          let optPrice = null;

          if (nameLower.includes('cluster') || nameLower.includes('slab') || nameLower.includes('spread')) {
            let rate = 3;
            if (sweetName.includes('Coconut Sugar')) rate = 4;
            else if (sweetName.includes('Monk Fruit') || sweetName.includes('Monk Sweetener')) rate = 5;

            // Find selected weight
            const qtyGroup = [...modal.querySelectorAll('.modal-option-group')].find(g => {
              const lbl = g.querySelector('.modal-option-label')?.textContent || '';
              return lbl.includes('Weight') || lbl.includes('Quantity');
            });
            const qtyOpt = qtyGroup?.querySelector('.modal-option-pill.selected')?.textContent || '';
            let grams = 0;
            if (qtyOpt.toLowerCase().includes('1kg')) grams = 1000;
            else {
              const m = qtyOpt.match(/(\d+)g/);
              if (m) grams = parseInt(m[1], 10);
            }
            if (grams > 0) optPrice = grams * rate;
          } else if (nameLower.includes('drags')) {
            let baseRate = 3;
            if (nameLower.includes('walnut') || nameLower.includes('coffee')) baseRate = 4;
            else if (nameLower.includes('nibs')) baseRate = 4.5;
            let rate = baseRate;
            if (sweetName.includes('Coconut Sugar')) rate = baseRate + 1;
            else if (sweetName.includes('Monk Fruit')) rate = baseRate + 2;
            optPrice = 200 * rate;
          } else if (nameLower.includes('cavities')) {
            if (sweetName.includes('Coconut Sugar')) optPrice = 35;
            else if (sweetName.includes('Monk Fruit')) optPrice = 45;
            else optPrice = 25;
          }

          if (optPrice !== null) {
            pill.textContent = `${sweetName} (₹${optPrice})`;
          }
        });
      }

      // 2. Calculate final selected item price
      let finalPrice = product.price;
      
      // If there's a selected sweetener and weight/drags pricing applies
      const selectedSweetener = selOpts['Choose Your Sweetener'] || selOpts['Choose Sweetener'] || '';
      const cleanSelectedSweetener = selectedSweetener.split(' (₹')[0].trim();
      
      if (nameLower.includes('cluster') || nameLower.includes('slab') || nameLower.includes('spread')) {
        let rate = 3;
        if (cleanSelectedSweetener.includes('Coconut Sugar')) rate = 4;
        else if (cleanSelectedSweetener.includes('Monk Fruit') || cleanSelectedSweetener.includes('Monk Sweetener')) rate = 5;

        const qtyOpt = selOpts['Weight'] || selOpts['Choose Weight'] || selOpts['Quantity'] || '';
        let grams = 0;
        if (qtyOpt.toLowerCase().includes('1kg')) grams = 1000;
        else {
          const m = qtyOpt.match(/(\d+)g/);
          if (m) grams = parseInt(m[1], 10);
        }
        if (grams > 0) finalPrice = grams * rate;
      } else if (nameLower.includes('drags')) {
        let baseRate = 3;
        if (nameLower.includes('walnut') || nameLower.includes('coffee')) baseRate = 4;
        else if (nameLower.includes('nibs')) baseRate = 4.5;
        let rate = baseRate;
        if (cleanSelectedSweetener.includes('Coconut Sugar')) rate = baseRate + 1;
        else if (cleanSelectedSweetener.includes('Monk Fruit')) rate = baseRate + 2;
        finalPrice = 200 * rate;
      } else if (nameLower.includes('cavities')) {
        if (cleanSelectedSweetener.includes('Coconut Sugar')) finalPrice = 35;
        else if (cleanSelectedSweetener.includes('Monk Fruit')) finalPrice = 45;
        else finalPrice = 25;
      } else {
        // Fallback: check if any selected option has a price format in parentheses
        Object.values(selOpts).forEach(val => {
          const match = val.match(/\(₹\s*(\d+)(?:\/[a-zA-Z]+)?\)/);
          if (match) finalPrice = parseFloat(match[1]);
        });
      }

      // Update Add to Selection button text
      const modalAddBtn = modal.querySelector('.modal-add-btn');
      if (modalAddBtn && finalPrice !== undefined && finalPrice !== null) {
        modalAddBtn.textContent = `Add to Selection — ₹${finalPrice}`;
      } else if (modalAddBtn) {
        modalAddBtn.textContent = 'Add to Selection';
      }
    }

    if (product.options && product.options.length > 0) {
      const isTabletPage = window.location.pathname.toLowerCase().includes('tablets');
      const hasCocoa = isTabletPage && product.options.some(o =>
        o.label && o.label.toLowerCase().includes('cocoa') && o.label.toLowerCase().includes('percent')
      );
      const sortedOpts = hasCocoa
        ? [...product.options].sort((a, b) => {
            const aIsPct = a.label.toLowerCase().includes('cocoa') && a.label.toLowerCase().includes('percent');
            return aIsPct ? -1 : 1;
          })
        : product.options;

      // Colors for cocoa % levels
      const pctColors = { 50: '#6B3D28', 70: '#4A2E1B', 100: '#1A0D07' };
      let chocoWavesEl = null;

      sortedOpts.forEach(optGroup => {
        const isCocoa = optGroup.label.toLowerCase().includes('cocoa') && optGroup.label.toLowerCase().includes('percent');
        const isSweetener = optGroup.label.toLowerCase().includes('sweetener');

        const group = document.createElement('div');
        group.className = 'modal-option-group';
        if (isSweetener && hasCocoa) {
          group.style.cssText = 'display:flex;align-items:center;gap:14px;';
        }

        const inner = document.createElement('div');
        inner.style.flex = '1';

        const label = document.createElement('span');
        label.className = 'modal-option-label';
        label.textContent = optGroup.label;
        inner.appendChild(label);

        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'modal-options';

        optGroup.values.forEach((val, idx) => {
          const pill = document.createElement('button');
          pill.className = 'modal-option-pill';
          pill.textContent = val;
          if (idx === 0) pill.classList.add('selected');
          pill.addEventListener('click', () => {
            optionsContainer.querySelectorAll('.modal-option-pill').forEach(p => p.classList.remove('selected'));
            pill.classList.add('selected');
            if (isCocoa && chocoWavesEl) {
              const m = val.match(/(\d+)%/);
              const pct = m ? parseInt(m[1], 10) : 70;
              const color = pctColors[pct] || '#4A2E1B';
              chocoWavesEl.style.transform = `translateY(${100 - pct}%)`;
              chocoWavesEl.style.background = color;
              chocoWavesEl.querySelectorAll('.wave').forEach(w => w.style.background = color);
            }
            updateModalLivePrice();
          });
          optionsContainer.appendChild(pill);
        });

        inner.appendChild(optionsContainer);
        group.appendChild(inner);

        // Bar goes beside sweetener group
        if (isSweetener && hasCocoa) {
          const barWrap = document.createElement('div');
          barWrap.className = 'modal-choco-wrapper';
          barWrap.innerHTML = `<div class="chocolate-bar-visualizer"><div class="chocolate-bar"><div class="chocolate-liquid-container"><div class="liquid-waves" style="transform:translateY(30%);background:#4A2E1B"><div class="wave wave1" style="background:#4A2E1B"></div><div class="wave wave2" style="background:#4A2E1B"></div><div class="wave wave3" style="background:#4A2E1B"></div></div></div><div class="chocolate-grid-overlay">${Array(15).fill('<div class="chocolate-segment"></div>').join('')}</div></div></div>`;
          chocoWavesEl = barWrap.querySelector('.liquid-waves');
          chocoWavesEl.style.transition = 'transform 0.6s cubic-bezier(0.4,0,0.2,1), background 0.5s ease';
          group.appendChild(barWrap);
        }

        body.appendChild(group);
      });
    }

    // Quantity +/- row (injected after options)
    const qtyRow = document.createElement('div');
    qtyRow.className = 'modal-qty-row';
    qtyRow.innerHTML = `<button class="modal-qty-btn" id="modalQtyMinus">−</button><span class="modal-qty-val" id="modalQtyVal">1</span><button class="modal-qty-btn" id="modalQtyPlus">+</button>`;
    body.appendChild(qtyRow);
    let modalQty = 1;
    qtyRow.querySelector('#modalQtyMinus').addEventListener('click', () => {
      if (modalQty > 1) { modalQty--; qtyRow.querySelector('#modalQtyVal').textContent = modalQty; }
    });
    qtyRow.querySelector('#modalQtyPlus').addEventListener('click', () => {
      modalQty++; qtyRow.querySelector('#modalQtyVal').textContent = modalQty;
    });

    setTimeout(updateModalLivePrice, 0);
  }

    // Set up Add to Cart Action
    const addBtn = modal.querySelector('.modal-add-btn');
    if (addBtn) {
      // Clone button to strip old listeners
      const newAddBtn = addBtn.cloneNode(true);
      addBtn.parentNode.replaceChild(newAddBtn, addBtn);
      
      newAddBtn.addEventListener('click', () => {
        const selectedOptions = {};
        modal.querySelectorAll('.modal-option-group').forEach(group => {
          const optLabel = group.querySelector('.modal-option-label').textContent;
          const selectedPill = group.querySelector('.modal-option-pill.selected');
          if (selectedPill) {
            selectedOptions[optLabel] = selectedPill.textContent;
          }
        });

        // Determine category pricing dynamically
        let itemPrice = 15.00;
        const path = window.location.pathname.toLowerCase();
        if (path.includes('tablets')) itemPrice = 12.00;
        else if (path.includes('snacks')) itemPrice = 15.00;
        else if (path.includes('spreads')) itemPrice = 18.00;
        else if (path.includes('hot-chocolate-ice-cream')) itemPrice = 14.00;
        else if (path.includes('chocolate-slab')) itemPrice = 16.00;

        // If product has a specified price, use it as default
        if (product.price !== undefined) {
          itemPrice = product.price;
        }

        // Check if any selected option has a price format like (₹180) or similar
        let priceFromOptions = null;
        Object.values(selectedOptions).forEach(val => {
          const match = val.match(/\(₹\s*(\d+)(?:\/[a-zA-Z]+)?\)/);
          if (match) {
            priceFromOptions = parseFloat(match[1]);
          }
        });

        if (priceFromOptions !== null) {
          itemPrice = priceFromOptions;
        }

        // Special dynamic pricing for Clusters, Slabs, and Spreads
        const nameLower = product.name?.toLowerCase() || '';
        if (nameLower.includes('cluster') || nameLower.includes('slab') || nameLower.includes('spread')) {
          const sweetener = selectedOptions['Choose Your Sweetener'] || selectedOptions['Choose Sweetener'] || '';
          let rate = 3; // default Muscovado
          if (sweetener.includes('Coconut Sugar')) {
            rate = 4;
          } else if (sweetener.includes('Monk Fruit')) {
            rate = 5;
          }

          // Extract weight/quantity from selected option
          const qtyOpt = selectedOptions['Weight'] || selectedOptions['Choose Weight'] || selectedOptions['Quantity'] || '';
          let grams = 0;
          if (qtyOpt.toLowerCase().includes('1kg')) {
            grams = 1000;
          } else {
            const weightMatch = qtyOpt.match(/(\d+)g/);
            if (weightMatch) {
              grams = parseInt(weightMatch[1], 10);
            }
          }

          if (grams > 0) {
            itemPrice = grams * rate;
          }
        }

        // Special dynamic pricing for Drags
        if (nameLower.includes('drags')) {
          const sweetener = selectedOptions['Choose Your Sweetener'] || '';
          let baseRate = 3; // default Muscovado
          if (nameLower.includes('walnut') || nameLower.includes('coffee')) {
            baseRate = 4;
          } else if (nameLower.includes('nibs')) {
            baseRate = 4.5;
          }

          let rate = baseRate; // default Muscovado
          if (sweetener.includes('Coconut Sugar')) {
            rate = baseRate + 1;
          } else if (sweetener.includes('Monk Fruit')) {
            rate = baseRate + 2;
          }

          itemPrice = 200 * rate; // 200g box
        }

        // Special pricing for Cavities
        if (product.name && product.name.toLowerCase().includes('cavities')) {
          const sweetener = selectedOptions['Choose Your Sweetener'] || '';
          if (sweetener.includes('Coconut Sugar')) {
            itemPrice = 35;
          } else if (sweetener.includes('Monk Fruit')) {
            itemPrice = 45;
          } else {
            itemPrice = 25;
          }
        }

        // Gold glow flash then close
        newAddBtn.classList.add('btn-gold-glow');
        newAddBtn.textContent = '✓ Added!';
        setTimeout(() => {
          if (typeof CartSystem !== 'undefined') {
            CartSystem.addItem({
              name: product.name,
              subtitle: product.subtitle || '',
              icon: product.icon || '🍫',
              price: itemPrice,
              options: selectedOptions,
              minQty: product.minQty || 1
            }, modalQty);
          }
          closeModal();
          newAddBtn.classList.remove('btn-gold-glow');
        }, 700);
      });
    }

    // Show modal
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!backdrop) return;
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Close handlers
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });
  }

  const closeBtn = document.querySelector('.modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });


  // ═══════════════════════════════════════════════════════════
  // SUB-CATEGORY TABS (for Snacks page)
  // ═══════════════════════════════════════════════════════════

  const subTabs = document.querySelectorAll('.sub-tab');
  const tabContents = document.querySelectorAll('.tab-content');

  subTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');

      // Update active tab
      subTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Show corresponding content
      tabContents.forEach(content => {
        if (content.getAttribute('data-tab-content') === target) {
          content.style.display = '';
          // Re-trigger reveal animations
          content.querySelectorAll('.reveal').forEach(el => {
            el.classList.remove('is-visible');
            setTimeout(() => el.classList.add('is-visible'), 50);
          });
          initCocoaBadges();
        } else {
          content.style.display = 'none';
        }
      });

      // Smooth scroll to the top of the products section, offset for sticky header
      const productsSection = tab.closest('.products-section');
      if (productsSection) {
        const offset = window.innerWidth <= 768 ? 70 : 80;
        const targetY = productsSection.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({
          top: targetY,
          behavior: 'smooth'
        });
      }
    });
  });


  // ═══════════════════════════════════════════════════════════
  // MAKE YOUR OWN BUILDER
  // ═══════════════════════════════════════════════════════════

  const slabAddBtn  = document.getElementById('slabAddBtn');
  const beansAddBtn = document.getElementById('beansAddBtn');
  const nibsAddBtn  = document.getElementById('nibsAddBtn');
  const butterAddBtn = document.getElementById('butterAddBtn');

  // Guard: only run on make-your-own page
  if (slabAddBtn) {

  const slabCard   = document.getElementById('slabCard');
  const beansCard  = document.getElementById('beansCard');
  const nibsCard   = document.getElementById('nibsCard');
  const butterCard = document.getElementById('butterCard');

  const slabPrice   = document.getElementById('slabPrice');
  const beansPrice  = document.getElementById('beansPrice');
  const nibsPrice   = document.getElementById('nibsPrice');
  const butterPrice = document.getElementById('butterPrice');

  const slabWeightGroup   = document.getElementById('slabWeightGroup');
  const beansWeightGroup  = document.getElementById('beansWeightGroup');
  const nibsWeightGroup   = document.getElementById('nibsWeightGroup');
  const butterWeightGroup = document.getElementById('butterWeightGroup');

  const slabCustomWeight  = document.getElementById('slabCustomWeight');
  const beansCustomWeight = document.getElementById('beansCustomWeight');
  const nibsCustomWeight  = document.getElementById('nibsCustomWeight');
  const butterCustomWeight = document.getElementById('butterCustomWeight');

  const slabPctGroup   = document.getElementById('slabPctGroup');
  const slabSweetGroup = document.getElementById('slabSweetGroup');
  const slabToppings   = document.getElementById('slabToppings');

  const liquidWaves    = document.getElementById('liquidWaves');
  const slabVisualizer = document.getElementById('slabVisualizer');
  const mcItems        = document.getElementById('mcItems');
  const mcSubtotal     = document.getElementById('mcSubtotal');
  const addToBagBtn    = document.getElementById('addToBagBtn');

  // Product Selection States
  const productStates = {
    slab: true, // Slab is added by default
    beans: false,
    nibs: false,
    butter: false
  };

  // Toggle active product function
  const setupAddBtn = (btn, id, card) => {
    btn.addEventListener('click', () => {
      productStates[id] = !productStates[id];
      if (productStates[id]) {
        btn.classList.add('added');
        btn.textContent = 'Added';
        card.classList.add('active');
      } else {
        btn.classList.remove('added');
        btn.textContent = 'Add';
        card.classList.remove('active');
      }
      render();
    });
  };
  setupAddBtn(slabAddBtn,   'slab',   slabCard);
  setupAddBtn(beansAddBtn,  'beans',  beansCard);
  setupAddBtn(nibsAddBtn,   'nibs',   nibsCard);
  setupAddBtn(butterAddBtn, 'butter', butterCard);

  // Helper: get weight for a product (checks custom input first, then selected pill)
  const getWeight = (weightGroup, customInput, defaultVal, minVal) => {
    let customVal = parseInt(customInput.value, 10);
    if (!isNaN(customVal)) {
      if (customVal < minVal) {
        return minVal; // Clamp to min
      }
      return customVal;
    }
    const selectedPill = weightGroup.querySelector('.pill.sel');
    return parseInt(selectedPill?.dataset.val, 10) || defaultVal;
  };

  // Setup Weight Pill behavior (clears custom input when clicked)
  const setupWeightPills = (group, customInput) => {
    group.querySelectorAll('.pill').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.pill').forEach(b => b.classList.remove('sel'));
        btn.classList.add('sel');
        customInput.value = ''; // Clear custom text box
        render();
      });
    });
  };
  setupWeightPills(slabWeightGroup,   slabCustomWeight);
  setupWeightPills(beansWeightGroup,  beansCustomWeight);
  setupWeightPills(nibsWeightGroup,   nibsCustomWeight);
  setupWeightPills(butterWeightGroup, butterCustomWeight);

  // Setup Custom Weight Input behavior (clears selected weight pills when typed)
  const setupCustomInput = (customInput, group, minVal) => {
    const handleInput = () => {
      let v = parseInt(customInput.value, 10);
      if (!isNaN(v)) {
        group.querySelectorAll('.pill').forEach(b => b.classList.remove('sel'));
      }
      render();
    };
    customInput.addEventListener('input', handleInput);
    customInput.addEventListener('change', handleInput);
    customInput.addEventListener('blur', () => {
      let v = parseInt(customInput.value, 10);
      if (!isNaN(v) && v < minVal) {
        customInput.value = minVal;
      }
      render();
    });
  };
  setupCustomInput(slabCustomWeight,   slabWeightGroup,   250);
  setupCustomInput(beansCustomWeight,  beansWeightGroup,  350);
  setupCustomInput(nibsCustomWeight,   nibsWeightGroup,   250);
  setupCustomInput(butterCustomWeight, butterWeightGroup, 20);

  // Other pills (percentage, sweetener)
  const setupPills = (group) => {
    group.querySelectorAll('.pill').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.pill').forEach(b => b.classList.remove('sel'));
        btn.classList.add('sel');
        render();
      });
    });
  };
  setupPills(slabPctGroup);
  setupPills(slabSweetGroup);

  // Multi-select toppings
  slabToppings.querySelectorAll('.topping').forEach(btn => {
    btn.addEventListener('click', () => { btn.classList.toggle('sel'); render(); });
  });

  // Update visualizer wave colors for slab cocoa %
  const updateVisualizer = (pct) => {
    if (!liquidWaves) return;
    liquidWaves.style.transform = `translateY(${100 - pct}%)`;
    const colors = {
      50:  ['#6A432D', '#7B523A', '#523422'],
      70:  ['#4E3121', '#5D3C2A', '#3B2315'],
      100: ['#120400', '#210C04', '#050100']
    };
    const [m, l, d] = colors[pct] || colors[70];
    liquidWaves.style.setProperty('--cocoa-color',       m);
    liquidWaves.style.setProperty('--cocoa-color-light', l);
    liquidWaves.style.setProperty('--cocoa-color-dark',  d);
  };

  // Main render function — mini cart + subtotal + per-card live pricing
  function render() {
    let html = '';
    let total = 0;
    let anyActive = false;

    // Slab
    const slabW = getWeight(slabWeightGroup, slabCustomWeight, 250, 250);
    const slabPct = parseInt(slabPctGroup.querySelector('.pill.sel')?.dataset.val, 10) || 70;
    const slabSweetBtn = slabSweetGroup.querySelector('.pill.sel');
    const slabSweet = slabSweetBtn?.dataset.val || 'Muscovado Sugar';
    const slabRate = parseInt(slabSweetBtn?.dataset.rate, 10) || 3;
    const slabP = slabW * slabRate;
    if (slabPrice) slabPrice.textContent = '₹' + slabP;

    if (productStates.slab) {
      anyActive = true;
      total += slabP;
      const tops = [...slabToppings.querySelectorAll('.topping.sel')].map(b => b.dataset.val);
      const topsText = tops.length ? tops.join(', ') : 'None';

      updateVisualizer(slabPct);
      if (slabVisualizer) slabVisualizer.style.display = 'block';

      html += `<div class="mc-item">
        <div class="mc-item-left">
          <span class="mc-item-name">Craft Chocolate Slab (${slabW}g)</span>
          <span class="mc-item-desc">${slabPct}% Cocoa · ${slabSweet} · ${topsText}</span>
        </div>
        <span class="mc-item-price">₹${slabP}</span>
      </div>`;
    } else {
      if (slabVisualizer) slabVisualizer.style.display = 'none';
    }

    // Beans
    const beansW = getWeight(beansWeightGroup, beansCustomWeight, 350, 350);
    const beansP = beansW * 3;
    if (beansPrice) beansPrice.textContent = '₹' + beansP;

    if (productStates.beans) {
      anyActive = true;
      total += beansP;
      html += `<div class="mc-item">
        <div class="mc-item-left">
          <span class="mc-item-name">Raw Cocoa Beans</span>
          <span class="mc-item-desc">${beansW}g @ ₹3/g</span>
        </div>
        <span class="mc-item-price">₹${beansP}</span>
      </div>`;
    }

    // Nibs
    const nibsW = getWeight(nibsWeightGroup, nibsCustomWeight, 250, 250);
    const nibsP = nibsW * 3;
    if (nibsPrice) nibsPrice.textContent = '₹' + nibsP;

    if (productStates.nibs) {
      anyActive = true;
      total += nibsP;
      html += `<div class="mc-item">
        <div class="mc-item-left">
          <span class="mc-item-name">Roasted Cocoa Nibs</span>
          <span class="mc-item-desc">${nibsW}g @ ₹3/g</span>
        </div>
        <span class="mc-item-price">₹${nibsP}</span>
      </div>`;
    }

    // Butter
    const butterW = getWeight(butterWeightGroup, butterCustomWeight, 20, 20);
    const butterP = butterW * 5;
    if (butterPrice) butterPrice.textContent = '₹' + butterP;

    if (productStates.butter) {
      anyActive = true;
      total += butterP;
      html += `<div class="mc-item">
        <div class="mc-item-left">
          <span class="mc-item-name">Pure Cocoa Butter</span>
          <span class="mc-item-desc">${butterW}g @ ₹5/g</span>
        </div>
        <span class="mc-item-price">₹${butterP}</span>
      </div>`;
    }

    mcItems.innerHTML = html || '<div class="mc-empty">No items selected</div>';
    mcSubtotal.textContent = '₹' + total;
    addToBagBtn.disabled = !anyActive;
  }

  // Add to bag — ONE combined order
  addToBagBtn.addEventListener('click', () => {
    if (typeof CartSystem === 'undefined') return;

    const parts = [];
    const opts = {};
    let total = 0;

    if (productStates.slab) {
      const w = getWeight(slabWeightGroup, slabCustomWeight, 250, 250);
      const pct = slabPctGroup.querySelector('.pill.sel')?.dataset.val || '70';
      const sweetBtn = slabSweetGroup.querySelector('.pill.sel');
      const sweet = sweetBtn?.dataset.val || 'Muscovado Sugar';
      const rate = parseInt(sweetBtn?.dataset.rate, 10) || 3;
      const tops = [...slabToppings.querySelectorAll('.topping.sel')].map(b => b.dataset.val).join(', ') || 'None';
      const p = w * rate;
      total += p;
      parts.push(`Slab ${w}g`);
      opts['Chocolate Slab'] = `${w}g · ${pct}% · ${sweet} · ₹${p}`;
      opts['Toppings'] = tops;
    }
    if (productStates.beans) {
      const w = getWeight(beansWeightGroup, beansCustomWeight, 350, 350);
      const p = w * 3;
      total += p;
      parts.push(`Beans ${w}g`);
      opts['Cocoa Beans'] = `${w}g · ₹${p}`;
    }
    if (productStates.nibs) {
      const w = getWeight(nibsWeightGroup, nibsCustomWeight, 250, 250);
      const p = w * 3;
      total += p;
      parts.push(`Nibs ${w}g`);
      opts['Cocoa Nibs'] = `${w}g · ₹${p}`;
    }
    if (productStates.butter) {
      const w = getWeight(butterWeightGroup, butterCustomWeight, 20, 20);
      const p = w * 5;
      total += p;
      parts.push(`Butter ${w}g`);
      opts['Cocoa Butter'] = `${w}g · ₹${p}`;
    }

    if (parts.length > 0) {
      CartSystem.addItem({
        name: 'Custom Chocolate Order',
        subtitle: parts.join(' + '),
        icon: '✦',
        price: total,
        category: 'Custom Craft',
        options: opts
      });
      CartSystem.openCart();
    }
  });

  // Init
  render();
  }

  // Hover play for product card videos (Muted and looping)
  document.querySelectorAll('.product-card-video.hover-play').forEach(video => {
    const card = video.closest('.product-grid-card');
    if (card) {
      card.addEventListener('mouseenter', () => {
        video.play().catch(err => console.log('Video play failed:', err));
      });
      card.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0; // Reset to start frame (shows poster)
      });
      
      // Support mobile touch to play/pause
      card.addEventListener('touchstart', () => {
        if (video.paused) {
          document.querySelectorAll('.product-card-video.hover-play').forEach(v => {
            if (v !== video) {
              v.pause();
              v.currentTime = 0;
            }
          });
          video.play().catch(err => console.log(err));
        } else {
          video.pause();
          video.currentTime = 0;
        }
      }, { passive: true });
    }
  });
});
