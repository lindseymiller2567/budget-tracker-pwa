const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION
const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/js/index.js",
    "/js/idb.js",
    "/css/styles.css",
    "/icons/icon-72x72.png",
    "/icons/icon-96x96.png",
    "/icons/icon-128x128.png",
    "/icons/icon-144x144.png",
    "/icons/icon-152x152.png",
    "/icons/icon-192x192.png",
    "/icons/icon-384x384.png",
    "/icons/icon-512x512.png",
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

self.addEventListener("fetch", function (evt) {
    // listens for fetch req on a particular route, then respond with what you tell it to
    // instead of responding with what your JS file says.
    if (evt.request.url.includes('/api/')) {
        evt.respondWith(
            caches
                .open(CACHE_NAME)
                .then(cache => {
                    return fetch(evt.request)
                        .then(response => {
                            if (response.status === 200) {
                                cache.put(evt.request.url, response.clone());
                            }

                            return response;
                        })
                        .catch(err => {
                            console.log(err)
                            return cache.match(evt.request);
                        });
                })
                .catch(err => console.log(err))
        );

        return;
    }

    evt.respondWith(
        fetch(evt.request).catch(function () {
            return caches.match(evt.request).then(function (response) {
                if (response) {
                    return response;
                } else if (evt.request.headers.get('accept').includes('text/html')) {
                    // return the cached home page for all requests for html pages
                    return caches.match('/');
                }
            })
        }));
    // fetch(evt.request).catch(function () {
    //     return caches.match(evt.request).then(function (response) {
    //         if (response) {
    //             console.log("if response")
    //             return response;
    //         } else if (evt.request.headers.get('accept').includes('text/html')) {
    //             console.log("else if response")
    //             return caches.match('/').then(response => response);
    //         }
    //     });
    // })
}
)
