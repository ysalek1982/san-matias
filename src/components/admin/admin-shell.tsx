import { Link, useRouter } from '@tanstack/react-router'
import {
  Archive, Building2, ChevronRight, FileText, History, Image, LayoutDashboard,
  LogOut, Menu, Newspaper, Package, Settings2, UserCog, UsersRound, Wrench,
} from 'lucide-react'
import type { ReactNode } from 'react'

import { MunicipalMark } from '@/components/brand/municipal-mark'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { CmsRole } from '@/types/database'

type NavItem = {
  to: string
  label: string
  icon: React.ElementType
  roles: readonly CmsRole[]
  group?: string
}

const items: NavItem[] = [
  // Panel
  { to: '/admin', label: 'Resumen', icon: LayoutDashboard, roles: ['superadmin', 'admin', 'editor', 'helpdesk'], group: 'Panel' },
  // Contenido
  { to: '/admin/obras', label: 'Obras', icon: Building2, roles: ['superadmin', 'admin', 'editor'], group: 'Contenido' },
  { to: '/admin/autoridades', label: 'Autoridades', icon: UsersRound, roles: ['superadmin', 'admin', 'editor'], group: 'Contenido' },
  { to: '/admin/noticias', label: 'Noticias', icon: Newspaper, roles: ['superadmin', 'admin', 'editor'], group: 'Contenido' },
  { to: '/admin/tramites', label: 'Trámites', icon: FileText, roles: ['superadmin', 'admin', 'editor'], group: 'Contenido' },
  { to: '/admin/documentos', label: 'Documentos', icon: Archive, roles: ['superadmin', 'admin', 'editor'], group: 'Contenido' },
  { to: '/admin/banners', label: 'Banners Portada', icon: Image, roles: ['superadmin', 'admin', 'editor'], group: 'Contenido' },
  // RRHH e Inventario
  { to: '/admin/empleados', label: 'Personal', icon: UsersRound, roles: ['superadmin', 'admin'], group: 'RRHH & Activos' },
  { to: '/admin/contratos', label: 'Contratos', icon: FileText, roles: ['superadmin', 'admin'], group: 'RRHH & Activos' },
  { to: '/admin/inventario', label: 'Inventario', icon: Package, roles: ['superadmin', 'admin'], group: 'RRHH & Activos' },
  // Atención
  { to: '/admin/denuncias', label: 'Mesa de ayuda', icon: Wrench, roles: ['superadmin', 'admin', 'helpdesk'], group: 'Atención Ciudadana' },
  // Sistema
  { to: '/admin/configuracion', label: 'Configuración', icon: Settings2, roles: ['superadmin', 'admin'], group: 'Sistema' },
  { to: '/admin/auditoria', label: 'Auditoría', icon: History, roles: ['superadmin', 'admin'], group: 'Sistema' },
  { to: '/admin/usuarios', label: 'Usuarios y Roles', icon: UserCog, roles: ['superadmin'], group: 'Sistema' },
]

function NavSection({ role, items, currentGroup }: { role: CmsRole; items: NavItem[]; currentGroup: string }) {
  const filtered = items.filter((item) => item.roles.includes(role) && item.group === currentGroup)
  if (filtered.length === 0) return null
  return (
    <div className="mb-2">
      <p className="mb-1 px-4 text-[9px] font-extrabold tracking-[.18em] text-white/30 uppercase">{currentGroup}</p>
      {filtered.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          activeOptions={{ exact: to === '/admin' }}
          activeProps={{ className: '!bg-white/12 !text-white !font-bold' }}
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-white/60 transition-all hover:bg-white/8 hover:text-white/90"
        >
          <Icon className="size-4 shrink-0" />
          <span className="flex-1">{label}</span>
          <ChevronRight className="size-3 opacity-0 transition group-hover:opacity-100" />
        </Link>
      ))}
    </div>
  )
}

function NavItems({ role }: { role: CmsRole }) {
  const groups = ['Panel', 'Contenido', 'RRHH & Activos', 'Atención Ciudadana', 'Sistema']
  return (
    <nav className="mt-6 space-y-1">
      {groups.map((group) => (
        <NavSection key={group} role={role} items={items} currentGroup={group} />
      ))}
    </nav>
  )
}

export function AdminShell({
  children,
  profile,
}: {
  children: ReactNode
  profile: { full_name: string; email: string; role: CmsRole }
}) {
  const router = useRouter()
  async function logout() {
    await getSupabaseBrowserClient().auth.signOut()
    await router.navigate({ to: '/login' })
  }

  const roleBadgeColor: Record<CmsRole, string> = {
    superadmin: 'bg-amber-400/20 text-amber-300',
    admin: 'bg-sky-400/20 text-sky-300',
    editor: 'bg-emerald-400/20 text-emerald-300',
    helpdesk: 'bg-purple-400/20 text-purple-300',
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex-none px-5 pt-6 pb-4">
        <Link to="/" className="flex items-center gap-3 group">
          <MunicipalMark />
          <div>
            <p className="font-display text-base font-semibold text-white leading-tight">San Matías</p>
            <p className="text-[9px] font-bold tracking-[.18em] text-earth-300 uppercase">CMS Municipal</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-2">
        <NavItems role={profile.role} />
      </div>

      {/* User footer */}
      <div className="flex-none border-t border-white/8 px-3 py-4">
        <div className="rounded-xl bg-white/6 p-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 font-display text-sm font-bold text-white">
              {profile.full_name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white leading-tight">{profile.full_name}</p>
              <p className="truncate text-[10px] text-white/45 leading-tight mt-0.5">{profile.email}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold tracking-[.12em] uppercase ${roleBadgeColor[profile.role]}`}>
              {profile.role}
            </span>
            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 rounded-lg px-2.5 text-white/50 hover:bg-white/10 hover:text-white text-xs"
            >
              <LogOut className="size-3.5" />
              Salir
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f4f1e9]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-forest-950 lg:block">
        {sidebar}
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-forest-900/10 bg-[#f4f1e9]/95 px-4 backdrop-blur sm:px-6">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="size-9 shrink-0 rounded-xl lg:hidden">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 border-0 bg-forest-950 p-0 text-white">
              {sidebar}
            </SheetContent>
          </Sheet>

          <div className="ml-auto flex items-center gap-3">
            <span className={`hidden rounded-full px-3 py-1 text-[10px] font-extrabold tracking-[.14em] uppercase sm:inline ${roleBadgeColor[profile.role]}`}
              style={{ backgroundColor: 'transparent', border: '1px solid currentColor', opacity: 0.8 }}>
              {profile.role}
            </span>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-muted-foreground transition hover:text-forest-900"
            >
              Ver portal ↗
            </a>
          </div>
        </header>

        <main className="p-5 sm:p-7 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
