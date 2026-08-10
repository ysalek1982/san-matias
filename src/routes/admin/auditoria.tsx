import { createFileRoute } from '@tanstack/react-router'
import { Activity, CircleUserRound, Clock3, FileClock, Search, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getCmsAuditLogs } from '@/server/admin'

export const Route = createFileRoute('/admin/auditoria')({
  loader: () => getCmsAuditLogs(),
  component: AuditPage,
})

const actionLabels: Record<string, string> = {
  complaint_assigned: 'Denuncia asignada', complaint_replied: 'Respuesta ciudadana', complaint_note_added: 'Nota interna',
  category_created: 'Categoría creada', category_updated: 'Categoría actualizada', category_deleted: 'Categoría eliminada',
  user_created: 'Usuario creado', user_updated: 'Usuario actualizado', user_password_reset: 'Contraseña renovada',
  resource_created: 'Registro creado', resource_updated: 'Registro actualizado', resource_deleted: 'Registro eliminado',
}
const entityLabels: Record<string, string> = {
  complaint: 'Denuncias', complaint_category: 'Configuración', profile: 'Usuarios',
  works: 'Obras', news: 'Noticias', authorities: 'Autoridades', documents: 'Documentos',
  procedures: 'Trámites', hr_employees: 'Personal', hr_contracts: 'Contratos', inventory_assets: 'Inventario',
}

function AuditPage() {
  const logs = Route.useLoaderData()
  const [query, setQuery] = useState('')
  const [entity, setEntity] = useState('all')
  const entities = useMemo(() => [...new Set(logs.map((log) => log.entity_type))], [logs])
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('es')
    return logs.filter((log) => {
      const searchable = [log.summary, log.action, log.entity_type, log.entity_id, log.actor?.full_name, log.actor?.email].filter(Boolean).join(' ').toLocaleLowerCase('es')
      return (entity === 'all' || log.entity_type === entity) && (!normalized || searchable.includes(normalized))
    })
  }, [entity, logs, query])
  const todayCount = logs.filter((log) => isToday(log.created_at)).length
  const uniqueActors = new Set(logs.map((log) => log.actor_id).filter(Boolean)).size

  return <section>
    <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-extrabold tracking-[.17em] text-earth-700 uppercase">Control institucional</p><h1 className="mt-2 font-display text-4xl font-semibold text-forest-950">Auditoría del CMS</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Historial inalterable de las acciones sensibles realizadas por el equipo municipal.</p></div><div className="flex flex-wrap gap-3"><Metric icon={Activity} value={todayCount} label="Hoy" /><Metric icon={CircleUserRound} value={uniqueActors} label="Responsables" /></div></div>
    <div className="mt-8 overflow-hidden rounded-[1.7rem] border border-forest-900/10 bg-white shadow-[0_16px_50px_-38px_rgba(17,54,38,.5)]">
      <div className="flex flex-col gap-4 border-b border-forest-900/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-forest-100 text-forest-800"><FileClock className="size-5" /></span><div><h2 className="font-display text-2xl font-semibold text-forest-950">Registro de actividad</h2><p className="text-xs text-muted-foreground">Últimos 250 eventos administrativos</p></div></div><Badge variant="outline" className="w-fit rounded-full px-3">{filtered.length} resultados</Badge></div>
      <div className="grid gap-3 border-b border-forest-900/10 bg-[#fbfaf6] p-4 sm:grid-cols-[1fr_14rem] sm:p-5"><label className="relative"><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><span className="sr-only">Buscar en la auditoría</span><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar acción, responsable o referencia…" className="bg-white pl-10" /></label><Select value={entity} onValueChange={setEntity}><SelectTrigger className="w-full bg-white"><SelectValue placeholder="Todos los módulos" /></SelectTrigger><SelectContent><SelectItem value="all">Todos los módulos</SelectItem>{entities.map((value) => <SelectItem key={value} value={value}>{entityLabels[value] ?? value}</SelectItem>)}</SelectContent></Select></div>
      {filtered.length ? <div className="divide-y divide-forest-900/10">{filtered.map((log) => <article key={log.id} className="grid gap-4 p-5 transition-colors hover:bg-forest-50/60 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-6"><span className="grid size-10 place-items-center rounded-full bg-forest-950 text-white"><ShieldCheck className="size-4" /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-forest-950">{actionLabels[log.action] ?? log.action}</h3><Badge className="bg-earth-100 text-earth-800">{entityLabels[log.entity_type] ?? log.entity_type}</Badge></div><p className="mt-1 text-sm leading-6 text-foreground/75">{log.summary}</p><p className="mt-2 truncate text-[11px] text-muted-foreground">{log.actor?.full_name ?? 'Sistema'}{log.actor?.email ? ` · ${log.actor.email}` : ''}{log.entity_id ? ` · Ref. ${shortId(log.entity_id)}` : ''}</p></div><time dateTime={log.created_at} className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap text-muted-foreground sm:self-start sm:pt-1"><Clock3 className="size-3.5" />{formatDate(log.created_at)}</time></article>)}</div> : <div className="grid place-items-center px-6 py-20 text-center"><span className="grid size-14 place-items-center rounded-2xl bg-forest-100 text-forest-800"><FileClock className="size-6" /></span><h3 className="mt-4 font-display text-xl font-semibold text-forest-950">Sin actividad para mostrar</h3><p className="mt-1 max-w-sm text-sm text-muted-foreground">Las nuevas acciones administrativas aparecerán aquí automáticamente.</p></div>}
    </div>
  </section>
}

function Metric({ icon: Icon, value, label }: { icon: typeof Activity; value: number; label: string }) { return <div className="flex items-center gap-3 rounded-2xl border border-forest-900/10 bg-white px-4 py-3"><Icon className="size-5 text-forest-700" /><div><strong className="font-display text-xl text-forest-950">{value}</strong><span className="block text-[9px] font-bold tracking-wide text-muted-foreground uppercase">{label}</span></div></div> }
function formatDate(value: string) { return new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) }
function isToday(value: string) { const date = new Date(value); const today = new Date(); return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate() }
function shortId(value: string) { return value.length > 16 ? `${value.slice(0, 8)}…` : value }
