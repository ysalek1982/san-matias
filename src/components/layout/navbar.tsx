import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Menu, Search, ShieldCheck } from 'lucide-react'

import { MunicipalMark } from '@/components/brand/municipal-mark'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/turismo', label: 'Turismo & ANMI' },
  { to: '/autoridades', label: 'Autoridades' },
  { to: '/obras', label: 'Obras' },
  { to: '/noticias', label: 'Noticias' },
  { to: '/tramites', label: 'Trámites' },
  { to: '/documentos', label: 'Transparencia' },
] as const

export function Navbar() {
  return (
    <>
      <div className="bg-forest-950 px-4 py-2 text-[10px] font-bold tracking-[0.13em] text-white/70 uppercase">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <span>Gobierno Autónomo Municipal <span className="text-white/30">·</span> Santa Cruz, Bolivia</span>
          <span className="hidden items-center gap-2 text-sky-200 sm:flex"><i className="status-pulse size-1.5 rounded-full bg-sky-300" /> Servicios digitales activos</span>
        </div>
      </div>
      <header className="sticky top-0 z-50 border-b border-forest-900/10 bg-stone-50/88 shadow-[0_10px_40px_rgba(13,30,23,.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center gap-8 px-4 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Ir a la portada">
            <MunicipalMark />
            <span className="min-w-0 leading-none">
              <strong className="block truncate font-display text-[17px] font-semibold tracking-[-0.02em] text-forest-950">
                San Matías
              </strong>
              <span className="mt-1 block truncate text-[9px] font-extrabold tracking-[0.18em] text-earth-700 uppercase">
                Gobierno municipal
              </span>
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={{ exact: link.to === '/' }}
                activeProps={{ className: 'bg-forest-950 text-white shadow-sm' }}
                className="rounded-full px-4 py-2 text-[13px] font-bold text-forest-800 transition duration-300 hover:bg-white hover:text-forest-950"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            <Button asChild variant="outline" className="rounded-full border-forest-200 bg-transparent">
              <Link to="/denuncias/seguimiento" search={{ ticket: '' }}>
                <Search /> Seguimiento
              </Link>
            </Button>
            <Button asChild className="rounded-full bg-earth-600 text-white hover:bg-earth-700">
                <Link to="/denuncias">Reportar problema <ArrowUpRight /></Link>
            </Button>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="ml-auto rounded-full lg:hidden" aria-label="Abrir menú">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent className="border-0 bg-forest-950 p-7 text-white">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3 text-left text-white">
                  <MunicipalMark /> San Matías
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-10 grid gap-2" aria-label="Navegación móvil">
                {links.map((link) => (
                  <Link key={link.to} to={link.to} activeOptions={{ exact: link.to === '/' }} className="rounded-xl px-4 py-3 text-lg font-semibold hover:bg-white/10">
                    {link.label}
                  </Link>
                ))}
                <Link to="/denuncias" className="mt-4 rounded-xl bg-earth-500 px-4 py-3 text-lg font-semibold">
                  Reportar problema
                </Link>
                <Link to="/denuncias/seguimiento" search={{ ticket: '' }} className="rounded-xl border border-white/15 px-4 py-3 text-lg font-semibold text-white/80">
                  Seguir un ticket
                </Link>
                <Link to="/login" className="mt-8 flex items-center gap-2 px-4 text-sm text-white/60">
                  <ShieldCheck className="size-4" /> Acceso institucional
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  )
}
