import type { ReactNode } from 'react'

import { InstallPrompt } from '@/components/pwa/install-prompt'

import { Footer } from './footer'
import { MobileCitizenDock } from './mobile-citizen-dock'
import { Navbar } from './navbar'

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-0">
      <Navbar />
      {children}
      <Footer />
      <MobileCitizenDock />
      <InstallPrompt />
    </div>
  )
}
