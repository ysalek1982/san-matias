/**
 * Registra el Service Worker y gestiona el banner de instalación PWA.
 * Se llama desde __root.tsx en el cliente.
 */
export function registerPWA() {
  if (typeof window === 'undefined') return

  // Registrar SW
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => {
        console.warn('[SW] No se pudo registrar:', err)
      })
    })
  }
}
