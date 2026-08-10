import { AtSign, CircleUserRound, FileText, History, IdCard, Phone } from 'lucide-react'

import { ComplaintStatusBadge } from '@/components/content/status-badge'
import type { Complaint } from '@/types/database'

export function CitizenCaseProfile({ complaint, related, onSelect }: { complaint: Complaint; related: Complaint[]; onSelect: (id: string) => void }) {
  const openCount = related.filter((item) => item.status !== 'resuelto').length
  const resolvedCount = related.filter((item) => item.status === 'resuelto').length
  const initials = complaint.full_name.split(/\s+/u).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

  return (
    <section className="rounded-[1.5rem] border border-forest-900/10 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-forest-900 font-display text-lg font-semibold text-white">{initials || <CircleUserRound />}</span>
        <div className="min-w-0"><p className="truncate font-bold text-forest-950">{complaint.full_name}</p><p className="text-xs text-muted-foreground">Perfil ciudadano</p></div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <Stat value={related.length} label="Casos" />
        <Stat value={openCount} label="Activos" />
        <Stat value={resolvedCount} label="Resueltos" />
      </div>
      <div className="mt-5 grid gap-3 border-t border-forest-900/10 pt-5 text-xs text-foreground/70">
        <p className="flex items-center gap-2"><Phone className="size-3.5 text-forest-600" /><span className="truncate">{complaint.phone}</span></p>
        {complaint.email && <p className="flex items-center gap-2"><AtSign className="size-3.5 text-forest-600" /><span className="truncate">{complaint.email}</span></p>}
        {complaint.identity_document && <p className="flex items-center gap-2"><IdCard className="size-3.5 text-forest-600" />CI {complaint.identity_document}</p>}
      </div>
      {related.length > 1 && (
        <div className="mt-6 border-t border-forest-900/10 pt-5">
          <p className="flex items-center gap-2 text-[10px] font-extrabold tracking-[.13em] text-earth-700 uppercase"><History className="size-3.5" /> Otros reportes</p>
          <div className="mt-3 grid max-h-52 gap-2 overflow-y-auto pr-1">
            {related.filter((item) => item.id !== complaint.id).map((item) => (
              <button key={item.id} type="button" onClick={() => onSelect(item.id)} className="rounded-xl border border-forest-900/10 p-3 text-left transition hover:bg-clay-50">
                <div className="flex items-center justify-between gap-2"><span className="flex items-center gap-1.5 font-mono text-[11px] font-bold"><FileText className="size-3" />{item.ticket_number}</span><ComplaintStatusBadge status={item.status} /></div>
                <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">{item.category}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return <div className="rounded-xl bg-clay-50 p-2"><strong className="font-display text-xl text-forest-950">{value}</strong><span className="block text-[9px] font-bold tracking-wide text-muted-foreground uppercase">{label}</span></div>
}
