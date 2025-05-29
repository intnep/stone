const CACHE_NAME = '888-calculator-cache-v1'; // 每次更新資源時，可以改變版本號
const urlsToCache = [
  './', // 快取根目錄，通常是 index.html
  './index.html', // 明確指定HTML檔案
  // 如果您將CSS和JS分離到外部檔案，也需要加入它們的路徑
  // './style.css',
  // './script.js',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
  // 如果有其他重要靜態資源，也加入這裡
];

// 安裝 Service Worker 時，快取核心資源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 攔截網路請求
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果快取中有對應的回應，則直接返回快取內容
        if (response) {
          return response;
        }
        // 否則，正常發起網路請求
        return fetch(event.request).then(
          function(response) {
            // 檢查是否拿到有效的回應
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 如果請求成功，將回應複製一份存入快取
            var responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
            return response;
          }
        );
      })
  );
});

// 更新 Service Worker 時，清除舊快取
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME]; // 只保留目前版本的快取
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
