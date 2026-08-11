import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

import { PublicLayout } from '@/components/layout/public-layout'
import { PWAInstallBanner } from '@/components/pwa-install-banner'
import { Toaster } from '@/components/ui/sonner'
import appCss from '@/styles/app.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { title: 'GAM San Matías — Portal Ciudadano' },
      { name: 'description', content: 'Portal ciudadano, transparencia, trámites y servicios del Gobierno Autónomo Municipal de San Matías, Bolivia.' },
      { name: 'theme-color', content: '#0d1e17' },
      { name: 'application-name', content: 'San Matías' },
      // PWA mobile
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: 'San Matías' },
      // SEO
      { name: 'robots', content: 'index, follow' },
      { property: 'og:site_name', content: 'GAM San Matías' },
      { property: 'og:locale', content: 'es_BO' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'manifest', href: '/manifest.webmanifest' },
      { rel: 'icon', href: '/favicon.ico?v=3', sizes: 'any' },
      { rel: 'icon', href: '/icon-192.png?v=3', type: 'image/png' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png?v=3' },
      { rel: 'apple-touch-icon', sizes: '512x512', href: '/icon-512.png?v=3' },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  const isInstitutional = useRouterState({
    select: (state) =>
      state.location.pathname.startsWith('/admin') || state.location.pathname === '/login',
  })

  // Register Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
        // SW registration failed silently (e.g., dev HTTPS restriction)
      })
    }
  }, [])

  return (
    <RootDocument>
      {isInstitutional ? <Outlet /> : (
        <PublicLayout>
          <Outlet />
        </PublicLayout>
      )}
      <Toaster richColors position="top-right" />
      {!isInstitutional && <PWAInstallBanner />}
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
