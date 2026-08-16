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
    cue.innerHTML = 'Scroll categories &rarr;';
    
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

  // (cocoa bar is in the modal, not on cards)

  function openModal(product) {
    if (!backdrop || !modal) return;

    const isCavities = (product.name || '').toLowerCase().includes('cavities');
    const defaultMinQty = isCavities ? 25 : 1;
    let modalQty = defaultMinQty;
    const pctColors = { 50: '#6B3D28', 65: '#523220', 70: '#4A2E1B', 100: '#1A0D07' };
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

      // Get or create the 65% Dark pill
      let pill65 = [...optionsContainer.querySelectorAll('.modal-option-pill')].find(p => p.textContent.includes('65%'));
      if (isMonk && !pill65) {
        pill65 = document.createElement('button');
        pill65.className = 'modal-option-pill';
        pill65.textContent = '65% Dark';
        pill65.setAttribute('data-original', '65% Dark');
        pill65.addEventListener('click', () => {
          optionsContainer.querySelectorAll('.modal-option-pill').forEach(p => p.classList.remove('selected'));
          pill65.classList.add('selected');
          const customInput = optionsContainer.querySelector('.modal-cocoa-custom-input');
          if (customInput) customInput.value = '';
          
          if (chocoWavesEl) {
            const pctColorVal = pctColors[65] || '#523220';
            chocoWavesEl.style.transform = `translateY(${100 - 65}%)`;
            chocoWavesEl.style.background = pctColorVal;
            chocoWavesEl.querySelectorAll('.wave').forEach(w => w.style.background = pctColorVal);
          }
          updateModalLivePrice();
        });
        const customInput = optionsContainer.querySelector('.modal-cocoa-custom-input');
        if (customInput) {
          optionsContainer.insertBefore(pill65, customInput);
        } else {
          optionsContainer.appendChild(pill65);
        }
      }

      // Loop through all pills and control visibility
      const pills = optionsContainer.querySelectorAll('.modal-option-pill');
      pills.forEach(pill => {
        const txt = pill.textContent || '';
        if (isMonk) {
          if (txt.includes('65%')) {
            pill.style.display = '';
          } else {
            pill.style.display = 'none';
          }
        } else if (isCoconutSugar) {
          if (txt.includes('65%')) {
            pill.style.display = 'none';
          } else if (txt.includes('70%')) {
            pill.style.display = 'none';
          } else if (txt.includes('100%')) {
            pill.style.display = 'none';
          } else {
            pill.style.display = '';
          }
        } else {
          if (txt.includes('65%')) {
            pill.style.display = 'none';
          } else {
            pill.style.display = '';
          }
        }
      });

      // Handle custom input if custom tablet product
      const customInput = optionsContainer.querySelector('.modal-cocoa-custom-input');
      if (customInput) {
        if (isMonk) {
          customInput.min = 65;
          const val = parseInt(customInput.value, 10);
          if (!isNaN(val) && val < 65) {
            customInput.value = 65;
          }
        } else {
          customInput.min = 50;
        }
      }

      // Ensure a visible option is selected if the currently selected one is hidden
      const selectedPill = optionsContainer.querySelector('.modal-option-pill.selected');
      const isCustomInputSelected = customInput && customInput.value !== '';
      
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

      // Check if product or selected add-on involves Hazelnut Spread or Hazelnut custom add-on
      let isHazelnutActive = nameLower.includes('hazelnut spread');
      const addonGroupForCheck = [...modal.querySelectorAll('.modal-option-group')].find(g => {
        const lbl = g.querySelector('.modal-option-label')?.textContent || '';
        return lbl.includes('Add-on');
      });
      if (addonGroupForCheck) {
        const selAddons = [...addonGroupForCheck.querySelectorAll('.modal-option-pill.selected')].map(p => p.textContent.toLowerCase());
        if (selAddons.some(a => a.includes('hazelnut'))) {
          isHazelnutActive = true;
        }
      }

      // Adjust cocoa options dynamically based on sweetener selection first
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
          } else if ((isHazelnutActive || nameLower.includes('custom')) && cleanName.includes('coconut sugar')) {
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

        const selectedSweetenerPill = sweetenerGroup.querySelector('.modal-option-pill.selected');
        if (selectedSweetenerPill) {
          const originalVal = selectedSweetenerPill.getAttribute('data-original') || selectedSweetenerPill.textContent;
          const cleanSelectedSweetener = originalVal.split(' (₹')[0].trim();
          adjustCocoaOptions(cleanSelectedSweetener);
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
        const pills = sweetenerGroup.querySelectorAll('.modal-option-pill');
        pills.forEach(pill => {
          const originalVal = pill.getAttribute('data-original') || pill.textContent;
          // Get clean sweetener name (remove any previous price tag like "(₹300)" or rates)
          let sweetName = originalVal.split(' (₹')[0].trim();
          sweetName = sweetName.split(' (+₹')[0].trim();
          sweetName = sweetName.replace(/\s*\(\+₹\d+\/g\)/, '');
          
          let optPrice = null;

          let customRate = null;
          const rateMatch = originalVal.match(/₹([\d.]+)\/g/);
          if (rateMatch) {
            customRate = parseFloat(rateMatch[1]);
          }

          if ((nameLower.includes('cluster') || nameLower.includes('slab') || nameLower.includes('spread') || nameLower.includes('peanut butter') || nameLower.includes('almond butter') || nameLower.includes('custom butter') || nameLower.includes('cookie')) && !nameLower.includes('cocoa butter') && !nameLower.includes('cocoa powder')) {
            let rate = 3;
            if (customRate !== null) {
              rate = customRate;
            } else {
              let checkHazelnut = nameLower.includes('hazelnut spread');
              let checkMedjool = nameLower.includes('medjool');
              let check6RsSpread = nameLower.includes('macadamia') || nameLower.includes('brazil') || nameLower.includes('pecan');
              if (nameLower.includes('custom cluster blend') || nameLower.includes('custom spread blend')) {
                const addonGroup = [...modal.querySelectorAll('.modal-option-group')].find(g => {
                  const lbl = g.querySelector('.modal-option-label')?.textContent || '';
                  return lbl.includes('Add-on');
                });
                const selectedAddons = [...addonGroup?.querySelectorAll('.modal-option-pill.selected') || []].map(p => p.textContent.toLowerCase());
                if (selectedAddons.some(a => a.includes('hazelnut'))) {
                  checkHazelnut = true;
                } else if (selectedAddons.some(a => a.includes('medjool'))) {
                  checkMedjool = true;
                }
              }

              if (check6RsSpread) {
                rate = 6;
              } else if (checkHazelnut) {
                rate = 3.5;
                if (sweetName.includes('Monk Fruit') || sweetName.includes('Monk Sweetener')) rate = 5.5;
              } else if (checkMedjool) {
                rate = 5;
                if (sweetName.includes('Monk Fruit') || sweetName.includes('Monk Sweetener')) rate = 6;
              } else {
                if (sweetName.includes('Coconut Sugar')) rate = 4;
                else if (sweetName.includes('Monk Fruit') || sweetName.includes('Monk Sweetener')) rate = 5;
              }
            }

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
            if (customRate !== null) {
              baseRate = customRate;
            } else {
              let checkWalnutOrCoffee = nameLower.includes('walnut') || nameLower.includes('coffee');
              let checkNibs = nameLower.includes('nibs');
              if (nameLower.includes('custom drags blend')) {
                const addonGroup = [...modal.querySelectorAll('.modal-option-group')].find(g => {
                  const lbl = g.querySelector('.modal-option-label')?.textContent || '';
                  return lbl.includes('Add-on');
                });
                const selectedAddons = [...addonGroup?.querySelectorAll('.modal-option-pill.selected') || []].map(p => p.textContent.toLowerCase());
                if (selectedAddons.some(a => a.includes('nibs'))) {
                  checkNibs = true;
                }
                if (selectedAddons.some(a => a.includes('walnut') || a.includes('coffee'))) {
                  checkWalnutOrCoffee = true;
                }
              }

              if (checkNibs) baseRate = 4.5;
              else if (checkWalnutOrCoffee) baseRate = 4;
            }

            let rate = baseRate;
            if (customRate === null) {
              if (sweetName.includes('Coconut Sugar')) rate = baseRate + 1;
              else if (sweetName.includes('Monk Fruit')) rate = baseRate + 2;
            }

            // Find selected weight
            const qtyGroup = [...modal.querySelectorAll('.modal-option-group')].find(g => {
              const lbl = g.querySelector('.modal-option-label')?.textContent || '';
              return lbl.includes('Weight') || lbl.includes('Quantity');
            });
            const qtyOpt = qtyGroup?.querySelector('.modal-option-pill.selected')?.textContent || '';
            let grams = 0;
            const m = qtyOpt.match(/(\d+)g/);
            if (m) grams = parseInt(m[1], 10);
            if (grams > 0) optPrice = grams * rate;
          } else if (nameLower.includes('cavities')) {
            if (sweetName.includes('Coconut Sugar')) optPrice = 35;
            else if (sweetName.includes('Monk Fruit')) optPrice = 45;
            else optPrice = 25;
          } else if (nameLower.includes('custom tablet blend') || nameLower.includes('tablet') || window.location.pathname.toLowerCase().includes('tablets')) {
            const addonGroup = [...modal.querySelectorAll('.modal-option-group')].find(g => {
              const lbl = g.querySelector('.modal-option-label')?.textContent || '';
              return lbl.includes('Add-on');
            });
            const selectedAddons = [...addonGroup?.querySelectorAll('.modal-option-pill.selected') || []].map(p => p.textContent.toLowerCase());
            const isHazelnut = selectedAddons.some(a => a.includes('hazelnut'));
            const basePrice = product.price || 180;
            if (sweetName.includes('Coconut Sugar')) optPrice = 250;
            else if (sweetName.includes('Monk Fruit') || sweetName.includes('Monk Sweetener')) optPrice = 350;
            else optPrice = isHazelnut ? 215 : basePrice;
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
      
      if ((nameLower.includes('cluster') || nameLower.includes('slab') || nameLower.includes('spread') || nameLower.includes('peanut butter') || nameLower.includes('almond butter') || nameLower.includes('custom butter') || nameLower.includes('cookie')) && !nameLower.includes('cocoa butter') && !nameLower.includes('cocoa powder')) {
        let rate = 3;
        let checkHazelnutSpread = nameLower === 'hazelnut spread';
        let checkHazelnutCluster = nameLower === 'hazelnut cluster';
        let checkMedjool = nameLower.includes('medjool');
        let check6RsSpread = nameLower.includes('macadamia') || nameLower.includes('brazil') || nameLower.includes('pecan');
        if (nameLower.includes('custom cluster blend') || nameLower.includes('custom spread blend')) {
          const addon = selOpts['Choose Add-on'] || '';
          if (addon.toLowerCase().includes('hazelnut')) {
            checkHazelnutSpread = true;
          } else if (addon.toLowerCase().includes('medjool')) {
            checkMedjool = true;
          }
        }

        if (check6RsSpread) {
          rate = 6;
        } else if (checkHazelnutCluster) {
          rate = 7;
          if (cleanSelectedSweetener.includes('Coconut Sugar')) rate = 8;
          else if (cleanSelectedSweetener.includes('Monk Fruit') || cleanSelectedSweetener.includes('Monk Sweetener')) rate = 9;
        } else if (checkHazelnutSpread) {
          rate = 3.5;
          if (cleanSelectedSweetener.includes('Monk Fruit') || cleanSelectedSweetener.includes('Monk Sweetener')) rate = 5.5;
        } else if (checkMedjool) {
          rate = 5;
          if (cleanSelectedSweetener.includes('Monk Fruit') || cleanSelectedSweetener.includes('Monk Sweetener')) rate = 6;
        } else {
          if (cleanSelectedSweetener.includes('Coconut Sugar')) rate = 4;
          else if (cleanSelectedSweetener.includes('Monk Fruit') || cleanSelectedSweetener.includes('Monk Sweetener')) rate = 5;
        }

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
        let checkWalnutOrCoffee = nameLower.includes('walnut') || nameLower.includes('coffee');
        let checkNibs = nameLower.includes('nibs');
        if (nameLower.includes('custom drags blend')) {
          const addon = selOpts['Choose Add-on'] || '';
          const addonLower = addon.toLowerCase();
          if (addonLower.includes('nibs')) {
            checkNibs = true;
          }
          if (addonLower.includes('walnut') || addonLower.includes('coffee')) {
            checkWalnutOrCoffee = true;
          }
        }

        if (checkNibs) baseRate = 4.5;
        else if (checkWalnutOrCoffee) baseRate = 4;

        let rate = baseRate;
        if (cleanSelectedSweetener.includes('Coconut Sugar')) rate = baseRate + 1;
        else if (cleanSelectedSweetener.includes('Monk Fruit')) rate = baseRate + 2;

        const qtyOpt = selOpts['Weight'] || selOpts['Choose Weight'] || selOpts['Quantity'] || '';
        let grams = 0;
        const m = qtyOpt.match(/(\d+)g/);
        if (m) grams = parseInt(m[1], 10);
        if (grams > 0) finalPrice = grams * rate;
      } else if (nameLower.includes('custom tablet blend') || nameLower.includes('tablet') || window.location.pathname.toLowerCase().includes('tablets')) {
        const addon = selOpts['Choose Add-on'] || '';
        const isHazelnut = addon.toLowerCase().includes('hazelnut');
        const basePrice = product.price || 180;
        if (cleanSelectedSweetener.includes('Coconut Sugar')) {
          finalPrice = 250;
        } else if (cleanSelectedSweetener.includes('Monk Fruit') || cleanSelectedSweetener.includes('Monk Sweetener')) {
          finalPrice = 350;
        } else {
          finalPrice = isHazelnut ? 215 : basePrice;
        }
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
      const isMaintActive = typeof RC_MAINTENANCE_MODE !== 'undefined' ? RC_MAINTENANCE_MODE : true;
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

      sortedOpts.forEach(optGroup => {
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
          const isAddon = optGroup.label.toLowerCase().includes('add-on');
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
          if (isCocoa && isCustomProduct) {
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

        // Special dynamic pricing for Clusters, Slabs, and Spreads
        const nameLower = product.name?.toLowerCase() || '';
        const sweetener = selectedOptions['Choose Your Sweetener'] || selectedOptions['Choose Sweetener'] || '';
        let customRate = null;
        const rateMatch = sweetener.match(/₹([\d.]+)\/g/);
        if (rateMatch) {
          customRate = parseFloat(rateMatch[1]);
        }

        if ((nameLower.includes('cluster') || nameLower.includes('slab') || nameLower.includes('spread') || nameLower.includes('peanut butter') || nameLower.includes('almond butter') || nameLower.includes('custom butter') || nameLower.includes('cookie')) && !nameLower.includes('cocoa butter') && !nameLower.includes('cocoa powder')) {
          let rate = 3; // default Muscovado
          if (customRate !== null) {
            rate = customRate;
          } else {
            let checkHazelnutSpread = nameLower === 'hazelnut spread';
            let checkHazelnutCluster = nameLower === 'hazelnut cluster';
            let checkMedjool = nameLower.includes('medjool');
            let check6RsSpread = nameLower.includes('macadamia') || nameLower.includes('brazil') || nameLower.includes('pecan');
            if (nameLower.includes('custom cluster blend') || nameLower.includes('custom spread blend')) {
              const addon = selectedOptions['Choose Add-on'] || '';
              if (addon.toLowerCase().includes('hazelnut')) {
                checkHazelnutSpread = true;
              } else if (addon.toLowerCase().includes('medjool')) {
                checkMedjool = true;
              }
            }

            if (check6RsSpread) {
              rate = 6;
            } else if (checkHazelnutCluster) {
              rate = 7;
              if (sweetener.includes('Coconut Sugar')) rate = 8;
              else if (sweetener.includes('Monk Fruit') || sweetener.includes('Monk Sweetener')) rate = 9;
            } else if (checkHazelnutSpread) {
              rate = 3.5;
              if (sweetener.includes('Monk Fruit') || sweetener.includes('Monk Sweetener')) {
                rate = 5.5;
              }
            } else if (checkMedjool) {
              rate = 5;
              if (sweetener.includes('Monk Fruit') || sweetener.includes('Monk Sweetener')) {
                rate = 6;
              }
            } else {
              if (sweetener.includes('Coconut Sugar')) {
                rate = 4;
              } else if (sweetener.includes('Monk Fruit')) {
                rate = 5;
              }
            }
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
          let baseRate = 3; // default Muscovado
          if (customRate !== null) {
            baseRate = customRate;
          } else {
            let checkWalnutOrCoffee = nameLower.includes('walnut') || nameLower.includes('coffee');
            let checkNibs = nameLower.includes('nibs');
            if (nameLower.includes('custom drags blend')) {
              const addon = selectedOptions['Choose Add-on'] || '';
              const addonLower = addon.toLowerCase();
              if (addonLower.includes('walnut') || addonLower.includes('coffee')) {
                checkWalnutOrCoffee = true;
              } else if (addonLower.includes('nibs')) {
                checkNibs = true;
              }
            }

            if (checkNibs) {
              baseRate = 4.5;
            } else if (checkWalnutOrCoffee) {
              baseRate = 4;
            }
          }

          let rate = baseRate; // default Muscovado
          if (customRate === null) {
            if (sweetener.includes('Coconut Sugar')) {
              rate = baseRate + 1;
            } else if (sweetener.includes('Monk Fruit')) {
              rate = baseRate + 2;
            }
          }

          const qtyOpt = selectedOptions['Weight'] || selectedOptions['Choose Weight'] || selectedOptions['Quantity'] || '';
          let grams = 0;
          const weightMatch = qtyOpt.match(/(\d+)g/);
          if (weightMatch) {
            grams = parseInt(weightMatch[1], 10);
          }
          if (grams > 0) {
            itemPrice = grams * rate;
          }
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

        // Special pricing for ALL Tablets (Standard & Custom)
        const isTabletPage = window.location.pathname.toLowerCase().includes('tablets');
        if (nameLower.includes('custom tablet blend') || nameLower.includes('tablet') || isTabletPage) {
          const addon = selectedOptions['Choose Add-on'] || '';
          const sweetener = selectedOptions['Choose Your Sweetener'] || selectedOptions['Choose Sweetener'] || '';
          const cleanSweetener = sweetener.split(' (₹')[0].trim();
          const isHazelnut = addon.toLowerCase().includes('hazelnut');
          const basePrice = product.price || 180;
          if (cleanSweetener.includes('Coconut Sugar')) {
            itemPrice = 250;
          } else if (cleanSweetener.includes('Monk Fruit') || cleanSweetener.includes('Monk Sweetener')) {
            itemPrice = 350;
          } else {
            itemPrice = isHazelnut ? 215 : basePrice;
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
