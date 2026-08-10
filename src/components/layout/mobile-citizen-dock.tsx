import { Link } from '@tanstack/react-router'
import { Home, MessageSquareWarning, Search } from 'lucide-react'

const dockItems = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/denuncias', label: 'Reportar', icon: MessageSquareWarning },
  { to: '/denuncias/seguimiento', label: 'Seguir', icon: Search },
] as const

export function MobileCitizenDock() {
  return (
    <nav aria-label="Acciones ciudadanas" className="fixed inset-x-3 bottom-3 z-60 grid grid-cols-3 rounded-[1.35rem] border border-white/10 bg-forest-950/95 p-1.5 pb-[calc(.375rem+env(safe-area-inset-bottom))] text-white shadow-[0_18px_55px_rgba(13,30,23,.28)] backdrop-blur-xl sm:hidden">
      {dockItems.map(({ to, label, icon: Icon }) => (
        to === '/denuncias/seguimiento' ? (
          <Link key={to} to={to} search={{ ticket: '' }} activeProps={{ className: '!bg-white !text-forest-950' }} className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-extrabold text-white/65 transition"><Icon className="size-4" /> {label}</Link>
        ) : (
          <Link key={to} to={to} activeOptions={{ exact: to === '/' }} activeProps={{ className: '!bg-white !text-forest-950' }} className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-extrabold text-white/65 transition"><Icon className="size-4" /> {label}</Link>
        )
      ))}
    </nav>
  )
}
