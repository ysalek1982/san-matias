import { ArrowRight, CheckCircle2, Clock3, Eye, LockKeyhole, MessageSquareText } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import type { Complaint, ComplaintStatus, ComplaintUpdate, Profile } from '@/types/database'

const statusLabels: Record<ComplaintStatus, string> = {
  abierto: 'Abierto',
  en_revision: 'En revisión',
  resuelto: 'Resuelto',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function ComplaintTimeline({ complaint, updates, staff }: { complaint: Complaint; updates: ComplaintUpdate[]; staff: Profile[] }) {
  const names = new Map(staff.map((profile) => [profile.id, profile.full_name]))
  return (
    <section className="rounded-[1.5rem] border border-forest-900/10 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-[10px] font-extrabold tracking-[.15em] text-earth-700 uppercase">Trazabilidad</p><h3 className="mt-1 font-display text-2xl font-semibold text-forest-950">Historial del caso</h3></div>
        <Badge variant="outline" className="rounded-full">{updates.length + 1} eventos</Badge>
      </div>
      <div className="relative mt-6 space-y-5 pl-7 before:absolute before:top-2 before:bottom-2 before:left-[9px] before:w-px before:bg-forest-900/10">
        <TimelineDot icon={Clock3} tone="earth" />
        <div><p className="text-sm font-bold text-forest-950">Denuncia recibida</p><p className="mt-1 text-xs text-muted-foreground">{formatDate(complaint.created_at)} · Portal ciudadano</p></div>
        {updates.map((update) => {
          const Icon = update.to_status === 'resuelto' ? CheckCircle2 : MessageSquareText
          return (
            <div key={update.id} className="relative">
              <TimelineDot icon={Icon} tone={update.is_public ? 'sky' : 'forest'} />
              <div className="rounded-2xl bg-clay-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-extrabold text-forest-950">{update.author_id ? names.get(update.author_id) ?? 'Equipo municipal' : 'Sistema municipal'}</p>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">{update.is_public ? <Eye className="size-3" /> : <LockKeyhole className="size-3" />}{update.is_public ? 'Visible al ciudadano' : 'Nota interna'}</span>
                </div>
                {update.from_status && update.to_status && update.from_status !== update.to_status && <p className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-sky-800">{statusLabels[update.from_status]} <ArrowRight className="size-3" /> {statusLabels[update.to_status]}</p>}
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-foreground/70">{update.message}</p>
                <p className="mt-3 text-[10px] text-muted-foreground">{formatDate(update.created_at)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function TimelineDot({ icon: Icon, tone }: { icon: typeof Clock3; tone: 'earth' | 'sky' | 'forest' }) {
  const colors = { earth: 'bg-earth-100 text-earth-800', sky: 'bg-sky-100 text-sky-800', forest: 'bg-forest-100 text-forest-800' }
  return <span className={`absolute -left-7 grid size-[19px] place-items-center rounded-full ring-4 ring-white ${colors[tone]}`}><Icon className="size-2.5" /></span>
}
