import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ListFilter, Pencil, Plus, Settings2, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { deleteComplaintCategory, getAdminComplaintCategories, saveComplaintCategory } from '@/server/admin'
import type { ComplaintCategory } from '@/types/database'

export const Route = createFileRoute('/admin/configuracion')({
  loader: () => getAdminComplaintCategories(),
  component: SettingsPage,
})

const emptyForm = { name: '', description: '', color: '#2d6045', sortOrder: 0, isActive: true }

const PRESET_COLORS = [
  '#2d6045', '#1a6a8a', '#b45309', '#7c3aed',
  '#be185d', '#dc2626', '#0369a1', '#065f46',
]

function SettingsPage() {
  const categories = Route.useLoaderData()
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [pending, setPending] = useState(false)

  function edit(cat: ComplaintCategory) {
    setEditingId(cat.id)
    setForm({ name: cat.name, description: cat.description ?? '', color: cat.color, sortOrder: cat.sort_order, isActive: cat.is_active })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function reset() { setEditingId(null); setForm(emptyForm) }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setPending(true)
    try {
      await saveComplaintCategory({ data: editingId ? { id: editingId, ...form } : form })
      toast.success(editingId ? 'Categoría actualizada' : 'Categoría creada')
      reset(); await router.invalidate()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar')
    } finally { setPending(false) }
  }

  async function remove(cat: ComplaintCategory) {
    if (!window.confirm(`¿Eliminar la categoría "${cat.name}"? Esta acción no se puede deshacer.`)) return
    try {
      await deleteComplaintCategory({ data: { id: cat.id } })
      toast.success('Categoría eliminada')
      if (editingId === cat.id) reset()
      await router.invalidate()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo eliminar')
    }
  }

  const activeCount = categories.filter((c) => c.is_active).length

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold tracking-[.17em] text-earth-700 uppercase">Administración del CMS</p>
          <h1 className="mt-1.5 font-display text-4xl font-semibold text-forest-950">Categorías de Denuncias</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Configure las categorías que aparecen en el formulario público de denuncias ciudadanas.
          </p>
        </div>
        {/* Quick add btn */}
        {editingId !== null || (
          <Button
            onClick={() => { reset(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="shrink-0 gap-2 rounded-full bg-forest-900 text-white hover:bg-forest-800 shadow-sm"
          >
            <Plus className="size-4" />
            Nueva categoría
          </Button>
        )}
      </div>

      {/* Stats row */}
      <div className="flex gap-3">
        <div className="rounded-2xl border border-forest-900/10 bg-white px-4 py-3">
          <strong className="font-display text-2xl text-forest-950">{categories.length}</strong>
          <span className="block text-[10px] font-bold text-muted-foreground uppercase">Total</span>
        </div>
        <div className="rounded-2xl border border-forest-900/10 bg-white px-4 py-3">
          <strong className="font-display text-2xl text-emerald-700">{activeCount}</strong>
          <span className="block text-[10px] font-bold text-muted-foreground uppercase">Activas</span>
        </div>
        <div className="rounded-2xl border border-forest-900/10 bg-white px-4 py-3">
          <strong className="font-display text-2xl text-gray-500">{categories.length - activeCount}</strong>
          <span className="block text-[10px] font-bold text-muted-foreground uppercase">Ocultas</span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        {/* Form */}
        <form onSubmit={submit} className="h-fit space-y-5 rounded-2xl border border-forest-900/10 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-forest-100 text-forest-800">
                {editingId ? <Pencil className="size-4" /> : <Plus className="size-4" />}
              </span>
              <div>
                <h2 className="font-display text-xl font-semibold text-forest-950">
                  {editingId ? 'Editar categoría' : 'Nueva categoría'}
                </h2>
                <p className="text-[11px] text-muted-foreground">Los cambios son inmediatos en el portal.</p>
              </div>
            </div>
            {editingId && (
              <button type="button" onClick={reset} className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-gray-100">
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="cat-name" className="text-sm font-semibold">
                Nombre de la categoría <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cat-name"
                value={form.name}
                onChange={(e) => setForm((cur) => ({ ...cur, name: e.target.value }))}
                required
                placeholder="Ej: Alumbrado Público"
                className="rounded-xl border-forest-900/15"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="cat-desc" className="text-sm font-semibold">Descripción interna</Label>
              <Textarea
                id="cat-desc"
                value={form.description}
                onChange={(e) => setForm((cur) => ({ ...cur, description: e.target.value }))}
                rows={3}
                placeholder="Descripción para el equipo del CMS (no se muestra al ciudadano)."
                className="rounded-xl border-forest-900/15 resize-none"
              />
            </div>

            {/* Color */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Color identificador</Label>
              {/* Preset swatches */}
              <div className="flex flex-wrap gap-2 mb-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm((cur) => ({ ...cur, color: c }))}
                    className={`size-8 rounded-lg border-2 transition ${form.color === c ? 'border-forest-900 scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((cur) => ({ ...cur, color: e.target.value }))}
                  className="h-10 w-12 cursor-pointer rounded-lg border border-forest-900/15 bg-white p-1"
                />
                <Input
                  value={form.color}
                  onChange={(e) => setForm((cur) => ({ ...cur, color: e.target.value }))}
                  className="rounded-xl border-forest-900/15 font-mono text-sm"
                  placeholder="#2d6045"
                />
              </div>
            </div>

            {/* Order + Active row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cat-order" className="text-sm font-semibold">Orden de aparición</Label>
                <Input
                  id="cat-order"
                  type="number"
                  min="0"
                  value={form.sortOrder}
                  onChange={(e) => setForm((cur) => ({ ...cur, sortOrder: Number(e.target.value) }))}
                  className="rounded-xl border-forest-900/15"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Visibilidad</Label>
                <label className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-forest-900/15 bg-gray-50 px-3 text-sm font-semibold text-forest-900">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((cur) => ({ ...cur, isActive: e.target.checked }))}
                    className="size-4 accent-forest-700"
                  />
                  {form.isActive ? 'Visible' : 'Oculta'}
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-2 pt-1">
              {editingId && (
                <Button type="button" variant="outline" onClick={reset} className="flex-1 rounded-xl">
                  Cancelar
                </Button>
              )}
              <Button disabled={pending} className="flex-1 rounded-xl bg-forest-900 text-white hover:bg-forest-800">
                {pending ? 'Guardando…' : editingId ? 'Actualizar' : 'Crear categoría'}
              </Button>
            </div>
          </div>
        </form>

        {/* Categories list */}
        <div className="overflow-hidden rounded-2xl border border-forest-900/10 bg-white">
          <div className="flex items-center justify-between border-b border-forest-900/8 bg-[#f8f6ef] px-6 py-4">
            <div className="flex items-center gap-3">
              <ListFilter className="size-5 text-earth-700" />
              <h2 className="font-display text-xl font-semibold text-forest-950">Categorías publicadas</h2>
            </div>
            <Badge variant="outline" className="rounded-full font-mono">{categories.length}</Badge>
          </div>

          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="grid size-14 place-items-center rounded-2xl bg-forest-50 text-forest-400">
                <Plus className="size-6" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No hay categorías todavía.</p>
              <p className="text-xs text-muted-foreground">Use el formulario de la izquierda para crear la primera.</p>
            </div>
          ) : (
            <div className="divide-y divide-forest-900/8">
              {categories.map((cat) => (
                <div key={cat.id} className="flex flex-wrap items-center gap-4 p-5">
                  {/* Color swatch */}
                  <div
                    className="size-11 shrink-0 rounded-xl shadow-sm"
                    style={{ backgroundColor: cat.color }}
                  />
                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-forest-950">{cat.name}</h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${cat.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}
                      >
                        {cat.is_active ? 'Activa' : 'Oculta'}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {cat.description || 'Sin descripción'} · Orden #{cat.sort_order}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{cat.color}</p>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => edit(cat)}
                      className="h-8 gap-1.5 rounded-lg text-xs font-semibold"
                    >
                      <Pencil className="size-3.5" />
                      Editar
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => remove(cat)}
                      className="size-8 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Eliminar ${cat.name}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm text-sky-900">
        <Settings2 className="mt-0.5 size-5 shrink-0 text-sky-600" />
        <p>
          <strong>Administración segura:</strong> Si una categoría ya tiene denuncias asociadas, el sistema impide
          eliminarla para preservar el historial. Puede ocultarla desactivando la visibilidad.
        </p>
      </div>
    </section>
  )
}
