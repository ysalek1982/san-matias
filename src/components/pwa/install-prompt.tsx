import { Download, Share2, Smartphone, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null)
  const [showIosHelp, setShowIosHelp] = useState(false)
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as NavigatorWithStandalone).standalone === true
    if (standalone || sessionStorage.getItem('pwa-install-dismissed') === '1') return

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const revealPrompt = window.setTimeout(() => {
      setDismissed(false)
      setShowIosHelp(isIos)
    }, 0)

    const capturePrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as InstallPromptEvent)
    }
    const installed = () => setDismissed(true)
    window.addEventListener('beforeinstallprompt', capturePrompt)
    window.addEventListener('appinstalled', installed)
    return () => {
      window.clearTimeout(revealPrompt)
      window.removeEventListener('beforeinstallprompt', capturePrompt)
      window.removeEventListener('appinstalled', installed)
    }
  }, [])

  function dismiss() {
    sessionStorage.setItem('pwa-install-dismissed', '1')
    setDismissed(true)
  }

  async function install() {
    if (!installEvent) return
    await installEvent.prompt()
    const choice = await installEvent.userChoice
    if (choice.outcome === 'accepted') setDismissed(true)
    setInstallEvent(null)
  }

  if (dismissed || (!installEvent && !showIosHelp)) return null

  return (
    <aside className="fixed right-3 bottom-[5.7rem] left-3 z-[70] overflow-hidden rounded-[1.6rem] border border-white/15 bg-forest-950 p-5 text-white shadow-[0_24px_80px_rgba(13,30,23,.35)] sm:right-6 sm:bottom-6 sm:left-auto sm:w-[390px]" aria-label="Instalar aplicación">
      <div className="absolute -top-12 -right-12 size-36 rounded-full bg-sky-300/15 blur-2xl" />
      <button type="button" onClick={dismiss} aria-label="Cerrar aviso de instalación" className="absolute top-3 right-3 grid size-8 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"><X className="size-4" /></button>
      <div className="relative flex gap-4 pr-6">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sky-100 text-forest-900"><Smartphone className="size-5" /></span>
        <div>
          <p className="text-[10px] font-extrabold tracking-[.16em] text-earth-300 uppercase">Portal en su celular</p>
          <h2 className="mt-1 font-display text-xl font-semibold">Instale San Matías</h2>
          <p className="mt-2 text-xs leading-5 text-white/60">Acceda rápidamente a denuncias, seguimiento y servicios municipales.</p>
        </div>
      </div>
      {installEvent ? (
        <Button type="button" onClick={install} className="relative mt-4 w-full rounded-full bg-earth-500 text-white hover:bg-earth-600"><Download /> Instalar aplicación</Button>
      ) : (
        <p className="relative mt-4 flex items-start gap-2 rounded-xl bg-white/5 p-3 text-xs leading-5 text-white/70"><Share2 className="mt-0.5 size-4 shrink-0 text-sky-200" /> En Safari, pulse Compartir y luego “Agregar a inicio”.</p>
      )}
    </aside>
  )
}
