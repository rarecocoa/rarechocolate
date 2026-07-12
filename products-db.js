/* ==========================================================
   RARE COCOA - Live Product Database (Google Sheets CSV)
   Fetches on every page load - no stale data, instant updates
   ========================================================== */

(function () {
  'use strict';

  var CACHE_TTL_MS = 30 * 1000;

  function csvUrl(sheetId, tabName) {
    return 'https://docs.google.com/spreadsheets/d/' + sheetId +
      '/gviz/tq?tqx=out:csv&sheet=' + encodeURIComponent(tabName);
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

  function cacheKey(sheetId, tabName) { return 'rc_products_' + sheetId + '_' + tabName; }

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

  function buildImageHTML(row) {
    var img1 = row.image || '';
    var img2 = row.image2 || '';
    var altText = esc(row.name || 'Product');

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
    var icons = [];
    if (row.image && row.image.trim()) icons.push(row.image.trim());
    if (row.image2 && row.image2.trim()) icons.push(row.image2.trim());

    var obj = {
      name: row.name || '',
      subtitle: row.description || '',
      icon: icons.length === 1 ? icons[0] : (icons.length > 1 ? icons : (row.emoji || '🍫')),
      options: []
    };

    for (var i = 1; i <= 4; i++) {
      var lbl = row['option' + i + '_label'] || '';
      var vals = row['option' + i + '_values'] || '';
      if (lbl && vals) {
        obj.options.push({
          label: lbl,
          values: vals.split(',').map(function(v){ return v.trim(); }).filter(Boolean)
        });
      }
    }

    return JSON.stringify(obj).replace(/'/g, '&#39;');
  }

  function buildCardHTML(row) {
    var name = esc(row.name || 'Product');
    var desc = esc(row.description || '');
    var price = esc(row.price_label || '');
    var hasOptions = ['option1_label','option2_label','option3_label','option4_label']
      .some(function(k){ return row[k] && row[k].trim(); });
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

    var tabsHTML = '';
    subcats.forEach(function(sc, idx){
      var slug = slugify(sc);
      tabsHTML += '<button class="sub-tab' + (idx === 0 ? ' active' : '') + '" data-tab="' + slug + '">' + esc(sc) + '</button>';
    });

    var contentHTML = '';
    subcats.forEach(function(sc, idx){
      var slug = slugify(sc);
      var display = idx === 0 ? '' : ' style="display:none;"';
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
    var tabs = container.querySelectorAll('.sub-tab');
    var contents = container.querySelectorAll('.tab-content');
    tabs.forEach(function(tab){
      tab.addEventListener('click', function(){
        var target = tab.getAttribute('data-tab');
        tabs.forEach(function(t){ t.classList.remove('active'); });
        tab.classList.add('active');
        contents.forEach(function(c){
          c.style.display = c.getAttribute('data-tab-content') === target ? '' : 'none';
        });
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
      if (prevBtn) prevBtn.addEventListener('click', function(e){ e.stopPropagation(); goTo(current - 1); });
      if (nextBtn) nextBtn.addEventListener('click', function(e){ e.stopPropagation(); goTo(current + 1); });
    });
  }

  function reinitReveal(container) {
    if (!('IntersectionObserver' in window)) {
      container.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('visible'); });
      return;
    }
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
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
    load: function(sheetId, tabName, containerId, tabsBannerHTML) {
      var container = document.getElementById(containerId);
      if (!container) return;
      var key = cacheKey(sheetId, tabName);
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
            return (p.active || '').toUpperCase() === 'TRUE' && p.name;
          });
          if (!products.length) throw new Error('No active products found.');
          saveCache(key, products);
          renderProducts(products, container, tabsBannerHTML || '');
        })
        .catch(function(err){
          console.warn('[RCProductsDB] Fetch failed:', err.message, '- trying cache...');
          var cached = loadCache(key);
          if (cached && cached.length) {
            renderProducts(cached, container, tabsBannerHTML || '');
          } else {
            showError(container, 'Could not load products. Please refresh the page.');
          }
        });
    }
  };

})();
