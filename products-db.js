/* ==========================================================
   RARE COCOA - Live Product Database (Google Sheets CSV)
   Fetches on every page load - no stale data, instant updates
   ========================================================== */

(function () {
  'use strict';

  var CACHE_TTL_MS = 30 * 1000;

  function csvUrl(sheetId, tabName) {
    return 'https://docs.google.com/spreadsheets/d/' + sheetId +
      '/gviz/tq?tqx=out:csv&sheet=' + encodeURIComponent(tabName) + '&t=' + Date.now() + '&_cb=' + Math.random().toString(36).substring(7);
  }

  // Purge any legacy product localStorage cache across all browsers
  try {
    for (var k in localStorage) {
      if (k && (k.indexOf('rc_products_') === 0 || k.indexOf('rc_cache_') === 0)) {
        localStorage.removeItem(k);
      }
    }
  } catch(e) {}

  function parseCSV(text) {
    var rows = [], row = [], field = '', inQuote = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i], next = text[i + 1];
      if (inQuote) {
        if (ch === '"' && next === '"') { field += '"'; i++; }
        else if (ch === '"') { inQuote = false; }
        else { field += ch; }
      } else {
        if (ch === '"') { inQuote = true; }
        else if (ch === ',') { row.push(field.trim()); field = ''; }
        else if (ch === '\n') {
          row.push(field.trim()); field = '';
          if (row.some(function(f){ return f !== ''; })) rows.push(row);
          row = [];
        } else if (ch === '\r') { /* skip */ }
        else { field += ch; }
      }
    }
    if (field.trim() || row.length) {
      row.push(field.trim());
      if (row.some(function(f){ return f !== ''; })) rows.push(row);
    }
    return rows;
  }

  function rowsToObjects(rows) {
    if (rows.length < 2) return [];
    var headers = rows[0].map(function(h){ return h.toLowerCase().replace(/\s+/g,'_'); });
    return rows.slice(1).map(function(r){
      var obj = {};
      headers.forEach(function(h, i){ obj[h] = (r[i] || '').trim(); });
      return obj;
    });
  }



  function esc(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function overrideCookieImages(row) {
    if (!row || !row.name) return;
    var nameLower = row.name.toLowerCase().trim();
    if (nameLower === 'cocoa nibs tablet') {
      if (!row.image) row.image = 'assets/nibs_tablet.avif';
    } else if (nameLower === 'custom tablet blend') {
      if (!row.image) row.image = 'assets/customblend_tablet.avif';
    } else if (nameLower === 'almond') {
      if (!row.image2) row.image2 = 'assets/almond_tablet2.avif';
    } else if (nameLower === 'cranberry blueberry') {
      if (!row.image2) row.image2 = 'assets/cranberryblueberry_tablet2.avif';
    } else if (nameLower === 'blueberry almond') {
      if (!row.image2) row.image2 = 'assets/blueberryalmond2_tablet.avif';
    } else if (nameLower === 'cranberry almond') {
      if (!row.image2) row.image2 = 'assets/cranberryalmond_tablet2.avif';
    }
    if (nameLower.indexOf('cookie') !== -1) {
      if (nameLower.indexOf('almond') !== -1) {
        row.image = 'assets/almondcookie.avif';
        row.image2 = '';
      } else if (nameLower.indexOf('oat') !== -1) {
        row.image = 'assets/oatscookie.avif';
        row.image2 = '';
      } else if (nameLower.indexOf('cashew') !== -1) {
        row.image = 'assets/cashewcookie.avif';
        row.image2 = '';
      } else if (nameLower.indexOf('seeds') !== -1 && nameLower.indexOf('nuts') !== -1) {
        row.image = 'assets/seedsandnutscookie.avif';
        row.image2 = '';
      }
    }
  }

  function fixIceCreamProducts(products, tabName) {
    if (tabName !== 'hot_chocolate_ice_cream') return;
    for (var i = 0; i < products.length; i++) {
      var p = products[i];
      var nameLower = (p.name || '').toLowerCase();
      if (nameLower.indexOf('dark chocolate') !== -1 && nameLower.indexOf('hot') === -1) {
        p.name = 'Chocolate';
        p.price_label = 'Launching soon...';
        p.emoji = '🍨';
      } else if (nameLower.indexOf('hazelnut') !== -1) {
        p.name = 'Almond';
        p.description = 'Roasted almond with premium dark cocoa gelato';
        p.price_label = 'Launching soon...';
        p.emoji = '🍨';
      } else if (nameLower.indexOf('coffee') !== -1) {
        p.name = 'Coffee';
        p.price_label = 'Launching soon...';
        p.emoji = '🍨';
      } else if (nameLower.indexOf('berry') !== -1) {
        p.name = 'Mango';
        p.description = 'Sweet Alphonso mango chocolate gelato experience';
        p.price_label = 'Launching soon...';
        p.emoji = '🍨';
      }
    }
  }

  function buildImageHTML(row) {
    overrideCookieImages(row);
    var img1 = row.image || '';
    var img2 = row.image2 || '';
    var altText = esc(row.name || 'Product');

    var version = '?v=23';
    if (img1 && img1.indexOf('?') === -1) img1 += version;
    if (img2 && img2.indexOf('?') === -1) img2 += version;

    if (!img1 && !img2) {
      var emoji = esc(row.emoji || '🍫');
      return '<div class="img-gradient" style="background:linear-gradient(135deg,#3e2723 0%,#5d4037 50%,#1b0000 100%);width:100%;height:100%;display:flex;align-items:center;justify-content:center;"><span style="font-size:3rem;">' + emoji + '</span></div>';
    }

    if (img1 && img2) {
      return '<div class="card-carousel">' +
        '<div class="card-carousel-track">' +
          '<div class="card-carousel-slide"><img src="' + esc(img1) + '" alt="' + altText + '" loading="lazy"></div>' +
          '<div class="card-carousel-slide"><img src="' + esc(img2) + '" alt="' + altText + ' 2" loading="lazy"></div>' +
        '</div>' +
        '<button class="card-carousel-btn prev" aria-label="Previous">&#8249;</button>' +
        '<button class="card-carousel-btn next" aria-label="Next">&#8250;</button>' +
        '<div class="card-carousel-dots"><span class="card-carousel-dot"></span><span class="card-carousel-dot"></span></div>' +
      '</div>';
    }

    return '<img src="' + esc(img1) + '" alt="' + altText + '" class="img-gradient" style="width:100%;height:100%;object-fit:cover;" loading="lazy">';
  }

  function buildDataProduct(row) {
    overrideCookieImages(row);
    var icons = [];
    var img1 = row.image || '';
    var img2 = row.image2 || '';
    var version = '?v=23';
    if (img1 && img1.indexOf('?') === -1) img1 += version;
    if (img2 && img2.indexOf('?') === -1) img2 += version;

    if (img1 && img1.trim()) icons.push(img1.trim());
    if (img2 && img2.trim()) icons.push(img2.trim());

    var obj = {
      name: row.name || '',
      subtitle: row.description || '',
      icon: icons.length === 1 ? icons[0] : (icons.length > 1 ? icons : (row.emoji || '🍫')),
      options: []
    };

    if (row.price && row.price.trim()) {
      var p = parseFloat(row.price.trim());
      if (!isNaN(p)) obj.price = p;
    } else if (row.price_label && row.price_label.trim()) {
      var cleanLabel = row.price_label.replace(/,/g, '');
      var m = cleanLabel.match(/₹\s*([\d.]+)/);
      if (m) {
        var p = parseFloat(m[1]);
        if (!isNaN(p)) obj.price = p;
      }
    }

    if (row.options_json && row.options_json.trim()) {
      try {
        obj.options = JSON.parse(row.options_json.trim());
        return JSON.stringify(obj).replace(/'/g, '&#39;');
      } catch (e) {
        console.error('Failed to parse options_json for', row.name, e);
      }
    }

    for (var i = 1; i <= 4; i++) {
      var lbl = row['option' + i + '_label'] || '';
      var vals = row['option' + i + '_values'] || '';
      if (lbl && vals) {
        var parsedVals = vals.split(',').map(function(v){ return v.trim(); }).filter(Boolean);
        var lblLower = lbl.toLowerCase();
        var rName = (row.name || '').toLowerCase();

        if (lblLower.indexOf('sweetener') !== -1) {
          parsedVals = parsedVals.map(function(v){ return v.replace(/\s*\(\+?₹\d+(?:\/g)?\)/g, '').trim(); });
        }

        // Fix accidental sweetener copies in Google Sheet columns
        if (vals.indexOf('Sugar') !== -1 || vals.indexOf('Muscovado') !== -1) {
          if (lblLower.indexOf('add-on') !== -1) {
            if (rName.indexOf('cluster') !== -1) {
              parsedVals = ['Almond', 'Apricot', 'Blueberry', 'Cashew', 'Cranberry', 'Coffee', 'Hazelnut', 'Mango', 'Medjool Dates', 'Orange', 'Raisins', 'Rice Crisper', 'Roasted Peanuts', 'Seeds & Nuts'];
            } else if (rName.indexOf('drags') !== -1) {
              parsedVals = ['Almond', 'Cashew', 'Orange Peel', 'Roasted Peanuts', 'Walnut', 'Coffee Beans', 'Cocoa Nibs'];
            }
          } else if (lblLower.indexOf('quantity') !== -1 || lblLower.indexOf('weight') !== -1) {
            if (rName.indexOf('drags') !== -1) {
              parsedVals = ['100g', '200g', '250g'];
            } else if (rName.indexOf('cookie') !== -1) {
              parsedVals = ['100g (₹300)', '250g (₹750)', '300g (₹900)'];
            }
          }
        }

        obj.options.push({
          label: lbl,
          values: parsedVals
        });
      }
    }

    var rName = (row.name || '').toLowerCase().trim();

    // Ensure Cavities has Plain, Almond, Cashew, Berry and Nuts add-ons
    if (rName.indexOf('cavities') !== -1) {
      var hasAddon = obj.options.some(function(opt) { return opt.label && opt.label.toLowerCase().indexOf('add-on') !== -1; });
      if (!hasAddon) {
        obj.options.push({
          label: 'Choose Add-on',
          values: ['Plain', 'Almond', 'Cashew', 'Berry and Nuts']
        });
      } else {
        obj.options.forEach(function(opt) {
          if (opt.label && opt.label.toLowerCase().indexOf('add-on') !== -1) {
            opt.values = ['Plain', 'Almond', 'Cashew', 'Berry and Nuts'];
          }
        });
      }
    }

    // Temporary fix: Google CSV cache is stale for Custom Cluster Blend add-on list.
    // Remove this block once Google's CSV propagates the sheet update.
    if (rName === 'custom cluster blend') {
      obj.options.forEach(function(opt) {
        if (opt.label && opt.label.toLowerCase().indexOf('add-on') !== -1) {
          opt.values = ['Almond','Apricot','Blueberry','Cashew','Cranberry','Coffee','Hazelnut','Mango','Medjool Dates','Orange','Raisins','Rice Crisper','Roasted Peanuts','Seeds & Nuts'];
        }
      });
    }

    return JSON.stringify(obj).replace(/'/g, '&#39;');
  }

  function buildCardHTML(row) {
    var name = esc(row.name || 'Product');
    var desc = esc(row.description || '');
    var price = esc(row.price_label || '');

    var isLaunching = price.toLowerCase().indexOf('launching') === 0;

    if (isLaunching) {
      return '<div class="product-grid-card reveal" style="cursor: default;">' +
        '<div class="product-grid-img">' + buildImageHTML(row) + '</div>' +
        '<div class="product-grid-body">' +
          '<h3 class="product-grid-name">' + name + '</h3>' +
          '<p class="product-grid-desc">' + desc + '</p>' +
          '<div class="product-grid-price-row">' +
            '<span class="product-grid-price" style="color:var(--accent);">' + price + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
    }

    var hasOptions = false;
    if (row.options_json && row.options_json.trim()) {
      try {
        var opts = JSON.parse(row.options_json.trim());
        hasOptions = opts && opts.length > 0;
      } catch(e) {}
    } else {
      hasOptions = ['option1_label','option2_label','option3_label','option4_label']
        .some(function(k){ return row[k] && row[k].trim(); });
    }
    var ctaLabel = hasOptions ? 'Choose Options' : 'Add to Bag';

    return '<div class="product-grid-card reveal" data-product=\'' + buildDataProduct(row) + '\'>' +
      '<div class="product-grid-img">' + buildImageHTML(row) + '</div>' +
      '<div class="product-grid-body">' +
        '<h3 class="product-grid-name">' + name + '</h3>' +
        '<p class="product-grid-desc">' + desc + '</p>' +
        '<div class="product-grid-price-row">' +
          '<span class="product-grid-price">' + price + '</span>' +
          '<span class="product-grid-cta">' + ctaLabel + ' <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>' +
        '</div>' +
      '</div>' +
    '</div>';
  }


  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function renderProducts(products, container, tabsBanner) {
    var subcats = [], groups = {};
    products.forEach(function(p){
      var sc = (p.subcategory || 'Other').trim();
      if (!groups[sc]) { groups[sc] = []; subcats.push(sc); }
      groups[sc].push(p);
    });

    var savedTabKey = 'activeTab_' + window.location.pathname;
    var savedTab = sessionStorage.getItem(savedTabKey);
    if (savedTab) {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
      sessionStorage.removeItem(savedTabKey);
    }

    var tabsHTML = '';
    subcats.forEach(function(sc, idx){
      var slug = slugify(sc);
      var isActive = savedTab ? (slug === savedTab) : (idx === 0);
      tabsHTML += '<button class="sub-tab' + (isActive ? ' active' : '') + '" data-tab="' + slug + '">' + esc(sc) + '</button>';
    });

    var contentHTML = '';
    subcats.forEach(function(sc, idx){
      var slug = slugify(sc);
      var isActive = savedTab ? (slug === savedTab) : (idx === 0);
      var display = isActive ? '' : ' style="display:none;"';
      contentHTML += '<div class="tab-content" data-tab-content="' + slug + '"' + display + '>';
      contentHTML += '<div class="products-grid">';
      groups[sc].forEach(function(p){ contentHTML += buildCardHTML(p); });
      contentHTML += '</div></div>';
    });

    var cueHTML = subcats.length > 1 ? '<div class="sub-tabs-scroll-cue-wrap" style="text-align:center;width:100%;"><div class="sub-tabs-scroll-cue"><span class="glow-sparkle">✨</span> <span>Swipe / Tap Categories &rarr;</span> <span class="glow-sparkle">✨</span></div></div>' : '';
    container.innerHTML = '<div class="sub-tabs">' + tabsHTML + '</div>' + cueHTML + (tabsBanner || '') + contentHTML;

    reinitSubTabs(container);
    initSubTabsAutoScroll(container);
    reinitCarousels(container);
    reinitReveal(container);
  }

  function initSubTabsAutoScroll(container) {
    if (typeof window === 'undefined') return;
    var subTabs = container ? container.querySelector('.sub-tabs') : document.querySelector('.sub-tabs');
    if (!subTabs) return;

    if (subTabs._rcAutoScrollRAF) {
      cancelAnimationFrame(subTabs._rcAutoScrollRAF);
      subTabs._rcAutoScrollRAF = null;
    }
    if (subTabs._rcResumeTimer) {
      clearTimeout(subTabs._rcResumeTimer);
      subTabs._rcResumeTimer = null;
    }

    if (window.innerWidth > 768) return;

    setTimeout(function() {
      if (!subTabs) return;

      var originalButtons = Array.prototype.slice.call(subTabs.querySelectorAll('.sub-tab:not(.cloned-tab)'));
      if (originalButtons.length < 2) return;

      var origWidth = 0;
      originalButtons.forEach(function(btn) {
        origWidth += btn.offsetWidth + 8;
      });

      if (origWidth <= subTabs.clientWidth + 10) return;

      // Duplicate buttons for seamless continuous marquee loop
      if (!subTabs.querySelector('.cloned-tab')) {
        originalButtons.forEach(function(btn) {
          var clone = btn.cloneNode(true);
          clone.classList.add('cloned-tab');
          subTabs.appendChild(clone);
        });
      }

      var isPaused = false;
      var speed = 0.65; // smooth right-to-left scrolling speed

      function step() {
        if (!isPaused && window.innerWidth <= 768 && subTabs) {
          subTabs.scrollLeft += speed;
          if (subTabs.scrollLeft >= origWidth) {
            subTabs.scrollLeft -= origWidth;
          }
        }
        subTabs._rcAutoScrollRAF = requestAnimationFrame(step);
      }

      subTabs._rcAutoScrollRAF = requestAnimationFrame(step);

      function pause() {
        isPaused = true;
        if (subTabs._rcResumeTimer) {
          clearTimeout(subTabs._rcResumeTimer);
          subTabs._rcResumeTimer = null;
        }
      }

      function resume() {
        if (subTabs._rcResumeTimer) clearTimeout(subTabs._rcResumeTimer);
        subTabs._rcResumeTimer = setTimeout(function() {
          isPaused = false;
        }, 1800);
      }

      if (!subTabs._rcListenersBound) {
        subTabs._rcListenersBound = true;
        subTabs.addEventListener('touchstart', pause, { passive: true });
        subTabs.addEventListener('touchmove', pause, { passive: true });
        subTabs.addEventListener('touchend', resume, { passive: true });
        subTabs.addEventListener('touchcancel', resume, { passive: true });
        subTabs.addEventListener('mousedown', pause);
        subTabs.addEventListener('mouseup', resume);
        subTabs.addEventListener('mouseleave', resume);

        var savedTabKey = 'activeTab_' + window.location.pathname;
        subTabs.addEventListener('click', function(e) {
          var tab = e.target.closest('.sub-tab');
          if (!tab) return;
          var target = tab.getAttribute('data-tab');
          if (target) {
            sessionStorage.setItem(savedTabKey, target);
            window.location.reload();
          }
        });
      }
    }, 350);
  }

  if (typeof window !== 'undefined' && !window._rcAutoScrollResizeBound) {
    window._rcAutoScrollResizeBound = true;
    window.addEventListener('resize', function() {
      initSubTabsAutoScroll(document.getElementById('rc-products-container') || document);
    }, { passive: true });
  }

  function reinitSubTabs(container) {
    var savedTabKey = 'activeTab_' + window.location.pathname;
    var tabs = container.querySelectorAll('.sub-tab');
    tabs.forEach(function(tab){
      tab.addEventListener('click', function(){
        var target = tab.getAttribute('data-tab');
        sessionStorage.setItem(savedTabKey, target);
        window.location.reload();
      });
    });
  }


  function reinitCarousels(container) {
    if (typeof window.initCardCarousels === 'function') {
      window.initCardCarousels();
    }
  }

  function reinitReveal(container) {
    if (!('IntersectionObserver' in window)) {
      container.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('is-visible'); });
      return;
    }
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.08 });
    container.querySelectorAll('.reveal').forEach(function(el){ obs.observe(el); });
  }


  function showLoading(container) {
    container.innerHTML =
      '<div style="text-align:center;padding:60px 20px;color:var(--text-muted,#888);font-family:var(--font-body,sans-serif);">' +
        '<div style="width:32px;height:32px;border:2px solid rgba(212,175,55,0.2);border-top-color:#d4af37;border-radius:50%;animation:rc-spin 0.7s linear infinite;margin:0 auto 16px;"></div>' +
        '<p style="font-size:0.9rem;letter-spacing:0.05em;">Loading products&hellip;</p>' +
      '</div>';
    if (!document.getElementById('rc-spin-style')) {
      var s = document.createElement('style');
      s.id = 'rc-spin-style';
      s.textContent = '@keyframes rc-spin{to{transform:rotate(360deg)}}';
      document.head.appendChild(s);
    }
  }

  function getProductCategories(p) {
    var rawCat = (p.category || '').trim();
    var subcat = (p.subcategory || '').toLowerCase();
    var name = (p.name || '').toLowerCase();

    if (subcat.indexOf('flavor') !== -1 || subcat.indexOf('tablet') !== -1 || subcat.indexOf('limited') !== -1 || subcat.indexOf('trail') !== -1 || name.indexOf('tablet') !== -1) {
      return ['tablets'];
    }
    if (subcat.indexOf('spread') !== -1 || subcat.indexOf('butter') !== -1 || name.indexOf('spread') !== -1 || name.indexOf('butter') !== -1) {
      return ['spreads'];
    }
    if (subcat.indexOf('hot chocolate') !== -1 || subcat.indexOf('ice cream') !== -1 || name.indexOf('hot chocolate') !== -1 || name.indexOf('ice cream') !== -1) {
      return ['hot-chocolate-ice-cream'];
    }
    if (subcat.indexOf('cluster') !== -1 || subcat.indexOf('drag') !== -1 || subcat.indexOf('cookie') !== -1 || subcat.indexOf('laddoo') !== -1 || subcat.indexOf('cavities') !== -1 || subcat.indexOf('popsicle') !== -1 || subcat.indexOf('tea') !== -1 || subcat.indexOf('cocoa powder') !== -1 || name.indexOf('cluster') !== -1 || name.indexOf('drag') !== -1 || name.indexOf('cookie') !== -1 || name.indexOf('laddoo') !== -1 || name.indexOf('cavities') !== -1 || name.indexOf('popsicle') !== -1 || name.indexOf('cocoa tea') !== -1 || name.indexOf('cocoa powder') !== -1) {
      return ['snacks', 'slabs'];
    }
    if (rawCat) {
      return rawCat.split(',').map(function(c){ return c.trim().toLowerCase(); });
    }
    return ['tablets'];
  }

  function showError(container, msg) {
    container.innerHTML =
      '<div style="text-align:center;padding:60px 20px;color:var(--text-muted,#888);font-family:var(--font-body,sans-serif);">' +
        '<p style="font-size:0.9rem;">' + esc(msg) + '</p>' +
      '</div>';
  }

  window.RCProductsDB = {
    load: function(sheetId, tabName, containerId, pageCategory, tabsBannerHTML) {
      if (typeof pageCategory === 'string' && pageCategory.indexOf('<') !== -1) {
        tabsBannerHTML = pageCategory;
        pageCategory = undefined;
      }
      var container = document.getElementById(containerId);
      if (!container) return;
      showLoading(container);

      function fetchTab(targetTab) {
        return fetch(csvUrl(sheetId, targetTab))
          .then(function(res){
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.text();
          })
          .then(function(text){
            var rows = parseCSV(text);
            var all = rowsToObjects(rows);
            var products = all.filter(function(p){
              var isActive = (p.active || '').toUpperCase() === 'TRUE' && p.name;
              if (!isActive) return false;
              if (pageCategory) {
                var pCats = getProductCategories(p);
                var target = pageCategory.toLowerCase();
                if (target === 'hot-chocolate-ice-cream' || target === 'hot_chocolate_ice_cream') {
                  return pCats.indexOf('hot-chocolate-ice-cream') !== -1 || pCats.indexOf('hot_chocolate_ice_cream') !== -1;
                }
                return pCats.indexOf(target) !== -1;
              }
              return true;
            });
            fixIceCreamProducts(products, targetTab);
            if (!products.length) throw new Error('No active products found in ' + targetTab);
            return products;
          });
      }

      fetchTab(tabName)
        .catch(function(err){
          var altTab = tabName === tabName.toLowerCase() ? (tabName.charAt(0).toUpperCase() + tabName.slice(1)) : tabName.toLowerCase();
          if (altTab !== tabName) {
            console.warn('[RCProductsDB] Tab "' + tabName + '" failed, trying "' + altTab + '"...');
            return fetchTab(altTab);
          }
          throw err;
        })
        .catch(function(err){
          if (tabName !== 'products') {
            console.warn('[RCProductsDB] Trying master "products" tab fallback...');
            return fetchTab('products');
          }
          throw err;
        })
        .then(function(products){
          renderProducts(products, container, tabsBannerHTML || '');
        })
        .catch(function(err){
          console.error('[RCProductsDB] Live load failed:', err);
          showError(container, 'Could not load products. Please refresh the page.');
        });
    }
  };

})();
