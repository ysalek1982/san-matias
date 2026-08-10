import { createFileRoute, useRouter } from '@tanstack/react-router'
import { AlertTriangle, CheckCheck, Clipboard, Clock3, Inbox, MapPin, MapPinned, MessageSquareReply, Navigation, Phone, Search, Trash2, UserRoundCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { CitizenCaseProfile } from '@/components/admin/citizen-case-profile'
import { ComplaintTimeline } from '@/components/admin/complaint-timeline'
import { ComplaintStatusBadge } from '@/components/content/status-badge'
import { LocationMap } from '@/components/maps/location-map'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { assignComplaint, deleteComplaint, getAdminComplaints, respondToComplaint } from '@/server/admin'
import type { Complaint, ComplaintStatus, Profile } from '@/types/database'

export const Route = createFileRoute('/admin/denuncias')({ loader: () => getAdminComplaints(), component: HelpdeskPage })

type QueueFilter = 'todos' | ComplaintStatus

const filters: Array<{ value: QueueFilter; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'abierto', label: 'Abiertos' },
  { value: 'en_revision', label: 'En revisión' },
  { value: 'resuelto', label: 'Resueltos' },
]

function HelpdeskPage() {
  const data = Route.useLoaderData()
  const [selectedId, setSelectedId] = useState<string | null>(data.complaints[0]?.id ?? null)
  const [filter, setFilter] = useState<QueueFilter>('todos')
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLocaleLowerCase('es')
  const filtered = useMemo(() => data.complaints.filter((complaint) => {
    if (filter !== 'todos' && complaint.status !== filter) return false
    if (!normalizedQuery) return true
    return [complaint.ticket_number, complaint.full_name, complaint.phone, complaint.category, complaint.location]
      .some((value) => value.toLocaleLowerCase('es').includes(normalizedQuery))
  }), [data.complaints, filter, normalizedQuery])
  const selected = data.complaints.find((complaint) => complaint.id === selectedId) ?? filtered[0] ?? data.complaints[0] ?? null
  const selectedUpdates = selected ? data.updates.filter((update) => update.complaint_id === selected.id) : []
  const related = selected ? data.complaints.filter((complaint) => {
    if (selected.identity_document) return complaint.identity_document === selected.identity_document
    return complaint.phone === selected.phone || Boolean(selected.email && complaint.email === selected.email)
  }) : []
  const counts = {
    todos: data.complaints.length,
    abierto: data.complaints.filter((item) => item.status === 'abierto').length,
    en_revision: data.complaints.filter((item) => item.status === 'en_revision').length,
    resuelto: data.complaints.filter((item) => item.status === 'resuelto').length,
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div><p className="text-xs font-extrabold tracking-[.17em] text-earth-700 uppercase">Atención ciudadana</p><h1 className="mt-2 font-display text-4xl font-semibold text-forest-950">Centro de denuncias</h1><p className="mt-2 text-sm text-muted-foreground">Bandeja, asignación, trazabilidad y respuesta ciudadana en un solo espacio.</p></div>
        <div className="flex flex-wrap gap-3"><div className="flex items-center gap-3 rounded-2xl border border-forest-900/10 bg-white px-4 py-3"><span className="status-pulse size-2 rounded-full bg-forest-500" /><div><p className="text-[10px] font-extrabold tracking-wide text-muted-foreground uppercase">Cola activa</p><p className="text-sm font-bold text-forest-950">{counts.abierto + counts.en_revision} casos por atender</p></div></div><div className="flex items-center gap-3 rounded-2xl border border-forest-900/10 bg-white px-4 py-3"><MapPinned className="size-5 text-sky-700" /><div><p className="text-[10px] font-extrabold tracking-wide text-muted-foreground uppercase">Con ubicación</p><p className="text-sm font-bold text-forest-950">{data.complaints.filter((item) => item.latitude !== null && item.longitude !== null).length} puntos en mapa</p></div></div></div>
      </div>

      <div className="mt-7 rounded-[1.5rem] border border-forest-900/10 bg-white p-3 shadow-[0_16px_50px_rgba(13,30,23,.05)]">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1"><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar ticket, ciudadano, teléfono o lugar…" className="h-11 border-0 bg-clay-50 pl-10 shadow-none" /></div>
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-clay-50 p-1">
            {filters.map((item) => <button key={item.value} type="button" onClick={() => setFilter(item.value)} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition ${filter === item.value ? 'bg-forest-950 text-white shadow-sm' : 'text-muted-foreground hover:bg-white'}`}>{item.label} <span className="ml-1 opacity-60">{counts[item.value]}</span></button>)}
          </div>
        </div>
      </div>

      {data.complaints.length === 0 ? <EmptyHelpdesk /> : (
        <div className="mt-5 grid min-h-[720px] gap-5 xl:grid-cols-[330px_minmax(0,1fr)_330px]">
          <aside className="overflow-hidden rounded-[1.5rem] border border-forest-900/10 bg-white">
            <div className="flex items-center justify-between border-b border-forest-900/10 px-5 py-4"><p className="flex items-center gap-2 text-sm font-extrabold text-forest-950"><Inbox className="size-4" /> Bandeja</p><span className="rounded-full bg-clay-50 px-2.5 py-1 text-[10px] font-bold text-muted-foreground">{filtered.length}</span></div>
            <div className="max-h-[660px] divide-y divide-forest-900/10 overflow-y-auto">
              {filtered.map((complaint) => <QueueItem key={complaint.id} complaint={complaint} selected={selected?.id === complaint.id} staff={data.staff} referenceNow={data.generatedAt} onClick={() => setSelectedId(complaint.id)} />)}
              {filtered.length === 0 && <div className="p-8 text-center"><Search className="mx-auto size-8 text-forest-200" /><p className="mt-3 text-sm text-muted-foreground">No hay coincidencias.</p></div>}
            </div>
          </aside>

          <div>{selected ? <ComplaintDetail key={selected.id} complaint={selected} staff={data.staff} referenceNow={data.generatedAt} currentUserRole={data.currentUserRole} /> : null}</div>

          <aside className="grid content-start gap-5">
            {selected && <CitizenCaseProfile complaint={selected} related={related} onSelect={setSelectedId} />}
            {selected && <ComplaintTimeline complaint={selected} updates={selectedUpdates} staff={data.staff} />}
          </aside>
        </div>
      )}
    </section>
  )
}

function QueueItem({ complaint, selected, staff, referenceNow, onClick }: { complaint: Complaint; selected: boolean; staff: Profile[]; referenceNow: string; onClick: () => void }) {
  const assignee = staff.find((profile) => profile.id === complaint.assigned_to)
  const hours = Math.max(0, Math.floor((new Date(referenceNow).getTime() - new Date(complaint.created_at).getTime()) / 3_600_000))
  const urgent = complaint.status !== 'resuelto' && hours >= 24
  return <button type="button" onClick={onClick} className={`w-full border-l-4 p-5 text-left transition hover:bg-clay-50 ${selected ? 'border-l-earth-500 bg-forest-50' : 'border-l-transparent'}`}><div className="flex items-center justify-between gap-2"><span className="font-mono text-xs font-extrabold text-forest-950">{complaint.ticket_number}</span><ComplaintStatusBadge status={complaint.status} /></div><p className="mt-3 line-clamp-1 text-sm font-bold text-forest-950">{complaint.category}</p><p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{complaint.full_name} · {complaint.location}</p><div className="mt-4 flex items-center justify-between gap-2 text-[10px] font-bold text-muted-foreground"><span className="flex items-center gap-1"><UserRoundCheck className="size-3" />{assignee?.full_name ?? 'Sin asignar'}</span><span className="flex items-center gap-2">{complaint.latitude !== null && complaint.longitude !== null && <Navigation className="size-3 text-sky-700" />}<span className={urgent ? 'text-earth-700' : ''}>{hours < 24 ? `${hours} h` : `${Math.floor(hours / 24)} d`}</span></span></div></button>
}

function ComplaintDetail({ complaint, staff, referenceNow, currentUserRole }: { complaint: Complaint; staff: Profile[]; referenceNow: string; currentUserRole: string }) {
  const router = useRouter()
  const [status, setStatus] = useState<ComplaintStatus>(complaint.status)
  const [message, setMessage] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [pending, setPending] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const hours = Math.max(0, Math.floor((new Date(referenceNow).getTime() - new Date(complaint.created_at).getTime()) / 3_600_000))

  async function changeAssignment(value: string) {
    setAssigning(true)
    try { await assignComplaint({ data: { complaintId: complaint.id, assignedTo: value === 'none' ? null : value } }); toast.success('Responsable actualizado'); await router.invalidate() }
    catch (error) { toast.error(error instanceof Error ? error.message : 'No se pudo asignar') }
    finally { setAssigning(false) }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setPending(true)
    try { await respondToComplaint({ data: { complaintId: complaint.id, fromStatus: complaint.status, status, message, isPublic } }); toast.success(isPublic ? 'Respuesta publicada' : 'Nota interna guardada'); setMessage(''); await router.invalidate() }
    catch (error) { toast.error(error instanceof Error ? error.message : 'No se pudo guardar') }
    finally { setPending(false) }
  }

  async function removeComplaint() {
    if (!window.confirm(`¿Eliminar la denuncia ${complaint.ticket_number} de forma permanente? Esta acción solo la puede realizar el Superadministrador.`)) return
    setPending(true)
    try {
      await deleteComplaint({ data: { complaintId: complaint.id } })
      toast.success('Denuncia eliminada permanentemente')
      await router.invalidate()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo eliminar la denuncia')
    } finally { setPending(false) }
  }

  async function copyTicket() { await navigator.clipboard.writeText(complaint.ticket_number); toast.success('Número de ticket copiado') }

  return <article className="overflow-hidden rounded-[1.5rem] border border-forest-900/10 bg-white">
    <header className="surface-grain relative overflow-hidden bg-forest-950 p-6 text-white sm:p-8"><div className="absolute -top-20 -right-16 size-52 rounded-full bg-sky-300/10 blur-2xl" /><div className="relative flex flex-wrap items-start justify-between gap-4"><div><button type="button" onClick={copyTicket} className="flex items-center gap-2 font-mono text-xs font-bold text-earth-300 transition hover:text-white"><Clipboard className="size-3.5" />{complaint.ticket_number}</button><h2 className="mt-3 font-display text-3xl font-semibold">{complaint.category}</h2><p className="mt-2 text-sm text-white/55">Registrado {new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(complaint.created_at))}</p></div><div className="flex flex-col items-end gap-3"><ComplaintStatusBadge status={complaint.status} />{currentUserRole === 'superadmin' && <Button type="button" variant="destructive" size="sm" onClick={removeComplaint} disabled={pending} className="rounded-full bg-red-600/90 hover:bg-red-700 text-xs font-bold gap-1.5"><Trash2 className="size-3.5" />Eliminar denuncia</Button>}</div></div>
      <div className="relative mt-7 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-[9px] font-extrabold tracking-wide text-white/40 uppercase">Tiempo transcurrido</p><p className="mt-2 flex items-center gap-2 text-sm font-bold"><Clock3 className="size-4 text-earth-300" />{hours < 24 ? `${hours} horas` : `${Math.floor(hours / 24)} días`}</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-[9px] font-extrabold tracking-wide text-white/40 uppercase">Nivel de atención</p><p className={`mt-2 flex items-center gap-2 text-sm font-bold ${hours >= 72 && complaint.status !== 'resuelto' ? 'text-earth-300' : ''}`}>{hours >= 72 && complaint.status !== 'resuelto' ? <AlertTriangle className="size-4" /> : <CheckCheck className="size-4 text-sky-200" />}{hours >= 72 && complaint.status !== 'resuelto' ? 'Requiere prioridad' : 'Dentro de seguimiento'}</p></div></div>
    </header>
    <div className="p-6 sm:p-8">
      <div className="grid gap-3 rounded-2xl bg-clay-50 p-5 text-sm"><p className="flex items-center gap-2"><Phone className="size-4 text-forest-600" />{complaint.phone}</p><p className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-forest-600" />{complaint.location}</p></div>
      {complaint.latitude !== null && complaint.longitude !== null ? <div className="mt-5"><LocationMap latitude={complaint.latitude} longitude={complaint.longitude} label={`${complaint.ticket_number} · ${complaint.location}`} className="h-80" /></div> : <div className="mt-5 flex items-center gap-3 rounded-2xl border border-dashed border-forest-900/15 bg-forest-50 p-4 text-xs text-muted-foreground"><MapPinned className="size-5 shrink-0 text-forest-400" />El ciudadano dejó una referencia escrita, pero no compartió coordenadas.</div>}
      <div className="mt-7"><p className="text-[10px] font-extrabold tracking-[.14em] text-earth-700 uppercase">Descripción ciudadana</p><p className="mt-3 whitespace-pre-line text-sm leading-7 text-foreground/75">{complaint.description}</p></div>
      <div className="mt-7 grid gap-2"><Label>Responsable municipal</Label><Select value={complaint.assigned_to ?? 'none'} onValueChange={changeAssignment} disabled={assigning}><SelectTrigger className="w-full"><SelectValue placeholder="Asignar responsable" /></SelectTrigger><SelectContent><SelectItem value="none">Sin asignar</SelectItem>{staff.map((profile) => <SelectItem key={profile.id} value={profile.id}>{profile.full_name} · {profile.role}</SelectItem>)}</SelectContent></Select></div>
      <form onSubmit={submit} className="mt-8 grid gap-4 border-t border-forest-900/10 pt-7"><div className="grid gap-2"><Label>Nuevo estado</Label><Select value={status} onValueChange={(value) => setStatus(value as ComplaintStatus)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="abierto">Abierto</SelectItem><SelectItem value="en_revision">En revisión</SelectItem><SelectItem value="resuelto">Resuelto</SelectItem></SelectContent></Select></div><div className="grid gap-2"><Label htmlFor={`reply-${complaint.id}`}>{isPublic ? 'Respuesta al ciudadano' : 'Nota interna del equipo'}</Label><Textarea id={`reply-${complaint.id}`} value={message} onChange={(event) => setMessage(event.target.value)} rows={5} required placeholder={isPublic ? 'Explique el avance o la solución con lenguaje claro…' : 'Registre una observación interna que no verá el ciudadano…'} /></div><label className="flex cursor-pointer items-center gap-3 rounded-xl bg-clay-50 p-3 text-xs font-bold text-forest-900"><input type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} className="size-4 accent-forest-700" /> Visible para el ciudadano en su seguimiento</label><Button disabled={pending} className="justify-self-end rounded-full"><MessageSquareReply />{pending ? 'Guardando…' : isPublic ? 'Guardar y publicar' : 'Guardar nota interna'}</Button></form>
    </div>
  </article>
}

function EmptyHelpdesk() {
  return <div className="mt-5 grid min-h-[470px] place-items-center rounded-[1.5rem] border border-dashed border-forest-900/15 bg-white p-8 text-center"><div><span className="mx-auto grid size-16 place-items-center rounded-3xl bg-forest-100 text-forest-800"><Inbox className="size-7" /></span><h2 className="mt-6 font-display text-3xl font-semibold text-forest-950">La bandeja está al día</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">Las nuevas denuncias aparecerán aquí con datos del ciudadano, tiempo transcurrido, asignación e historial completo.</p></div></div>
}
