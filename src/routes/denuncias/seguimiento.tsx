import { createFileRoute } from '@tanstack/react-router'
import { Clock3, Search, TicketCheck } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { ComplaintStatusBadge } from '@/components/content/status-badge'
import { PageHero } from '@/components/layout/page-hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { trackComplaint } from '@/server/complaints'
import type { ComplaintStatus, Json } from '@/types/database'

type Result = { ticket_number: string; status: ComplaintStatus; category: string; created_at: string; updated_at: string; public_updates: Json }
export const Route = createFileRoute('/denuncias/seguimiento')({ validateSearch: (search: Record<string, unknown>) => ({ ticket: typeof search.ticket === 'string' ? search.ticket : '' }), component: TrackingPage })

function TrackingPage() { const search = Route.useSearch(); const [ticket, setTicket] = useState(search.ticket); const [result, setResult] = useState<Result | null>(null); const [searched, setSearched] = useState(false); const [pending, setPending] = useState(false)
  async function submit(event: React.FormEvent) { event.preventDefault(); setPending(true); try { const data = await trackComplaint({ data: { ticketNumber: ticket } }); setResult(data); setSearched(true) } catch (error) { toast.error(error instanceof Error ? error.message : 'No se pudo consultar') } finally { setPending(false) } }
  const updates = Array.isArray(result?.public_updates) ? result.public_updates : []
  return <main><PageHero eyebrow="Mesa de ayuda" title="Seguimiento de ticket" description="Consulte el avance y las respuestas públicas asociadas a su reporte ciudadano." /><section className="mx-auto max-w-3xl px-6 py-20"><form onSubmit={submit} className="flex flex-col gap-3 rounded-[1.5rem] border border-forest-900/10 bg-white p-3 shadow-xl shadow-forest-950/5 sm:flex-row"><Input value={ticket} onChange={(e) => setTicket(e.target.value.toUpperCase())} placeholder="SM-2026-001" className="h-12 border-0 font-mono text-lg shadow-none focus-visible:ring-0" /><Button disabled={pending} className="h-12 rounded-xl px-7"><Search /> {pending ? 'Consultando…' : 'Consultar'}</Button></form>
    {result && <div className="mt-8 rounded-[2rem] border border-forest-900/10 bg-white p-7 sm:p-9"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold text-muted-foreground">Ticket ciudadano</p><h2 className="mt-1 font-display text-4xl font-semibold text-forest-950">{result.ticket_number}</h2><p className="mt-2 text-sm text-muted-foreground">{result.category}</p></div><ComplaintStatusBadge status={result.status} /></div><div className="mt-8 border-t border-forest-900/10 pt-7"><h3 className="flex items-center gap-2 font-bold text-forest-950"><Clock3 className="size-4" /> Historial público</h3>{updates.length ? <div className="mt-5 grid gap-4">{updates.map((update, index) => { const item = update as Record<string, Json | undefined>; return <div key={index} className="rounded-2xl bg-clay-50 p-5"><p className="text-sm leading-6">{String(item.message ?? '')}</p><p className="mt-2 text-xs text-muted-foreground">{new Date(String(item.created_at ?? '')).toLocaleString('es-BO')}</p></div> })}</div> : <p className="mt-4 text-sm text-muted-foreground">El reporte fue recibido. Las respuestas del municipio aparecerán aquí.</p>}</div></div>}
    {searched && !result && <div className="mt-8 grid place-items-center rounded-[2rem] border border-dashed border-forest-900/20 p-12 text-center"><TicketCheck className="size-12 text-forest-300" /><h2 className="mt-4 font-display text-2xl font-semibold">Ticket no encontrado</h2><p className="mt-2 text-sm text-muted-foreground">Revise el código e intente nuevamente.</p></div>}
  </section></main> }

