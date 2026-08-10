/**
 * GAM San Matías — Service Worker v2
 * Estrategia: Cache-first para assets, Network-first para páginas.
 */

const CACHE_VER = 'gam-v2'
const STATIC = `${CACHE_VER}-static`
const PAGES = `${CACHE_VER}-pages`
const OFFLINE_URL = '/offline.html'

const PRECACHE = [
  OFFLINE_URL,
  '/icon-192.png',
  '/icon-512.png',
  '/images/la-curicha.jpg',
  '/images/pantanal.png',
]

// ── INSTALL ────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC).then((cache) => cache.addAll(PRECACHE)),
  )
  self.skipWaiting()
})

// ── ACTIVATE ───────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VER))
          .map((k) => caches.delete(k)),
      ),
    ),
  )
  self.clients.claim()
})

// ── FETCH ──────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // No interceptar rutas del admin, login ni APIs externas
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/admin') || url.pathname === '/login') return
  if (url.pathname.startsWith('/_server')) return

  // Assets estáticos → Cache-first
  if (
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icon-') ||
    url.pathname.startsWith('/uploads/')
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone()
              caches.open(STATIC).then((cache) => cache.put(request, copy))
            }
            return response
          }),
      ),
    )
    return
  }

  // Navegación → Network-first con fallback a caché
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(PAGES).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          return cached || caches.match(OFFLINE_URL)
        }),
    )
  }
})

// ── PUSH NOTIFICATIONS (preparado para futuro) ────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'GAM San Matías', {
      body: data.body ?? '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: data.url ?? '/' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = event.notification.data?.url ?? '/'
  event.waitUntil(clients.openWindow(target))
})
