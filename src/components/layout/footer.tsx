import { Link } from '@tanstack/react-router'
import { Facebook, Mail, MapPin, Phone } from 'lucide-react'

import { MunicipalMark } from '@/components/brand/municipal-mark'

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-forest-950 text-white">
      <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:24px_24px]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-4">
            <MunicipalMark className="size-14" />
            <div>
              <p className="font-display text-2xl font-semibold">San Matías</p>
              <p className="text-xs font-bold tracking-[0.16em] text-sky-200 uppercase">Gobierno Autónomo Municipal</p>
            </div>
          </div>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/65">
            Información pública, servicios y participación ciudadana para un municipio abierto, cercano y comprometido con su territorio.
          </p>
        </div>
        <div>
          <p className="text-xs font-extrabold tracking-[0.17em] text-earth-300 uppercase">Accesos</p>
          <div className="mt-5 grid gap-3 text-sm text-white/70">
            <Link to="/" className="hover:text-white">Inicio</Link>
            <Link to="/obras" className="hover:text-white">Obras municipales</Link>
            <Link to="/tramites" className="hover:text-white">Trámites y servicios</Link>
            <Link to="/documentos" className="hover:text-white">Transparencia</Link>
            <Link to="/denuncias" className="hover:text-white">Contacto y denuncias</Link>
            <Link to="/login" className="hover:text-white">Acceso institucional</Link>
          </div>
        </div>
        <div>
          <p className="text-xs font-extrabold tracking-[0.17em] text-earth-300 uppercase">Contacto</p>
          <div className="mt-5 grid gap-4 text-sm text-white/70">
            <span className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-sky-300" /> Plaza Principal, San Matías</span>
            <span className="flex gap-3"><Phone className="size-4 shrink-0 text-sky-300" /> Atención municipal</span>
            <span className="flex gap-3"><Mail className="size-4 shrink-0 text-sky-300" /> contacto@sanmatias.gob.bo</span>
            <span className="flex gap-3"><Facebook className="size-4 shrink-0 text-sky-300" /> GAM San Matías</span>
          </div>
        </div>
      </div>
      <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-white/10 px-6 py-5 text-xs text-white/45">
        <span>© 2026 Gobierno Autónomo Municipal de San Matías · Estado Plurinacional de Bolivia</span>
        <span className="font-semibold text-sky-200/80">Desarrollo por Yassir Salek</span>
      </div>
    </footer>
  )
}
