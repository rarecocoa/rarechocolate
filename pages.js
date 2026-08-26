/* ==========================================================
   RARE COCOA™ — Collection Pages Interactive Scripts
   Product Modal · Filter Options · Sub-tabs · Builder
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {


  // ── Sub-tabs Mobile Scroll Cue ──────────────────────────
  const initSubTabsMobileCue = () => {
    if (window.innerWidth > 768) return;
    const subTabs = document.querySelector('.sub-tabs');
    if (!subTabs) return;

    if (document.getElementById('subTabsScrollCue')) return;

    const cue = document.createElement('div');
    cue.id = 'subTabsScrollCue';
    cue.className = 'sub-tabs-scroll-cue';
    cue.innerHTML = '<span class="glow-sparkle">✨</span> <span>Swipe / Tap Categories &rarr;</span> <span class="glow-sparkle">✨</span>';
    
    subTabs.parentNode.insertBefore(cue, subTabs.nextSibling);
  };
  initSubTabsMobileCue();
  window.addEventListener('resize', initSubTabsMobileCue, { passive: true });

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
    mobileMenu.addEventListener('touchmove', function(e) {
      e.preventDefault();
    }, { passive: false });
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

  // Open modal when product card is clicked (delegated)
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.product-grid-card[data-product]');
    if (!card) return;
    if (e.target.closest('.card-carousel-btn')) return; // don't open modal on carousel click
    const productData = JSON.parse(card.getAttribute('data-product'));
    openModal(productData);
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
  window.initCardCarousels = initCardCarousels;

  // ── Pricing Engine Helpers ─────────────────────────────────
  function RC_getDynamicRate(productName, sweetenerStr, addons) {
    const nameLower = (productName || '').toLowerCase().trim();
    const sweetClean = (sweetenerStr || '').split(' (₹')[0].split(' (+₹')[0].replace(/\s*\(\+₹\d+\/g\)/, '').trim();
    const isMonk = sweetClean.includes('Monk Fruit') || sweetClean.includes('Monk Sweetener') || sweetClean.toLowerCase().includes('monk');
    const isCoconut = sweetClean.includes('Coconut Sugar') || sweetClean.toLowerCase().includes('coconut');

    let addonList = [];
    if (Array.isArray(addons)) {
      addonList = addons.map(a => (a || '').toLowerCase().trim()).filter(Boolean);
    } else if (typeof addons === 'string') {
      addonList = addons.split(',').map(a => a.trim().toLowerCase()).filter(Boolean);
    }

    // 1. Clusters, Slabs, Spreads, Butters, Cookies (excluding cocoa butter/powder)
    if ((nameLower.includes('cluster') || nameLower.includes('slab') || nameLower.includes('spread') || nameLower.includes('peanut butter') || nameLower.includes('almond butter') || nameLower.includes('custom butter') || nameLower.includes('cookie')) && !nameLower.includes('cocoa butter') && !nameLower.includes('cocoa powder')) {
      
      if (nameLower.includes('pecan') || nameLower.includes('brazil') || nameLower.includes('macadamia')) {
        return 6;
      }

      if (nameLower === 'hazelnut cluster') {
        if (isMonk) return 5.5;
        if (isCoconut) return 4.5;
        return 3.5;
      }
      if (nameLower === 'hazelnut spread') {
        if (isMonk) return 5.5;
        return 3.5;
      }
      if (nameLower.includes('medjool') && !nameLower.includes('custom')) {
        if (isMonk) return 6;
        if (isCoconut) return 5.5;
        return 5;
      }

      let baseRate = 3;
      if (isMonk) baseRate = 5;
      else if (isCoconut) baseRate = 4;

      if (addonList.length > 0) {
        let maxRate = baseRate;
        addonList.forEach(addon => {
          let addonRate = baseRate;
          if (addon.includes('medjool')) {
            addonRate = isMonk ? 6 : (isCoconut ? 5.5 : 5);
          } else if (addon.includes('hazelnut')) {
            if (nameLower.includes('cluster')) {
              addonRate = isMonk ? 5.5 : (isCoconut ? 4.5 : 3.5);
            } else {
              addonRate = isMonk ? 5.5 : 3.5;
            }
          }
          if (addonRate > maxRate) {
            maxRate = addonRate;
          }
        });
        return maxRate;
      }

      return baseRate;
    }

    // 2. Drags
    if (nameLower.includes('drags')) {
      let baseRate = 3;
      if (nameLower.includes('nibs') && !nameLower.includes('custom')) {
        baseRate = 4.5;
      } else if ((nameLower.includes('walnut') || nameLower.includes('coffee')) && !nameLower.includes('custom')) {
        baseRate = 4;
      } else if (nameLower.includes('custom')) {
        if (addonList.length > 0) {
          let maxBase = 3;
          addonList.forEach(addon => {
            let itemBase = 3;
            if (addon.includes('nibs')) itemBase = 4.5;
            else if (addon.includes('walnut') || addon.includes('coffee')) itemBase = 4;
            if (itemBase > maxBase) maxBase = itemBase;
          });
          baseRate = maxBase;
        }
      }

      if (isMonk) return baseRate + 2;
      if (isCoconut) return baseRate + 1;
      return baseRate;
    }

    return null;
  }

  function RC_getTabletPrice(productName, basePrice, sweetenerStr, addons) {
    const sweetClean = (sweetenerStr || '').split(' (₹')[0].trim();
    const isMonk = sweetClean.includes('Monk Fruit') || sweetClean.includes('Monk Sweetener') || sweetClean.toLowerCase().includes('monk');
    const isCoconut = sweetClean.includes('Coconut Sugar') || sweetClean.toLowerCase().includes('coconut');

    if (isMonk) return 350;
    if (isCoconut) return 250;

    let addonList = [];
    if (Array.isArray(addons)) {
      addonList = addons.map(a => (a || '').toLowerCase().trim()).filter(Boolean);
    } else if (typeof addons === 'string') {
      addonList = addons.split(',').map(a => a.trim().toLowerCase()).filter(Boolean);
    }

    let maxPrice = basePrice || 200;
    addonList.forEach(addon => {
      let itemPrice = basePrice || 200;
      if (addon.includes('hazelnut')) itemPrice = 215;
      if (itemPrice > maxPrice) maxPrice = itemPrice;
    });

    return maxPrice;
  }
  if (typeof window !== 'undefined') {
    window.RC_getDynamicRate = RC_getDynamicRate;
    window.RC_getTabletPrice = RC_getTabletPrice;
  }

  function openModal(product) {
    if (!backdrop || !modal) return;

    const isCavities = (product.name || '').toLowerCase().includes('cavities');
    const defaultMinQty = isCavities ? 25 : 1;
    let modalQty = defaultMinQty;
    const pctColors = { 50: '#6B3D28', 65: '#523220', 70: '#4A2E1B', 75: '#3D2415', 85: '#29170D', 100: '#1A0D07' };
    let chocoWavesEl = null;

    function adjustCocoaOptions(cleanSelectedSweetener) {
      const isTabletPage = window.location.pathname.toLowerCase().includes('tablets');
      const nameLower = (product.name || '').toLowerCase();
      const isClusterDragPopsicle = nameLower.includes('cluster') || nameLower.includes('drag') || nameLower.includes('popsicle');
      if (!isTabletPage && !isClusterDragPopsicle) return;

      const cocoaGroup = [...modal.querySelectorAll('.modal-option-group')].find(g => {
        const lbl = g.querySelector('.modal-option-label')?.textContent || '';
        return lbl.toLowerCase().includes('cocoa') && lbl.toLowerCase().includes('percent');
      });
      if (!cocoaGroup) return;

      const optionsContainer = cocoaGroup.querySelector('.modal-options');
      if (!optionsContainer) return;

      const isCustomTablet = nameLower.includes('custom');
      const isCoconutSugar = cleanSelectedSweetener.toLowerCase().includes('coconut sugar');
      const isMonk = cleanSelectedSweetener.toLowerCase().includes('monk');

      function getOrCreatePill(label, pct) {
        let p = [...optionsContainer.querySelectorAll('.modal-option-pill')].find(btn => btn.textContent.trim().startsWith(label.split(' ')[0]));
        if (!p) {
          p = document.createElement('button');
          p.className = 'modal-option-pill';
          p.textContent = label;
          p.setAttribute('data-original', label);
          p.addEventListener('click', () => {
            optionsContainer.querySelectorAll('.modal-option-pill').forEach(btn => btn.classList.remove('selected'));
            p.classList.add('selected');
            const ci = optionsContainer.querySelector('.modal-cocoa-custom-input');
            if (ci) ci.value = '';
            
            if (chocoWavesEl) {
              const pctColorVal = pctColors[pct] || '#4A2E1B';
              chocoWavesEl.style.transform = `translateY(${100 - pct}%)`;
              chocoWavesEl.style.background = pctColorVal;
              chocoWavesEl.querySelectorAll('.wave').forEach(w => w.style.background = pctColorVal);
            }
            updateModalLivePrice();
          });
          const ci = optionsContainer.querySelector('.modal-cocoa-custom-input');
          if (ci) {
            optionsContainer.insertBefore(p, ci);
          } else {
            optionsContainer.appendChild(p);
          }
        }
        return p;
      }

      // Ensure 65%, 75%, 85% exist for Monk
      const pill65 = getOrCreatePill('65% Dark', 65);
      const pill75 = getOrCreatePill('75% Dark', 75);
      const pill85 = getOrCreatePill('85% Dark', 85);

      // Get or create custom input
      let customInput = optionsContainer.querySelector('.modal-cocoa-custom-input');
      if (!customInput) {
        customInput = document.createElement('input');
        customInput.type = 'number';
        customInput.className = 'modal-cocoa-custom-input';
        customInput.placeholder = 'Custom %';
        customInput.style.cssText = 'width:95px; padding:6px 10px; margin-left:4px; border-radius:8px; border:1.5px solid var(--border-light); background:var(--bg-primary); color:var(--text-primary); outline:none; font-family:var(--font-body); font-size:0.85rem;';
        customInput.addEventListener('focus', () => customInput.style.borderColor = 'var(--accent)');
        customInput.addEventListener('blur', () => {
          customInput.style.borderColor = 'var(--border-light)';
          let val = parseInt(customInput.value, 10);
          const minVal = parseInt(customInput.min, 10) || 50;
          const maxVal = parseInt(customInput.max, 10) || 100;
          if (!isNaN(val) && val < minVal) customInput.value = minVal;
          if (!isNaN(val) && val > maxVal) customInput.value = maxVal;
        });
        customInput.addEventListener('input', () => {
          if (customInput.value !== '') {
            optionsContainer.querySelectorAll('.modal-option-pill').forEach(p => p.classList.remove('selected'));
          }
          if (chocoWavesEl) {
            const pct = parseInt(customInput.value, 10) || 70;
            const color = pctColors[pct] || '#4A2E1B';
            chocoWavesEl.style.transform = `translateY(${100 - pct}%)`;
            chocoWavesEl.style.background = color;
            chocoWavesEl.querySelectorAll('.wave').forEach(w => w.style.background = color);
          }
          updateModalLivePrice();
        });
        optionsContainer.appendChild(customInput);
      }

      // Visibility Rules:
      const pills = optionsContainer.querySelectorAll('.modal-option-pill');
      pills.forEach(pill => {
        const txt = pill.textContent || '';
        if (isMonk) {
          // Monk Sweetener: 65% Dark, 75% Dark, 85% Dark
          if (txt.includes('65%') || txt.includes('75%') || txt.includes('85%')) {
            pill.style.display = 'inline-flex';
          } else {
            pill.style.display = 'none';
          }
        } else if (isCoconutSugar) {
          // Coconut Sugar: only 50% Dark
          if (txt.includes('50%')) {
            pill.style.display = 'inline-flex';
          } else {
            pill.style.display = 'none';
          }
        } else {
          // Muscovado Sugar: 50% Dark, 70% Dark, 100% Dark
          if (txt.includes('50%') || txt.includes('70%') || txt.includes('100%')) {
            pill.style.display = 'inline-flex';
          } else {
            pill.style.display = 'none';
          }
        }
      });

      // Custom Input Visibility & Ranges:
      if (customInput) {
        if (isMonk) {
          customInput.style.display = 'inline-block';
          customInput.min = 65;
          customInput.max = 85;
          customInput.placeholder = 'Custom % (65-85)';
        } else if (isCustomTablet) {
          customInput.style.display = 'inline-block';
          customInput.min = 50;
          customInput.max = 100;
          customInput.placeholder = 'Custom %';
        } else {
          customInput.style.display = 'none';
          customInput.value = '';
        }
      }

      // Ensure a visible option is selected if the currently selected one is hidden
      const selectedPill = optionsContainer.querySelector('.modal-option-pill.selected');
      const isCustomInputSelected = customInput && customInput.value !== '' && customInput.style.display !== 'none';
      
      const updateVisualizer = (pct) => {
        if (chocoWavesEl) {
          const color = pctColors[pct] || '#4A2E1B';
          chocoWavesEl.style.transform = `translateY(${100 - pct}%)`;
          chocoWavesEl.style.background = color;
          chocoWavesEl.querySelectorAll('.wave').forEach(w => w.style.background = color);
        }
      };

      if (!isCustomInputSelected && (!selectedPill || selectedPill.style.display === 'none')) {
        const firstVisiblePill = [...pills].find(p => p.style.display !== 'none');
        if (firstVisiblePill) {
          pills.forEach(p => p.classList.remove('selected'));
          firstVisiblePill.classList.add('selected');
          
          const m = firstVisiblePill.textContent.match(/(\d+)%/);
          const pct = m ? parseInt(m[1], 10) : 70;
          updateVisualizer(pct);
        }
      } else if (selectedPill && selectedPill.style.display !== 'none') {
        const m = selectedPill.textContent.match(/(\d+)%/);
        const pct = m ? parseInt(m[1], 10) : 70;
        updateVisualizer(pct);
      } else if (isCustomInputSelected) {
        const pct = parseInt(customInput.value, 10) || 70;
        updateVisualizer(pct);
      }
    }

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

      // Check if product or selected add-on involves Hazelnut Spread
      // Only hide Coconut Sugar for the actual Hazelnut Spread product, NOT for custom blends with hazelnut addon
      let isHazelnutActive = nameLower === 'hazelnut spread';
      const addonGroupForCheck = [...modal.querySelectorAll('.modal-option-group')].find(g => {
        const lbl = g.querySelector('.modal-option-label')?.textContent || '';
        return lbl.includes('Add-on');
      });
      if (addonGroupForCheck && nameLower === 'custom spread blend') {
        // Only apply hazelnut hiding on custom SPREAD blend, not cluster blend
        const selAddons = [...addonGroupForCheck.querySelectorAll('.modal-option-pill.selected')].map(p => p.textContent.toLowerCase());
        if (selAddons.some(a => a.includes('hazelnut'))) {
          isHazelnutActive = true;
        }
      }

      // Gather currently selected sweetener
      const sweetenerGroup = [...modal.querySelectorAll('.modal-option-group')].find(g => {
        const lbl = g.querySelector('.modal-option-label')?.textContent || '';
        return lbl.includes('Sweetener');
      });

      if (sweetenerGroup) {
        const pills = sweetenerGroup.querySelectorAll('.modal-option-pill');
        pills.forEach(pill => {
          const originalVal = pill.getAttribute('data-original') || pill.textContent;
          const cleanName = originalVal.split(' (₹')[0].trim().toLowerCase();
          const isMuscovadoOnlySpread = nameLower.includes('pecan') || nameLower.includes('brazil') || nameLower.includes('macadamia');

          if (isMuscovadoOnlySpread && !cleanName.includes('muscovado')) {
            pill.style.display = 'none';
            if (pill.classList.contains('selected')) {
              pill.classList.remove('selected');
              const muscovadoPill = [...pills].find(p => p.textContent.toLowerCase().includes('muscovado'));
              if (muscovadoPill) muscovadoPill.classList.add('selected');
            }
          } else if (isHazelnutActive && cleanName.includes('coconut sugar')) {
            pill.style.display = 'none';
            if (pill.classList.contains('selected')) {
              pill.classList.remove('selected');
              const muscovadoPill = [...pills].find(p => p.textContent.toLowerCase().includes('muscovado'));
              if (muscovadoPill) muscovadoPill.classList.add('selected');
            }
          } else {
            pill.style.display = 'inline-flex';
          }
        });

        let selectedSweetenerPillFinal = sweetenerGroup.querySelector('.modal-option-pill.selected');
        if (!selectedSweetenerPillFinal || selectedSweetenerPillFinal.style.display === 'none') {
          const firstVisible = [...pills].find(p => p.style.display !== 'none');
          if (firstVisible) {
            pills.forEach(p => p.classList.remove('selected'));
            firstVisible.classList.add('selected');
            selectedSweetenerPillFinal = firstVisible;
          }
        }
        if (selectedSweetenerPillFinal) {
          const originalVal = selectedSweetenerPillFinal.getAttribute('data-original') || selectedSweetenerPillFinal.textContent;
          const cleanSweetVal = originalVal.split(' (₹')[0].trim();
          adjustCocoaOptions(cleanSweetVal);
        }
      }
      
      // Gather currently selected options
      const selOpts = {};
      modal.querySelectorAll('.modal-option-group').forEach(g => {
        const lbl = g.querySelector('.modal-option-label')?.textContent;
        const customCocoaInput = g.querySelector('.modal-cocoa-custom-input');
        let sel;
        if (customCocoaInput && customCocoaInput.value !== '') {
          sel = customCocoaInput.value + '%';
        } else {
          const selectedPills = [...g.querySelectorAll('.modal-option-pill.selected')].map(p => p.getAttribute('data-original') || p.textContent);
          const inputSel = g.querySelector('.modal-option-input')?.value;
          if (selectedPills.length > 0) {
            sel = selectedPills.join(', ');
          } else {
            sel = inputSel;
          }
        }
        if (lbl && sel !== undefined && sel !== null) selOpts[lbl] = sel;
      });

      // 1. Update Sweetener pills text dynamically to show prices
      if (sweetenerGroup) {
        const addonGroup = [...modal.querySelectorAll('.modal-option-group')].find(g => {
          const lbl = g.querySelector('.modal-option-label')?.textContent || '';
          return lbl.includes('Add-on');
        });
        const selectedAddons = [...addonGroup?.querySelectorAll('.modal-option-pill.selected') || []].map(p => (p.getAttribute('data-original') || p.textContent).toLowerCase());

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

        const pills = sweetenerGroup.querySelectorAll('.modal-option-pill');
        pills.forEach(pill => {
          const originalVal = pill.getAttribute('data-original') || pill.textContent;
          let sweetName = originalVal.split(' (₹')[0].trim();
          sweetName = sweetName.split(' (+₹')[0].trim();
          sweetName = sweetName.replace(/\s*\(\+₹\d+\/g\)/, '');
          
          let optPrice = null;

          let customRate = null;
          const rateMatch = originalVal.match(/₹([\d.]+)\/g/);
          if (rateMatch) {
            customRate = parseFloat(rateMatch[1]);
          }

          const dynamicRate = (customRate !== null) ? customRate : RC_getDynamicRate(product.name, sweetName, selectedAddons);

          if (dynamicRate !== null) {
            if (grams > 0) optPrice = grams * dynamicRate;
          } else if (nameLower.includes('cavities')) {
            if (sweetName.includes('Coconut Sugar')) optPrice = 35;
            else if (sweetName.includes('Monk Fruit')) optPrice = 45;
            else optPrice = 25;
          } else if (nameLower.includes('custom tablet blend') || nameLower.includes('tablet') || window.location.pathname.toLowerCase().includes('tablets')) {
            optPrice = RC_getTabletPrice(product.name, product.price, sweetName, selectedAddons);
          }

          if (optPrice !== null) {
            pill.textContent = `${sweetName} (₹${optPrice})`;
          }
        });
      }

      // 2. Calculate final selected item price
      let finalPrice = product.price;
      
      const selectedSweetener = selOpts['Choose Your Sweetener'] || selOpts['Choose Sweetener'] || '';
      const cleanSelectedSweetener = selectedSweetener.split(' (₹')[0].trim();
      const addonVal = selOpts['Choose Add-on'] || '';

      const dynamicRate = RC_getDynamicRate(product.name, cleanSelectedSweetener, addonVal);
      if (dynamicRate !== null) {
        const qtyOpt = selOpts['Weight'] || selOpts['Choose Weight'] || selOpts['Quantity'] || '';
        let grams = 0;
        if (qtyOpt.toLowerCase().includes('1kg')) grams = 1000;
        else {
          const m = qtyOpt.match(/(\d+)g/);
          if (m) grams = parseInt(m[1], 10);
        }
        if (grams > 0) finalPrice = grams * dynamicRate;
      } else if (nameLower.includes('cavities')) {
        if (cleanSelectedSweetener.includes('Coconut Sugar')) finalPrice = 35;
        else if (cleanSelectedSweetener.includes('Monk Fruit')) finalPrice = 45;
        else finalPrice = 25;
      } else if (nameLower.includes('custom tablet blend') || nameLower.includes('tablet') || window.location.pathname.toLowerCase().includes('tablets')) {
        finalPrice = RC_getTabletPrice(product.name, product.price, cleanSelectedSweetener, addonVal);
      } else {
        // Fallback: check if any selected option has a price format in parentheses
        Object.entries(selOpts).forEach(([optLabel, val]) => {
          if (optLabel.toLowerCase().includes('sweetener')) return;
          const match = val.match(/\(₹\s*(\d+)(?:\/[a-zA-Z]+)?\)/);
          if (match) finalPrice = parseFloat(match[1]);
        });
      }

      // Update Add to Selection button text
      const modalAddBtn = modal.querySelector('.modal-add-btn');
      const isMaintActive = (typeof window.RC_MAINTENANCE_MODE !== 'undefined') ? window.RC_MAINTENANCE_MODE : ((typeof RC_MAINTENANCE_MODE !== 'undefined') ? RC_MAINTENANCE_MODE : false);
      const isAdmin = window.location.search.indexOf('admin=true') !== -1;
      if (modalAddBtn) {
        if (!isMaintActive || isAdmin) {
          modalAddBtn.style.pointerEvents = 'auto';
          modalAddBtn.style.opacity = '1';
          modalAddBtn.style.cursor = 'pointer';
          if (finalPrice !== undefined && finalPrice !== null) {
            modalAddBtn.textContent = `Add to Selection — ₹${finalPrice}`;
          } else {
            modalAddBtn.textContent = 'Add to Selection';
          }
        } else {
          modalAddBtn.textContent = 'ORDERS TEMPORARILY PAUSED (SITE MAINTENANCE)';
          modalAddBtn.style.pointerEvents = 'none';
          modalAddBtn.style.opacity = '0.65';
          modalAddBtn.style.cursor = 'not-allowed';
        }
      }
    }

    if (product.options && product.options.length > 0) {
      const nameLower = (product.name || '').toLowerCase();
      const isCustomTrailPack = nameLower.includes('custom trail pack');
      if (isCustomTrailPack) {
        if (!product._flavorValuesBackup) {
          const origFlavorOpt = product.options.find(o => o.label && o.label.toLowerCase().includes('select flavor'));
          if (origFlavorOpt && origFlavorOpt.values && origFlavorOpt.values.length > 0) {
            product._flavorValuesBackup = origFlavorOpt.values;
          } else {
            product._flavorValuesBackup = ['Almond', 'Almond Raisin', 'Blueberry Almond', 'Cashew Almond', 'Cranberry Almond', 'Creamy Coffee', 'Mango', 'Orange Almond', 'Signature', 'Strawberry Pineapple'];
          }
        }
        product.options = product.options.filter(o => !o.label || !o.label.toLowerCase().includes('select flavor'));
        for (let i = 1; i <= 6; i++) {
          product.options.push({
            label: `Select Flavor ${i}`,
            values: product._flavorValuesBackup
          });
        }
      }

      const isTabletPage = window.location.pathname.toLowerCase().includes('tablets');
      const isSpreadsPage = window.location.pathname.toLowerCase().includes('spreads');
      const isCocoaOpt = (o) => o && o.label && o.label.toLowerCase().includes('cocoa') && o.label.toLowerCase().includes('percent');
      
      const isClusterDragPopsicle = nameLower.includes('cluster') || nameLower.includes('drag') || nameLower.includes('popsicle');
      
      const needsCocoa = (isTabletPage || 
                          isClusterDragPopsicle || 
                          (isSpreadsPage && product.options.some(o => o.label && o.label.toLowerCase().includes('sweetener')))) 
                         && !product.options.some(isCocoaOpt);
      
      if (needsCocoa) {
        product.options.unshift({
          label: 'Choose Cocoa Percentage',
          values: ['50% Dark', '70% Dark', '100% Dark']
        });
      }
      const hasCocoa = product.options.some(isCocoaOpt);
      const sortedOpts = hasCocoa
        ? [...product.options].sort((a, b) => (isCocoaOpt(a) ? -1 : 1))
        : product.options;

      // Colors and wave visualizer reference are defined at the top of openModal

      const isCustomProduct = product.name && product.name.toLowerCase().includes('custom');
      let waNoticeAdded = false;

      sortedOpts.forEach(optGroup => {
        const isAddon = optGroup.label.toLowerCase().includes('add-on');

        if (isCustomProduct && isAddon) {
          if (!waNoticeAdded) {
            waNoticeAdded = true;
            const waNoticeGroup = document.createElement('div');
            waNoticeGroup.className = 'modal-option-group custom-wa-notice-group';
            waNoticeGroup.style.margin = '14px 0';
            waNoticeGroup.innerHTML = `
              <div style="padding: 12px 16px; background: rgba(37, 211, 102, 0.08); border: 1.5px solid rgba(37, 211, 102, 0.3); border-radius: 12px; display: flex; align-items: center; justify-content: space-between; gap: 12px; font-family: var(--font-body); flex-wrap: wrap;">
                <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">For further customisations:</span>
                <a href="https://wa.me/918374013232?text=Hi%20Rare%20Cocoa%2C%20I%20want%20to%20request%20further%20customisations%20for%20${encodeURIComponent(product.name)}" target="_blank" rel="noopener" style="display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; background: #25D366; color: #fff; border-radius: 20px; text-decoration: none; font-size: 0.8rem; font-weight: 600; transition: all 0.2s ease;">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/></svg>
                  Contact us on WhatsApp &rarr;
                </a>
              </div>
            `;
            body.appendChild(waNoticeGroup);
          }
          return;
        }

        const isCocoa = isCocoaOpt(optGroup);
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

        if (optGroup.values) {
          optGroup.values.forEach((val, idx) => {
            const pill = document.createElement('button');
            pill.className = 'modal-option-pill';
            pill.textContent = val;
            pill.setAttribute('data-original', val);
            if (idx === 0 && !isAddon) pill.classList.add('selected');
            pill.addEventListener('click', () => {
              if (isAddon) {
                if (val.toLowerCase() === 'plain' || val.toLowerCase() === 'none') {
                  optionsContainer.querySelectorAll('.modal-option-pill').forEach(p => p.classList.remove('selected'));
                  pill.classList.add('selected');
                } else {
                  optionsContainer.querySelectorAll('.modal-option-pill').forEach(p => {
                    if (p.textContent.toLowerCase() === 'plain' || p.textContent.toLowerCase() === 'none') {
                      p.classList.remove('selected');
                    }
                  });
                  pill.classList.toggle('selected');
                  const anySelected = [...optionsContainer.querySelectorAll('.modal-option-pill')].some(p => p.classList.contains('selected'));
                  if (!anySelected) {
                    optionsContainer.querySelectorAll('.modal-option-pill').forEach(p => {
                      if (p.textContent.toLowerCase() === 'plain' || p.textContent.toLowerCase() === 'none') {
                        p.classList.add('selected');
                      }
                    });
                  }
                }
              } else {
                optionsContainer.querySelectorAll('.modal-option-pill').forEach(p => p.classList.remove('selected'));
                pill.classList.add('selected');
              }
              
              // Clear custom input if present
              const customInput = optionsContainer.querySelector('.modal-cocoa-custom-input');
              if (customInput) customInput.value = '';

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

          // Add custom input for Cocoa Percentage (only for custom products)
          const isCustomProduct = product.name && (
            product.name.toLowerCase().includes('custom') ||
            product.name.toLowerCase().includes('plain')
          );
          if (isCocoa && isCustomProduct && !optionsContainer.querySelector('.modal-cocoa-custom-input')) {
            const customInput = document.createElement('input');
            customInput.type = 'number';
            customInput.min = 50;
            customInput.max = 100;
            customInput.placeholder = 'Custom %';
            customInput.className = 'modal-cocoa-custom-input';
            customInput.style.cssText = 'width:90px; padding:6px 10px; margin-left:10px; border-radius:8px; border:1.5px solid var(--border-light); background:var(--bg-primary); color:var(--text-primary); outline:none; font-family:var(--font-body); font-size:0.85rem;';
            customInput.addEventListener('focus', () => customInput.style.borderColor = 'var(--accent)');
            customInput.addEventListener('blur', () => {
              customInput.style.borderColor = 'var(--border-light)';
              let val = parseInt(customInput.value, 10);
              const minVal = parseInt(customInput.min, 10) || 50;
              if (!isNaN(val) && val < minVal) customInput.value = minVal;
              if (!isNaN(val) && val > 100) customInput.value = 100;
            });
            customInput.addEventListener('input', () => {
              if (customInput.value !== '') {
                optionsContainer.querySelectorAll('.modal-option-pill').forEach(p => p.classList.remove('selected'));
              }
              if (chocoWavesEl) {
                const pct = parseInt(customInput.value, 10) || 70;
                const color = pctColors[pct] || '#4A2E1B';
                chocoWavesEl.style.transform = `translateY(${100 - pct}%)`;
                chocoWavesEl.style.background = color;
                chocoWavesEl.querySelectorAll('.wave').forEach(w => w.style.background = color);
              }
              updateModalLivePrice();
            });
            optionsContainer.appendChild(customInput);
          }
        } else if (optGroup.type === 'text') {
          const input = document.createElement('input');
          input.type = 'text';
          input.className = 'modal-option-input';
          input.placeholder = optGroup.placeholder || '';
          input.value = optGroup.value || '';
          input.style.cssText = 'width:100%; padding:10px 14px; border-radius:8px; border:1.5px solid var(--border-light); background:var(--bg-primary); color:var(--text-primary); outline:none; transition:border-color 0.2s; font-family:var(--font-body); font-size:0.85rem;';
          input.addEventListener('focus', () => input.style.borderColor = 'var(--accent)');
          input.addEventListener('blur', () => input.style.borderColor = 'var(--border-light)');
          input.addEventListener('input', () => updateModalLivePrice());
          optionsContainer.appendChild(input);
        } else if (optGroup.type === 'number') {
          const input = document.createElement('input');
          input.type = 'number';
          input.className = 'modal-option-input';
          if (optGroup.min !== undefined) input.min = optGroup.min;
          if (optGroup.max !== undefined) input.max = optGroup.max;
          input.placeholder = optGroup.placeholder || '';
          input.value = optGroup.value || '';
          if (optGroup.disabled) input.disabled = true;
          input.style.cssText = 'width:120px; padding:10px 14px; border-radius:8px; border:1.5px solid var(--border-light); background:var(--bg-primary); color:var(--text-primary); outline:none; transition:border-color 0.2s; font-family:var(--font-body); font-size:0.85rem;';
          input.addEventListener('focus', () => input.style.borderColor = 'var(--accent)');
          input.addEventListener('blur', () => {
            input.style.borderColor = 'var(--border-light)';
            let val = parseInt(input.value, 10);
            if (!isNaN(val)) {
              if (optGroup.min !== undefined && val < optGroup.min) input.value = optGroup.min;
              if (optGroup.max !== undefined && val > optGroup.max) input.value = optGroup.max;
            }
          });
          input.addEventListener('input', () => {
            if (isCocoa && chocoWavesEl) {
              const pct = parseInt(input.value, 10) || 70;
              const color = pctColors[pct] || '#4A2E1B';
              chocoWavesEl.style.transform = `translateY(${100 - pct}%)`;
              chocoWavesEl.style.background = color;
              chocoWavesEl.querySelectorAll('.wave').forEach(w => w.style.background = color);
            }
            updateModalLivePrice();
          });
          optionsContainer.appendChild(input);
        }

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

      if (isCustomProduct && !waNoticeAdded) {
        const waNoticeGroup = document.createElement('div');
        waNoticeGroup.className = 'modal-option-group custom-wa-notice-group';
        waNoticeGroup.style.margin = '14px 0';
        waNoticeGroup.innerHTML = `
          <div style="padding: 12px 16px; background: rgba(37, 211, 102, 0.08); border: 1.5px solid rgba(37, 211, 102, 0.3); border-radius: 12px; display: flex; align-items: center; justify-content: space-between; gap: 12px; font-family: var(--font-body); flex-wrap: wrap;">
            <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">For further customisations:</span>
            <a href="https://wa.me/918374013232?text=Hi%20Rare%20Cocoa%2C%20I%20want%20to%20request%20further%20customisations%20for%20${encodeURIComponent(product.name)}" target="_blank" rel="noopener" style="display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; background: #25D366; color: #fff; border-radius: 20px; text-decoration: none; font-size: 0.8rem; font-weight: 600; transition: all 0.2s ease;">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/></svg>
              Contact us on WhatsApp &rarr;
            </a>
          </div>
        `;
        body.appendChild(waNoticeGroup);
      }
    }

    // Quantity +/- row (injected after options)
    const qtyRow = document.createElement('div');
    qtyRow.className = 'modal-qty-row';
    qtyRow.innerHTML = `<button class="modal-qty-btn" id="modalQtyMinus">−</button><span class="modal-qty-val" id="modalQtyVal">${modalQty}</span><button class="modal-qty-btn" id="modalQtyPlus">+</button>`;
    body.appendChild(qtyRow);
    const minusBtn = qtyRow.querySelector('#modalQtyMinus');
    const plusBtn = qtyRow.querySelector('#modalQtyPlus');

    minusBtn.addEventListener('click', () => {
      if (modalQty > defaultMinQty) { 
        modalQty--; 
        qtyRow.querySelector('#modalQtyVal').textContent = modalQty; 
      }
      minusBtn.classList.remove('flash-active');
      void minusBtn.offsetWidth; // trigger reflow
      minusBtn.classList.add('flash-active');
    });
    minusBtn.addEventListener('animationend', () => {
      minusBtn.classList.remove('flash-active');
    });

    plusBtn.addEventListener('click', () => {
      modalQty++; 
      qtyRow.querySelector('#modalQtyVal').textContent = modalQty;
      plusBtn.classList.remove('flash-active');
      void plusBtn.offsetWidth; // trigger reflow
      plusBtn.classList.add('flash-active');
    });
    plusBtn.addEventListener('animationend', () => {
      plusBtn.classList.remove('flash-active');
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
          const customCocoaInput = group.querySelector('.modal-cocoa-custom-input');
          if (customCocoaInput && customCocoaInput.value !== '') {
            const val = parseInt(customCocoaInput.value, 10);
            const minVal = parseInt(customCocoaInput.min, 10) || 50;
            const maxVal = parseInt(customCocoaInput.max, 10) || 100;
            let clampedVal = val;
            if (!isNaN(val)) {
              if (val < minVal) clampedVal = minVal;
              if (val > maxVal) clampedVal = maxVal;
              customCocoaInput.value = clampedVal;
            }
            selectedOptions[optLabel] = clampedVal + '%';
          } else {
            const selectedPills = [...group.querySelectorAll('.modal-option-pill.selected')].map(p => p.getAttribute('data-original') || p.textContent);
            const inputVal = group.querySelector('.modal-option-input')?.value;
            if (selectedPills.length > 0) {
              selectedOptions[optLabel] = selectedPills.join(', ');
            } else if (inputVal !== undefined && inputVal !== '') {
              selectedOptions[optLabel] = inputVal;
            }
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
        Object.entries(selectedOptions).forEach(([optLabel, val]) => {
          // Exclude rates like (₹3/g) from setting a flat price
          if (val.indexOf('/g') !== -1 || val.indexOf('/pc') !== -1) return;
          // Exclude sweetener options from overriding flat prices
          if (optLabel.toLowerCase().includes('sweetener')) return;
          const match = val.match(/\(₹\s*(\d+)(?:\/[a-zA-Z]+)?\)/);
          if (match) {
            priceFromOptions = parseFloat(match[1]);
          }
        });

        if (priceFromOptions !== null) {
          itemPrice = priceFromOptions;
        }

        // Special dynamic pricing for all categories via pricing engine
        const nameLower = product.name?.toLowerCase() || '';
        const sweetener = selectedOptions['Choose Your Sweetener'] || selectedOptions['Choose Sweetener'] || '';
        const addonVal = selectedOptions['Choose Add-on'] || '';
        let customRate = null;
        const rateMatch = sweetener.match(/₹([\d.]+)\/g/);
        if (rateMatch) {
          customRate = parseFloat(rateMatch[1]);
        }

        const dynamicRate = (customRate !== null) ? customRate : RC_getDynamicRate(product.name, sweetener, addonVal);
        if (dynamicRate !== null) {
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
            itemPrice = grams * dynamicRate;
          }
        } else if (nameLower.includes('cavities')) {
          if (sweetener.includes('Coconut Sugar')) {
            itemPrice = 35;
          } else if (sweetener.includes('Monk Fruit')) {
            itemPrice = 45;
          } else {
            itemPrice = 25;
          }
        } else if (nameLower.includes('custom tablet blend') || nameLower.includes('tablet') || window.location.pathname.toLowerCase().includes('tablets')) {
          itemPrice = RC_getTabletPrice(product.name, product.price, sweetener, addonVal);
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
              minQty: defaultMinQty
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
  // SUB-CATEGORY TABS (Moved to products-db.js)
  // ═══════════════════════════════════════════════════════════


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
  const sugarCard  = document.getElementById('sugarCard');

  const slabPrice   = document.getElementById('slabPrice');
  const beansPrice  = document.getElementById('beansPrice');
  const nibsPrice   = document.getElementById('nibsPrice');
  const butterPrice = document.getElementById('butterPrice');
  const sugarPrice  = document.getElementById('sugarPrice');

  const slabWeightGroup   = document.getElementById('slabWeightGroup');
  const beansWeightGroup  = document.getElementById('beansWeightGroup');
  const nibsWeightGroup   = document.getElementById('nibsWeightGroup');
  const butterWeightGroup = document.getElementById('butterWeightGroup');
  const sugarWeightGroup  = document.getElementById('sugarWeightGroup');

  const slabCustomWeight  = document.getElementById('slabCustomWeight');
  const beansCustomWeight = document.getElementById('beansCustomWeight');
  const nibsCustomWeight  = document.getElementById('nibsCustomWeight');
  const butterCustomWeight = document.getElementById('butterCustomWeight');
  const sugarCustomWeight  = document.getElementById('sugarCustomWeight');

  const slabPctGroup   = document.getElementById('slabPctGroup');
  const slabSweetGroup = document.getElementById('slabSweetGroup');
  const slabToppings   = document.getElementById('slabToppings');

  const liquidWaves    = document.getElementById('liquidWaves');
  const slabVisualizer = document.getElementById('slabVisualizer');
  const mcItems        = document.getElementById('mcItems');
  const mcSubtotal     = document.getElementById('mcSubtotal');
  const addToBagBtn    = document.getElementById('addToBagBtn');
  const sugarAddBtn    = document.getElementById('sugarAddBtn');

  // Product Selection States
  const productStates = {
    slab: true, // Slab is added by default
    beans: false,
    nibs: false,
    butter: false,
    sugar: false
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
  setupAddBtn(sugarAddBtn,  'sugar',  sugarCard);

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
  setupWeightPills(sugarWeightGroup,  sugarCustomWeight);

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
  setupCustomInput(beansCustomWeight,  beansWeightGroup,  500);
  setupCustomInput(nibsCustomWeight,   nibsWeightGroup,   250);
  setupCustomInput(butterCustomWeight, butterWeightGroup, 20);
  setupCustomInput(sugarCustomWeight,  sugarWeightGroup,  1000);

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
    const beansW = getWeight(beansWeightGroup, beansCustomWeight, 500, 500);
    const beansP = beansW * 1;
    if (beansPrice) beansPrice.textContent = '₹' + beansP.toLocaleString('en-IN');

    if (productStates.beans) {
      anyActive = true;
      total += beansP;
      html += `<div class="mc-item">
        <div class="mc-item-left">
          <span class="mc-item-name">Raw Cocoa Beans</span>
          <span class="mc-item-desc">${beansW}g @ ₹1/g</span>
        </div>
        <span class="mc-item-price">₹${beansP.toLocaleString('en-IN')}</span>
      </div>`;
    }

    // Nibs
    const nibsW = getWeight(nibsWeightGroup, nibsCustomWeight, 250, 250);
    const nibsP = nibsW * 2;
    if (nibsPrice) nibsPrice.textContent = '₹' + nibsP.toLocaleString('en-IN');

    if (productStates.nibs) {
      anyActive = true;
      total += nibsP;
      html += `<div class="mc-item">
        <div class="mc-item-left">
          <span class="mc-item-name">Roasted Cocoa Nibs</span>
          <span class="mc-item-desc">${nibsW}g @ ₹2/g</span>
        </div>
        <span class="mc-item-price">₹${nibsP.toLocaleString('en-IN')}</span>
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

    // Sugar
    const sugarW = getWeight(sugarWeightGroup, sugarCustomWeight, 1000, 1000);
    const sugarP = Math.round(sugarW * 0.35);
    if (sugarPrice) sugarPrice.textContent = '₹' + sugarP;

    if (productStates.sugar) {
      anyActive = true;
      total += sugarP;
      html += `<div class="mc-item">
        <div class="mc-item-left">
          <span class="mc-item-name">Muscovado Sugar</span>
          <span class="mc-item-desc">${sugarW}g @ ₹0.35/g</span>
        </div>
        <span class="mc-item-price">₹${sugarP}</span>
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
      const w = getWeight(beansWeightGroup, beansCustomWeight, 500, 500);
      const p = w * 1;
      total += p;
      parts.push(`Beans ${w}g`);
      opts['Cocoa Beans'] = `${w}g · ₹${p}`;
    }
    if (productStates.nibs) {
      const w = getWeight(nibsWeightGroup, nibsCustomWeight, 250, 250);
      const p = w * 2;
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
    if (productStates.sugar) {
      const w = getWeight(sugarWeightGroup, sugarCustomWeight, 1000, 1000);
      const p = Math.round(w * 0.35);
      total += p;
      parts.push(`Sugar ${w}g`);
      opts['Muscovado Sugar'] = `${w}g · ₹${p}`;
    }

    if (parts.length > 0) {
      CartSystem.addItem({
        name: 'Make Your Own Chocolate Bag',
        subtitle: parts.join(' + '),
        icon: '🛍',
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
