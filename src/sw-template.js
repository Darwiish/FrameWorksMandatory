if ("function" === typeof importScripts) {
  importScripts(
    "https://storage.googleapis.com/workbox-cdn/releases/3.5.0/workbox-sw.js"
  );
  /* global workbox */
  if (workbox) {
    console.log("Workbox is loaded");

    /* injection point for manifest files.  */
    workbox.precaching.precacheAndRoute([]);

    /* custom cache rules*/
    workbox.routing.registerNavigationRoute("/index.html", {
      blacklist: [/^\/_/, /\/[^\/]+\.[^\/]+$/]
    });

    // Cache first strategy
    workbox.routing.registerRoute(
      /\.(?:png|gif|jpg|jpeg|svg|json|js)$/, // 
      workbox.strategies.cacheFirst({
        cacheName: "files",
        plugins: [
          new workbox.expiration.Plugin({
            maxEntries: 60,
            maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days * 24H * 60min * 60sec
          })
        ]
      })
    );

    // caching the GET requests
    workbox.routing.registerRoute(
      "/api/(.*)", // 
      workbox.strategies.cacheFirst({
        cacheName: "questions",
        cacheableResponse: { statuses: [0, 200] }
      }),
      "GET"
    );

    //Cache JS files
    workbox.routing.registerRoute(
      new RegExp(".*.js"),
      workbox.strategies.cacheFirst()
    );

    //Cache API response
    workbox.routing.registerRoute(
      new RegExp("https://react-js-y.herokuapp.com/api/(xyz|abc|def)"),
      workbox.strategies.staleWhileRevalidate({
        cacheName: "apiCache",
        plugins: [
          new workbox.expiration.Plugin({
            maxEntries: 100,
            maxAgeSeconds: 30 * 60 // 30 Minutes
          })
        ]
      })
    );

    // Background sync
    const bgSyncPlugin = new workbox.backgroundSync.Plugin("Background Sync", {
      maxRetentionTime: 24 * 60 // Retry for max of 24 Hours
    });

    // have a look at this https://developers.google.com/web/tools/workbox/modules/workbox-background-sync
    workbox.routing.registerRoute(
      "/api/questions/add",
      new workbox.strategies.NetworkOnly({
        plugins: [bgSyncPlugin]
      }),
      "POST"
    );
  } else {
    console.log("Workbox could not be loaded. No Offline support");
  }
}
