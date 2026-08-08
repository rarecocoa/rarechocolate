const CACHE_NAME = 'rare-cocoa-assets-v14';
const ASSETS_TO_CACHE = [
  'assets/almond_tablet.avif?v=2',
  'assets/almond-raisin_tablet.avif?v=2',
  'assets/almond-cashew_tablet.avif?v=2',
  'assets/almond-apricot_tablet.avif?v=2',
  'assets/almond-cranberry_tablet.avif?v=2',
  'assets/cranberry-blueberry_tablet.avif?v=2',
  'assets/hazelnut-cranberry_tablet.avif?v=2',
  'assets/fig-orange_tablet.avif?v=2',
  'assets/pinepecan-cranberry_tablet.avif?v=2',
  'assets/almond-blueberry_tablet.avif?v=2',
  'assets/creamy-coffee_tablet.avif?v=2',
  'assets/mango_tablet.avif?v=2',
  'assets/orange-almond_tablet.avif?v=2',
  'assets/rice-crunch_tablet.avif?v=2',
  'assets/roasted-peanut_tablet.avif?v=2',
  'assets/seeds-nuts_tablet.avif?v=2',
  'assets/signature_tablet.avif?v=2',
  'assets/pineapple-strawberry_tablet.avif?v=2',
  'assets/macadamia-brazilnuts_tablet.avif?v=2',
  'assets/pecan-brazilbuts_tablet.avif?v=2',
  'assets/almond_drags.avif?v=2',
  'assets/orange_drags.avif?v=2',
  'assets/roastedpeanut_drags.avif?v=2',
  'assets/walnut_drags.avif?v=2',
  'assets/coffee_drags.avif?v=2',
  'assets/cocoanibs_drags.avif?v=2',
  'assets/custom_dragsblend.avif?v=2',
  'assets/cashew_drags.avif?v=2',
  'assets/cocoabutter.avif?v=2',
  'assets/cocoabutter2.avif?v=2',
  'assets/cocoabutter_sample.avif?v=2',
  'assets/cashewalmond_cluster.avif?v=2',
  'assets/tablets_trailpack.avif?v=2',
  'assets/orange_cluster.avif?v=2',
  'assets/coconut_laddoo.avif?v=2',
  'assets/allseedsandnuts_cluster.avif?v=2',
  'assets/ricecrisperandalmond_cluster.avif?v=2',
  'assets/coconut_almond_cluster.avif?v=2',
  'assets/orange_almond_cluster.avif?v=2',
  'assets/orangealmond_cluster.avif?v=2',
  'assets/cashew_cluster.avif?v=2',
  'assets/cashew_cluster2.avif?v=2',
  'assets/almond_cluster.avif?v=2',
  'assets/almond_cluster2.avif?v=2',
  'assets/cranberry_blueberryalmond_cluster.avif?v=2',
  'assets/cranberry_blueberryalmond_cluster2.avif?v=2',
  'assets/hazelnutspread.avif?v=2',
  'assets/cashewspread.avif?v=2',
  'assets/almondspread.avif?v=2',
  'assets/customblend_cluster.avif?v=2',
  'assets/log_tablet.avif?v=2',
  'assets/cavities.avif?v=2',
  'assets/popsicle1.avif?v=2',
  'assets/popsicle2.avif?v=2',
  'assets/farmer.avif?v=2',
  'assets/founder_praveen.avif?v=2',
  'assets/hazelnut_cluster.avif?v=2',
  'assets/medjoldates_cluster.avif?v=2',
  'assets/cocoa_tea.avif?v=2'];

// Install Service Worker and pre-cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Pre-caching tablet assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Service Worker and delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch events: Cache-First strategy for images and assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Intercept requests for assets or images
  if (url.pathname.includes('/assets/') || url.pathname.match(/\.(png|jpe?g|webp|avif|mp4)/i)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          // Serve from cache
          return cachedResponse;
        }
        
        // Fetch from network and cache dynamically
        return fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, cacheCopy);
            });
          }
          return networkResponse;
        });
      })
    );
  }
});
