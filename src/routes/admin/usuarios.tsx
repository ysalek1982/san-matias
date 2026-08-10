import { createFileRoute, useRouter } from '@tanstack/react-router'
import {
  Clock3, Eye, EyeOff, KeyRound, Pencil, ShieldCheck,
  UserCheck, UserCog, UserRoundPlus, X,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createCmsUser, getAdminUsers, resetCmsUserPassword, updateCmsUser } from '@/server/admin'
import type { CmsRole } from '@/types/database'

export const Route = createFileRoute('/admin/usuarios')({
  loader: () => getAdminUsers(),
  component: UsersPage,
})

type RoleMeta = { label: string; description: string; color: string; badgeClass: string }
const roleMeta: Record<CmsRole, RoleMeta> = {
  superadmin: {
    label: 'Superadmin', description: 'Control total: usuarios, sistema y toda configuración.',
    color: 'bg-amber-50 border-amber-200', badgeClass: 'bg-amber-100 text-amber-800',
  },
  admin: {
    label: 'Administrador', description: 'Gestiona contenido, configuración y denuncias.',
    color: 'bg-sky-50 border-sky-200', badgeClass: 'bg-sky-100 text-sky-800',
  },
  editor: {
    label: 'Editor', description: 'Publica obras, noticias, autoridades y documentos.',
    color: 'bg-emerald-50 border-emerald-200', badgeClass: 'bg-emerald-100 text-emerald-800',
  },
  helpdesk: {
    label: 'Mesa de Ayuda', description: 'Atiende y da seguimiento a las denuncias ciudadanas.',
    color: 'bg-purple-50 border-purple-200', badgeClass: 'bg-purple-100 text-purple-800',
  },
}

const emptyForm = { email: '', fullName: '', password: '', role: 'editor' as CmsRole, isActive: true }

function UsersPage() {
  const data = Route.useLoaderData()
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [pending, setPending] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const editing = data.users.find((u) => u.id === editingId) ?? null
  const activeCount = data.users.filter((u) => u.is_active).length
  const adminCount = data.users.filter((u) => u.role === 'superadmin' || u.role === 'admin').length

  function edit(user: (typeof data.users)[number]) {
    setEditingId(user.id)
    setForm({ email: user.email, fullName: user.full_name, password: '', role: user.role, isActive: user.is_active })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function reset() { setEditingId(null); setForm(emptyForm); setShowPass(false) }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setPending(true)
    try {
      if (editingId) {
        await updateCmsUser({ data: { id: editingId, fullName: form.fullName, role: form.role, isActive: form.isActive } })
        if (form.password) await resetCmsUserPassword({ data: { id: editingId, password: form.password } })
        toast.success('Acceso institucional actualizado')
      } else {
        if (!form.password || form.password.length < 8) { toast.error('La contraseña debe tener al menos 8 caracteres'); setPending(false); return }
        await createCmsUser({ data: { email: form.email, fullName: form.fullName, password: form.password, role: form.role } })
        toast.success('Usuario institucional creado')
      }
      reset(); await router.invalidate()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar el usuario')
    } finally { setPending(false) }
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold tracking-[.17em] text-earth-700 uppercase">Seguridad institucional</p>
          <h1 className="mt-1.5 font-display text-4xl font-semibold text-forest-950">Usuarios y Roles</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Administre quién puede acceder al CMS y qué acciones puede realizar.
          </p>
        </div>
        {/* Stats */}
        <div className="flex gap-3">
          <div className="flex items-center gap-2.5 rounded-2xl border border-forest-900/10 bg-white px-4 py-3">
            <UserCheck className="size-4 text-emerald-600" />
            <div>
              <strong className="font-display text-xl text-forest-950">{activeCount}</strong>
              <span className="block text-[9px] font-bold tracking-wide text-muted-foreground uppercase">Activos</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-2xl border border-forest-900/10 bg-white px-4 py-3">
            <ShieldCheck className="size-4 text-sky-600" />
            <div>
              <strong className="font-display text-xl text-forest-950">{adminCount}</strong>
              <span className="block text-[9px] font-bold tracking-wide text-muted-foreground uppercase">Admins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role reference cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(Object.entries(roleMeta) as [CmsRole, RoleMeta][]).map(([role, meta]) => (
          <div key={role} className={`rounded-2xl border p-4 ${meta.color}`}>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide uppercase ${meta.badgeClass}`}>
              {meta.label}
            </span>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{meta.description}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        {/* Form */}
        <form onSubmit={submit} className="h-fit space-y-5 rounded-2xl border border-forest-900/10 bg-white p-6">
          {/* Form header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-forest-100 text-forest-800">
                {editing ? <Pencil className="size-4" /> : <UserRoundPlus className="size-4" />}
              </span>
              <div>
                <h2 className="font-display text-xl font-semibold text-forest-950">
                  {editing ? 'Editar acceso' : 'Nuevo acceso'}
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  {editing ? editing.email : 'Servidor municipal del CMS'}
                </p>
              </div>
            </div>
            {editing && (
              <button type="button" onClick={reset} className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-gray-100">
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Full name */}
            <div className="space-y-1.5">
              <Label htmlFor="u-name" className="text-sm font-semibold">Nombre completo</Label>
              <Input
                id="u-name"
                value={form.fullName}
                onChange={(e) => setForm((cur) => ({ ...cur, fullName: e.target.value }))}
                required
                placeholder="Ej: María Chávez Suárez"
                className="rounded-xl border-forest-900/15"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="u-email" className="text-sm font-semibold">Correo electrónico</Label>
              <Input
                id="u-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((cur) => ({ ...cur, email: e.target.value }))}
                disabled={Boolean(editing)}
                required
                placeholder="usuario@sanmatias.gob.bo"
                className="rounded-xl border-forest-900/15 disabled:bg-gray-50"
              />
              {editing && (
                <p className="text-[11px] text-muted-foreground">El correo no puede modificarse después de creado.</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="u-pass" className="text-sm font-semibold">
                {editing ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña temporal *'}
              </Label>
              <div className="relative">
                <Input
                  id="u-pass"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((cur) => ({ ...cur, password: e.target.value }))}
                  minLength={8}
                  required={!editing}
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  className="rounded-xl border-forest-900/15 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-forest-800"
                >
                  {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {form.password.length > 0 && form.password.length < 8
                  ? `Faltan ${8 - form.password.length} caracteres`
                  : 'La contraseña no se mostrará después de guardar.'}
              </p>
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Rol del sistema</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm((cur) => ({ ...cur, role: v as CmsRole }))}
              >
                <SelectTrigger className="w-full rounded-xl border-forest-900/15">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(roleMeta) as [CmsRole, RoleMeta][]).map(([role, meta]) => (
                    <SelectItem key={role} value={role}>{meta.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="rounded-lg bg-gray-50 px-3 py-2 text-[11px] leading-5 text-muted-foreground">
                {roleMeta[form.role].description}
              </p>
            </div>

            {/* Active toggle */}
            {editing && (
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-forest-900/10 bg-gray-50 p-3.5 text-sm font-semibold text-forest-900">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((cur) => ({ ...cur, isActive: e.target.checked }))}
                  disabled={editing.id === data.currentUserId}
                  className="size-4 accent-forest-700 rounded"
                />
                <div>
                  <p>Cuenta habilitada</p>
                  {editing.id === data.currentUserId && (
                    <p className="text-[11px] font-normal text-muted-foreground">No puede desactivar su propia cuenta.</p>
                  )}
                </div>
              </label>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              {editing && (
                <Button type="button" variant="outline" onClick={reset} className="flex-1 rounded-xl">
                  Cancelar
                </Button>
              )}
              <Button
                disabled={pending}
                className="flex-1 rounded-xl bg-forest-900 text-white hover:bg-forest-800"
              >
                {pending ? 'Guardando…' : editing ? 'Actualizar acceso' : 'Crear usuario'}
              </Button>
            </div>
          </div>
        </form>

        {/* Users list */}
        <div className="overflow-hidden rounded-2xl border border-forest-900/10 bg-white">
          <div className="flex items-center justify-between border-b border-forest-900/8 bg-[#f8f6ef] px-6 py-4">
            <div className="flex items-center gap-3">
              <UserCog className="size-5 text-earth-700" />
              <h2 className="font-display text-xl font-semibold text-forest-950">Equipo del CMS</h2>
            </div>
            <Badge variant="outline" className="rounded-full font-mono">{data.users.length}</Badge>
          </div>

          <div className="divide-y divide-forest-900/8">
            {data.users.map((user) => {
              const meta = roleMeta[user.role]
              return (
                <div key={user.id} className="flex flex-wrap items-center gap-4 p-5">
                  {/* Avatar */}
                  <div className={`grid size-11 shrink-0 place-items-center rounded-xl font-display text-sm font-bold ${user.is_active ? 'bg-forest-900 text-white' : 'bg-gray-100 text-muted-foreground'}`}>
                    {user.full_name.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-forest-950">{user.full_name}</h3>
                      {user.id === data.currentUserId && (
                        <Badge className="bg-sky-100 text-sky-800 text-[10px]">Usted</Badge>
                      )}
                      <Badge className={`text-[10px] ${user.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{user.email}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide uppercase ${meta.badgeClass}`}>
                        {meta.label}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock3 className="size-3" />
                        {user.lastSignInAt
                          ? `Último acceso ${new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium' }).format(new Date(user.lastSignInAt))}`
                          : 'Sin ingresos registrados'}
                      </span>
                    </div>
                  </div>

                  {/* Edit btn */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => edit(user)}
                    aria-label={`Editar ${user.full_name}`}
                    className="shrink-0 gap-1.5 rounded-xl text-xs font-semibold"
                  >
                    <Pencil className="size-3.5" />
                    Editar
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-earth-600/15 bg-earth-50 p-5 text-sm text-earth-800">
        <KeyRound className="mt-0.5 size-5 shrink-0 text-earth-600" />
        <p>
          <strong>Seguridad:</strong> Solo un <em>superadministrador</em> puede crear cuentas, cambiar roles o desactivar
          usuarios. Su propia cuenta no puede ser desactivada ni perder el rol de superadmin.
        </p>
      </div>
    </section>
  )
}
