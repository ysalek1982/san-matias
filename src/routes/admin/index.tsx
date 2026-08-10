import { Link, createFileRoute } from '@tanstack/react-router'
import {
  Activity, Archive, ArrowRight, Building2, Clock3, FileText,
  LifeBuoy, Newspaper, Package, Radar, TrendingUp, UsersRound, Wrench,
} from 'lucide-react'

import { ComplaintStatusBadge } from '@/components/content/status-badge'
import { getAdminDashboard } from '@/server/admin'

export const Route = createFileRoute('/admin/')({
  loader: () => getAdminDashboard(),
  component: DashboardPage,
})

function DashboardPage() {
  const data = Route.useLoaderData()

  const contentStats = [
    { key: 'works', label: 'Obras', icon: Building2, to: '/admin/obras', color: 'bg-sky-100 text-sky-700' },
    { key: 'news', label: 'Noticias', icon: Newspaper, to: '/admin/noticias', color: 'bg-emerald-100 text-emerald-700' },
    { key: 'authorities', label: 'Autoridades', icon: UsersRound, to: '/admin/autoridades', color: 'bg-purple-100 text-purple-700' },
    { key: 'documents', label: 'Documentos', icon: Archive, to: '/admin/documentos', color: 'bg-amber-100 text-amber-700' },
    { key: 'procedures', label: 'Trámites', icon: FileText, to: '/admin/tramites', color: 'bg-teal-100 text-teal-700' },
    { key: 'complaints', label: 'Denuncias', icon: LifeBuoy, to: '/admin/denuncias', color: 'bg-red-100 text-red-700' },
  ] as const

  const hrStats = [
    { key: 'employees', label: 'Empleados activos', icon: UsersRound, to: '/admin/empleados', color: 'bg-forest-100 text-forest-800' },
    { key: 'assets', label: 'Activos registrados', icon: Package, to: '/admin/inventario', color: 'bg-earth-100 text-earth-800' },
  ] as const

  return (
    <section className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-extrabold tracking-[.17em] text-earth-700 uppercase">Panel de control</p>
        <h1 className="mt-1.5 font-display text-4xl font-semibold text-forest-950">Resumen municipal</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Contenido publicado y actividad reciente del sistema.</p>
      </div>

      {/* Complaint alerts */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/admin/denuncias"
          className="surface-grain group relative overflow-hidden rounded-2xl bg-forest-950 p-6 text-white transition hover:bg-forest-900"
        >
          <div className="absolute -right-6 -top-6 size-32 rounded-full bg-white/5" />
          <Radar className="relative size-6 text-sky-300" />
          <p className="relative mt-8 text-[10px] font-extrabold tracking-[.15em] text-earth-300 uppercase">Nuevas sin revisar</p>
          <strong className="relative mt-1 block font-display text-5xl font-semibold">{data.counts.openComplaints}</strong>
          <span className="relative text-sm text-white/55">denuncias ciudadanas abiertas</span>
          <span className="relative mt-4 flex items-center gap-1.5 text-xs font-bold text-sky-300">
            Ver denuncias <ArrowRight className="size-3.5 transition group-hover:translate-x-1" />
          </span>
        </Link>

        <Link
          to="/admin/denuncias"
          className="group rounded-2xl border border-forest-900/10 bg-white p-6 transition hover:shadow-md"
        >
          <Clock3 className="size-6 text-sky-600" />
          <p className="mt-8 text-[10px] font-extrabold tracking-[.15em] text-earth-700 uppercase">En seguimiento activo</p>
          <strong className="mt-1 block font-display text-5xl font-semibold text-forest-950">{data.counts.reviewComplaints}</strong>
          <span className="text-sm text-muted-foreground">casos en revisión</span>
          <span className="mt-4 flex items-center gap-1.5 text-xs font-bold text-forest-700">
            Atender casos <ArrowRight className="size-3.5 transition group-hover:translate-x-1" />
          </span>
        </Link>
      </div>

      {/* Content stats grid */}
      <div>
        <p className="mb-4 flex items-center gap-2 text-[10px] font-extrabold tracking-[.15em] text-muted-foreground uppercase">
          <Activity className="size-3.5" /> Contenido publicado
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {contentStats.map(({ key, label, icon: Icon, to, color }) => (
            <Link
              key={key}
              to={to}
              className="group rounded-2xl border border-forest-900/10 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <span className={`grid size-9 place-items-center rounded-xl ${color}`}>
                  <Icon className="size-4" />
                </span>
                <span className="font-display text-3xl font-semibold text-forest-950">
                  {data.counts[key]}
                </span>
              </div>
              <p className="mt-5 text-xs font-bold text-muted-foreground">{label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* RRHH & Inventario */}
      <div>
        <p className="mb-4 flex items-center gap-2 text-[10px] font-extrabold tracking-[.15em] text-muted-foreground uppercase">
          <TrendingUp className="size-3.5" /> Recursos Humanos e Inventario
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {hrStats.map(({ key, label, icon: Icon, to, color }) => (
            <Link
              key={key}
              to={to}
              className="group flex items-center gap-5 rounded-2xl border border-forest-900/10 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${color}`}>
                <Icon className="size-5" />
              </span>
              <div className="flex-1 min-w-0">
                <strong className="font-display text-3xl font-semibold text-forest-950">{data.counts[key]}</strong>
                <p className="mt-0.5 text-xs font-bold text-muted-foreground">{label}</p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground/40 transition group-hover:translate-x-1 group-hover:text-forest-700" />
            </Link>
          ))}
        </div>
      </div>

      {/* Accesos rápidos */}
      <div>
        <p className="mb-4 flex items-center gap-2 text-[10px] font-extrabold tracking-[.15em] text-muted-foreground uppercase">
          <Wrench className="size-3.5" /> Accesos rápidos
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { to: '/admin/obras', label: 'Añadir obra', sub: 'Publicar nuevo proyecto', icon: Building2 },
            { to: '/admin/noticias', label: 'Redactar noticia', sub: 'Nueva publicación institucional', icon: Newspaper },
            { to: '/admin/empleados', label: 'Registrar empleado', sub: 'Incorporar a la nómina', icon: UsersRound },
          ].map(({ to, label, sub, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-center gap-4 rounded-2xl border border-forest-900/10 bg-white px-5 py-4 transition hover:border-forest-900/20 hover:shadow-sm"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-forest-100 text-forest-800 transition group-hover:bg-forest-900 group-hover:text-white">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-forest-950">{label}</p>
                <p className="text-[11px] text-muted-foreground">{sub}</p>
              </div>
              <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground/40 transition group-hover:translate-x-1 group-hover:text-forest-700" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent complaints */}
      <div className="rounded-2xl border border-forest-900/10 bg-white">
        <div className="flex items-center justify-between border-b border-forest-900/8 px-6 py-4">
          <div className="flex items-center gap-3">
            <LifeBuoy className="size-5 text-earth-700" />
            <h2 className="font-display text-xl font-semibold text-forest-950">Denuncias recientes</h2>
          </div>
          <Link to="/admin/denuncias" className="text-xs font-bold text-forest-700 hover:text-forest-950">
            Ver todas →
          </Link>
        </div>

        <div className="divide-y divide-forest-900/8">
          {data.recentComplaints.map((complaint) => (
            <Link
              key={complaint.id}
              to="/admin/denuncias"
              className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition hover:bg-forest-50/60"
            >
              <div>
                <p className="font-mono text-sm font-bold text-forest-950">{complaint.ticket_number}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{complaint.category} · {complaint.location}</p>
              </div>
              <ComplaintStatusBadge status={complaint.status} />
            </Link>
          ))}
          {data.recentComplaints.length === 0 && (
            <p className="px-6 py-10 text-sm text-muted-foreground">No hay denuncias registradas todavía.</p>
          )}
        </div>
      </div>
    </section>
  )
}
