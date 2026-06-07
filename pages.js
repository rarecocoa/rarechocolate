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
    card.addEventListener('click', () => {
      const productData = JSON.parse(card.getAttribute('data-product'));
      openModal(productData);
    });
  });

  function openModal(product) {
    if (!backdrop || !modal) return;

    // Set product info
    const nameEl = modal.querySelector('.modal-product-name');
    const subtitleEl = modal.querySelector('.modal-product-subtitle');
    const iconEl = modal.querySelector('.modal-product-icon');

    if (nameEl) nameEl.textContent = product.name;
    if (subtitleEl) subtitleEl.textContent = product.subtitle || '';
    if (iconEl) iconEl.textContent = product.icon || '🍫';

    // Build option groups
    const body = modal.querySelector('.modal-body');
    if (body) {
      body.innerHTML = '';

      if (product.options && product.options.length > 0) {
        product.options.forEach(optGroup => {
          const group = document.createElement('div');
          group.className = 'modal-option-group';

          const label = document.createElement('span');
          label.className = 'modal-option-label';
          label.textContent = optGroup.label;
          group.appendChild(label);

          const optionsContainer = document.createElement('div');
          optionsContainer.className = 'modal-options';

          optGroup.values.forEach((val, idx) => {
            const pill = document.createElement('button');
            pill.className = 'modal-option-pill';
            pill.textContent = val;
            
            // Select first option by default
            if (idx === 0) {
              pill.classList.add('selected');
            }

            pill.addEventListener('click', () => {
              // Single select within group
              optionsContainer.querySelectorAll('.modal-option-pill').forEach(p => {
                p.classList.remove('selected');
              });
              pill.classList.add('selected');
            });
            optionsContainer.appendChild(pill);
          });

          group.appendChild(optionsContainer);
          body.appendChild(group);
        });
      }
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

        if (typeof CartSystem !== 'undefined') {
          CartSystem.addItem({
            name: product.name,
            subtitle: product.subtitle || '',
            icon: product.icon || '🍫',
            price: itemPrice,
            options: selectedOptions
          });
        }
        closeModal();
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
        } else {
          content.style.display = 'none';
        }
      });
    });
  });


  // ═══════════════════════════════════════════════════════════
  // MAKE YOUR OWN BUILDER
  // ═══════════════════════════════════════════════════════════

  // Auto-select first option on load for steps 1-4 (mandatory single-select steps)
  document.querySelectorAll('.builder-options[data-select="single"]').forEach(group => {
    const firstOption = group.querySelector('.builder-option');
    if (firstOption) {
      firstOption.classList.add('selected');
    }
  });

  // Preview / Visualizer update function
  const updateBuilderPreview = () => {
    const liquidWaves = document.getElementById('liquidWaves');
    const summaryBase = document.getElementById('summaryBase');
    const summaryPercentage = document.getElementById('summaryPercentage');
    const summarySweetener = document.getElementById('summarySweetener');
    const summarySize = document.getElementById('summarySize');
    const summaryAddons = document.getElementById('summaryAddons');

    if (!liquidWaves) return;

    // 1. Base Cocoa
    const selectedBase = document.querySelector('.builder-options[data-type="base"] .builder-option.selected');
    if (selectedBase && summaryBase) {
      summaryBase.textContent = selectedBase.textContent.trim();
    }

    // 2. Cocoa Percentage & Colors
    const selectedPctOption = document.querySelector('.builder-options[data-type="percentage"] .builder-option.selected');
    if (selectedPctOption) {
      const pct = parseInt(selectedPctOption.getAttribute('data-val')) || 70;
      if (summaryPercentage) {
        summaryPercentage.textContent = pct + '%';
      }

      // Height offset: 100 - pct (translateY offset)
      const translateOffset = 100 - pct;
      liquidWaves.style.transform = `translateY(${translateOffset}%)`;

      // Viscous Color Mapping matching cocoa concentration
      let mainColor = '#4E3121';
      let lightColor = '#5D3C2A';
      let darkColor = '#3B2315';

      if (pct === 50) {
        mainColor = '#6A432D';
        lightColor = '#7B523A';
        darkColor = '#523422';
      } else if (pct === 70) {
        mainColor = '#4E3121';
        lightColor = '#5D3C2A';
        darkColor = '#3B2315';
      } else if (pct === 80) {
        mainColor = '#3A2012';
        lightColor = '#4B2C1A';
        darkColor = '#271206';
      } else if (pct === 90) {
        mainColor = '#251206';
        lightColor = '#331B0D';
        darkColor = '#140500';
      } else if (pct === 100) {
        mainColor = '#120400';
        lightColor = '#210C04';
        darkColor = '#050100';
      }

      liquidWaves.style.setProperty('--cocoa-color', mainColor);
      liquidWaves.style.setProperty('--cocoa-color-light', lightColor);
      liquidWaves.style.setProperty('--cocoa-color-dark', darkColor);
    }

    // 3. Sweetener
    const selectedSweetener = document.querySelector('.builder-options[data-type="sweetener"] .builder-option.selected');
    if (selectedSweetener && summarySweetener) {
      summarySweetener.textContent = selectedSweetener.textContent.trim();
    }

    // 4. Slab Size
    const selectedSize = document.querySelector('.builder-options[data-type="size"] .builder-option.selected');
    if (selectedSize && summarySize) {
      summarySize.textContent = selectedSize.textContent.trim();
    }

    // 5. Add-ons
    const selectedAddons = Array.from(document.querySelectorAll('.builder-options[data-type="addons"] .builder-option.selected'))
      .map(btn => btn.textContent.trim());

    if (summaryAddons) {
      if (selectedAddons.length > 0) {
        summaryAddons.innerHTML = '';
        selectedAddons.forEach(addon => {
          const pill = document.createElement('span');
          pill.className = 'summary-addon-pill';
          pill.textContent = addon;
          summaryAddons.appendChild(pill);
        });
      } else {
        summaryAddons.textContent = 'None';
      }
    }
  };

  // Initial preview render
  updateBuilderPreview();

  // Single-select options event listeners
  document.querySelectorAll('.builder-options[data-select="single"]').forEach(group => {
    group.querySelectorAll('.builder-option').forEach(opt => {
      opt.addEventListener('click', () => {
        group.querySelectorAll('.builder-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        updateBuilderPreview();
      });
    });
  });

  // Multi-select options event listeners
  document.querySelectorAll('.builder-options[data-select="multi"]').forEach(group => {
    group.querySelectorAll('.builder-option').forEach(opt => {
      opt.addEventListener('click', () => {
        opt.classList.toggle('selected');
        updateBuilderPreview();
      });
    });
  });

  // Craft My Chocolate Submission
  const builderSubmit = document.querySelector('.builder-submit');
  if (builderSubmit) {
    builderSubmit.addEventListener('click', () => {
      const steps = document.querySelectorAll('.builder-step');
      const selection = {};

      steps.forEach((step) => {
        const title = step.querySelector('.builder-step-title').textContent.trim();
        
        // Single select step
        const singleSelected = step.querySelector('.builder-options[data-select="single"] .builder-option.selected');
        if (singleSelected) {
          selection[title] = singleSelected.textContent.trim();
        }

        // Multi select step (Add-ons)
        const multiSelected = Array.from(step.querySelectorAll('.builder-options[data-select="multi"] .builder-option.selected'))
          .map(opt => opt.textContent.trim());
        
        if (step.querySelector('.builder-options[data-select="multi"]')) {
          selection[title] = multiSelected.length > 0 ? multiSelected.join(', ') : 'None';
        }
      });

      // Submit custom creation to CartSystem
      if (typeof CartSystem !== 'undefined') {
        CartSystem.addItem({
          name: 'Custom Craft Chocolate',
          subtitle: 'Personally configured luxury chocolate',
          icon: '✨',
          price: 22.00,
          options: {
            'Base': selection['Choose Your Base'] || 'Cocoa Beans',
            'Cocoa %': selection['Chocolate Percentage'] || '70%',
            'Sweetener': selection['Choose Your Sweetener'] || 'Muscovado Sugar',
            'Size': selection['Slab Size'] || '250g',
            'Toppings': selection['Add-ons'] || 'None'
          }
        });
      }
    });
  }

});
