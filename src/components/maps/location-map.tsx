import { ExternalLink, MapPinned } from 'lucide-react'

export function LocationMap({ latitude, longitude, label, className = '' }: { latitude: number; longitude: number; label: string; className?: string }) {
  const embedUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`
  const externalUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`

  return (
    <div className={`relative overflow-hidden rounded-[1.4rem] border border-forest-900/10 bg-forest-100 ${className}`}>
      <iframe src={embedUrl} title={`Mapa de ${label}`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" className="h-full min-h-64 w-full border-0" />
      <div className="pointer-events-none absolute top-3 left-3 flex max-w-[calc(100%-5rem)] items-center gap-2 rounded-full bg-forest-950/90 px-3 py-2 text-[10px] font-bold text-white shadow-lg backdrop-blur"><MapPinned className="size-3.5 shrink-0 text-earth-300" /><span className="truncate">{label}</span></div>
      <a href={externalUrl} target="_blank" rel="noreferrer" className="absolute right-3 bottom-3 grid size-9 place-items-center rounded-full bg-white text-forest-900 shadow-lg transition hover:scale-105" aria-label="Abrir ubicación en Google Maps"><ExternalLink className="size-4" /></a>
      <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[9px] text-forest-900 shadow">{latitude.toFixed(5)}, {longitude.toFixed(5)}</span>
    </div>
  )
}
