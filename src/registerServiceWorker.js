// Add caching for audio resources
workbox.routing.registerRoute(
  /.*\.(?:mp3|wav|ogg)$/,
  new workbox.strategies.CacheFirst({
    cacheName: 'audio-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
); 