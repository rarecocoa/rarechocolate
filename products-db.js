/* ==========================================================
   RARE COCOA - Live Product Database (Google Sheets CSV)
   Fetches on every page load - no stale data, instant updates
   ========================================================== */

(function () {
  'use strict';

  var CACHE_TTL_MS = 30 * 1000;

  function csvUrl(sheetId, tabName) {
    return 'https://docs.google.com/spreadsheets/d/' + sheetId +
      '/gviz/tq?tqx=out:csv&sheet=' + encodeURIComponent(tabName) + '&t=' + Date.now();
  }

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

  function cacheKey(sheetId, tabName) { return 'rc_products_v6_' + sheetId + '_' + tabName; }

  function saveCache(key, data) {
    try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data: data })); } catch(e) {}
  }

  function loadCache(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (Date.now() - parsed.ts < CACHE_TTL_MS) return parsed.data;
    } catch(e) {}
    return null;
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

  function injectCashewCookie(products, pageCategory) {
    if (pageCategory === 'snacks') {
      var hasCashewCookie = false;
      for (var i = 0; i < products.length; i++) {
        var p = products[i];
        if (p.name && p.name.toLowerCase().indexOf('cashew') !== -1 && p.name.toLowerCase().indexOf('cookie') !== -1) {
          hasCashewCookie = true;
          break;
        }
      }
      if (!hasCashewCookie) {
        products.push({
          active: "TRUE",
          name: "Cashew Cookie",
          description: "Crisp artisanal cookies loaded with roasted cashews and rich cocoa",
          subcategory: "Cookies",
          price_label: "From ₹300",
          image: "assets/cashewcookie.avif",
          image2: "",
          emoji: "🍪",
          option1_label: "Choose Your Sweetener",
          option1_values: "Muscovado Sugar",
          option2_label: "Quantity",
          option2_values: "100g (₹300),250g (₹750),300g (₹900)",
          category: "snacks, hot-chocolate-ice-cream, slabs"
        });
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
            } else {
              continue;
            }
          }
        }

        // Fix weight/quantity options for Macadamia and Brazil Nut Spreads (should have 100g, 250g, 300g options)
        if (lblLower.indexOf('quantity') !== -1 || lblLower.indexOf('weight') !== -1) {
          if (rName.indexOf('macadamia') !== -1 && rName.indexOf('spread') !== -1) {
            parsedVals = ['100g (₹600)', '250g (₹1500)', '300g (₹1800)'];
          } else if (rName.indexOf('brazil') !== -1 && rName.indexOf('spread') !== -1) {
            parsedVals = ['100g (₹600)', '250g (₹1500)', '300g (₹1800)'];
          }
        }

        obj.options.push({
          label: lbl,
          values: parsedVals
        });
      }
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

    container.innerHTML = '<div class="sub-tabs">' + tabsHTML + '</div>' + (tabsBanner || '') + contentHTML;

    reinitSubTabs(container);
    reinitCarousels(container);
    reinitReveal(container);
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
    container.querySelectorAll('.card-carousel').forEach(function(carousel){
      var track = carousel.querySelector('.card-carousel-track');
      var slides = carousel.querySelectorAll('.card-carousel-slide');
      var dots = carousel.querySelectorAll('.card-carousel-dot');
      var prevBtn = carousel.querySelector('.card-carousel-btn.prev');
      var nextBtn = carousel.querySelector('.card-carousel-btn.next');
      if (!track || slides.length < 2) return;
      var current = 0;

      function goTo(idx) {
        current = (idx + slides.length) % slides.length;
        track.style.transform = 'translateX(-' + (current * 100) + '%)';
        dots.forEach(function(d, i){ d.classList.toggle('active', i === current); });
      }
      if (dots.length) dots[0].classList.add('active');

      var timer = setInterval(function() {
        goTo(current + 1);
      }, 3500);

      function resetTimer() {
        if (timer) clearInterval(timer);
        timer = setInterval(function() { goTo(current + 1); }, 3500);
      }

      carousel.addEventListener('mouseenter', function() { if (timer) clearInterval(timer); });
      carousel.addEventListener('mouseleave', function() { resetTimer(); });

      if (prevBtn) prevBtn.addEventListener('click', function(e){ e.stopPropagation(); goTo(current - 1); resetTimer(); });
      if (nextBtn) nextBtn.addEventListener('click', function(e){ e.stopPropagation(); goTo(current + 1); resetTimer(); });
      dots.forEach(function(dot, i) {
        dot.addEventListener('click', function(e){ e.stopPropagation(); goTo(i); resetTimer(); });
      });
    });
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
      var key = cacheKey(sheetId, tabName + (pageCategory ? '_' + pageCategory : ''));
      showLoading(container);
      fetch(csvUrl(sheetId, tabName), { cache: 'no-store' })
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
            if (pageCategory && p.category) {
              var cats = p.category.split(',').map(function(c){ return c.trim().toLowerCase(); });
              return cats.indexOf(pageCategory.toLowerCase()) !== -1;
            }
            return true;
          });
          injectCashewCookie(products, pageCategory);
          fixIceCreamProducts(products, tabName);
          if (!products.length) throw new Error('No active products found.');
          saveCache(key, products);
          renderProducts(products, container, tabsBannerHTML || '');
        })
        .catch(function(err){
          console.warn('[RCProductsDB] Fetch failed:', err.message, '- trying cache...');
          var cached = loadCache(key);
          if (cached && cached.length) {
            injectCashewCookie(cached, pageCategory);
            fixIceCreamProducts(cached, tabName);
            renderProducts(cached, container, tabsBannerHTML || '');
          } else {
            showError(container, 'Could not load products. Please refresh the page.');
          }
        });
    }
  };

})();
