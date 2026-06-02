/* ==========================================================
   RARE COCOA™ — Collection Pages Interactive Scripts
   Product Modal · Filter Options · Sub-tabs · Builder
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ── Remove skeleton loading state ────────────────────────
  document.body.classList.remove('page-loading');

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

  // Single-select builder options logic
  document.querySelectorAll('.builder-options[data-select="single"]').forEach(group => {
    group.querySelectorAll('.builder-option').forEach(opt => {
      opt.addEventListener('click', () => {
        group.querySelectorAll('.builder-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
      });
    });
  });

  // Multi-select builder options (add-ons) logic
  document.querySelectorAll('.builder-options[data-select="multi"]').forEach(group => {
    group.querySelectorAll('.builder-option').forEach(opt => {
      opt.addEventListener('click', () => {
        opt.classList.toggle('selected');
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
