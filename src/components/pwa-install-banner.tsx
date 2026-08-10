'use client'

import { Download, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [isIOS] = useState(() => typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as Record<string, unknown>).MSStream)
  const [iOSVisible, setIOSVisible] = useState(false)

  useEffect(() => {
    // Detect iOS Safari (doesn't support beforeinstallprompt)
    const standalone = (navigator as unknown as Record<string, unknown>).standalone === true
    let iosTimer: number | undefined

    // Show iOS hint after 3s if not already installed
    if (isIOS && !standalone && !sessionStorage.getItem('pwa-ios-dismissed')) {
      iosTimer = window.setTimeout(() => setIOSVisible(true), 3000)
    }

    // Chrome / Android prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      if (!localStorage.getItem('pwa-dismissed')) setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      if (iosTimer) window.clearTimeout(iosTimer)
    }
  }, [isIOS])

  async function install() {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setVisible(false)
  }

  function dismiss() {
    setVisible(false)
    localStorage.setItem('pwa-dismissed', '1')
  }

  function dismissIOS() {
    setIOSVisible(false)
    sessionStorage.setItem('pwa-ios-dismissed', '1')
  }

  // Android / Chrome banner
  if (visible && !isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-4 rounded-2xl border border-forest-900/10 bg-forest-950 p-4 shadow-2xl shadow-forest-950/40 text-white">
          <img src="/icon-192.png" alt="GAM San Matías" className="size-12 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold leading-tight">Instalar San Matías</p>
            <p className="mt-0.5 text-[11px] text-white/55">Accede más rápido desde tu pantalla de inicio</p>
          </div>
          <div className="flex shrink-0 flex-col gap-1.5">
            <button
              onClick={install}
              className="flex items-center gap-1.5 rounded-xl bg-earth-500 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-earth-400"
            >
              <Download className="size-3.5" />
              Instalar
            </button>
            <button
              onClick={dismiss}
              className="rounded-xl px-3 py-1.5 text-[11px] font-bold text-white/50 transition hover:text-white"
            >
              Ahora no
            </button>
          </div>
        </div>
      </div>
    )
  }

  // iOS Safari instruction banner
  if (isIOS && iOSVisible) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm animate-in slide-in-from-bottom-4 duration-300">
        <div className="relative rounded-2xl border border-forest-900/10 bg-forest-950 p-5 shadow-2xl shadow-forest-950/40 text-white">
          <button
            onClick={dismissIOS}
            className="absolute right-3 top-3 grid size-7 place-items-center rounded-lg text-white/40 hover:text-white"
          >
            <X className="size-4" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <img src="/icon-192.png" alt="" className="size-10 rounded-xl" />
            <p className="text-sm font-bold">Instalar San Matías</p>
          </div>
          <p className="text-[12px] text-white/65 leading-5">
            Toca el botón{' '}
            <span className="inline-block rounded bg-white/15 px-1.5 py-0.5 font-mono text-[10px]">□↑</span>
            {' '}en Safari y luego{' '}
            <strong className="text-white">"Añadir a pantalla de inicio"</strong>
          </p>
        </div>
      </div>
    )
  }

  return null
}
