const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION
const FILES_TO_CACHE = [
    "./index.html",
    "./js/index.js",
    "./js/idb.js",
    "./css/styles.css",
    "./icons/icon-72x72.png",
    "./icons/icon-96x96.png",
    "./icons/icon-128x128.png",
    "./icons/icon-144x144.png",
    "./icons/icon-152x152.png",
    "./icons/icon-192x192.png",
    "./icons/icon-384x384.png",
    "./icons/icon-512x512.png",
];

// Install service worker (adding files to the cache)
self.addEventListener("install", function (evt) {
    // open the cache and add above items to it
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Your file were pre-cached successfully!');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

// Activate the service worker (remove old data from the cache)
self.addEventListener('activate', function (evt) {
    evt.waitUntil(
        caches.keys().then(function (keyList) {

            let cacheKeeplist = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            })
            // add current cache name to keeplist
            cacheKeeplist.push(CACHE_NAME);

            return Promise.all(
                keyList.map(function (key, i) {
                    if (cacheKeeplist.indexOf(key) === -1) {
                        console.log('deleting cache : ' + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                }));
        })
    );
});

// Respond with cached resources
self.addEventListener('fetch', function (evt) {
    console.log('fetch request : ' + evt.request.url)
    evt.respondWith(
        caches.match(evt.request).then(function (request) {
            if (request) { // if cache is available, respond with cache
                console.log('responding with cache : ' + evt.request.url)
                return request
            } else {       // if there are no cache, try fetching request
                console.log('file is not cached, fetching : ' + evt.request.url)
                return fetch(evt.request)
            }
        })
    )
});