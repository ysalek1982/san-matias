import { Pencil, Plus, Trash2, Search, ChevronDown } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { deleteAdminResource, saveAdminResource, type AdminResource } from '@/server/admin'
import { deleteLocalMedia, uploadLocalMedia } from '@/server/media'
import { ImageUpload, validateImage } from './image-upload'

export type ResourceField = {
  key: string
  label: string
  type?: 'text' | 'number' | 'textarea' | 'select' | 'file' | 'image'
  required?: boolean
  options?: Array<{ value: string; label: string }>
  defaultValue?: string
  hint?: string
}

const STATUS_COLORS: Record<string, string> = {
  published: 'bg-emerald-100 text-emerald-800',
  draft: 'bg-amber-100 text-amber-800',
  archived: 'bg-gray-100 text-gray-600',
  active: 'bg-emerald-100 text-emerald-800',
  inactive: 'bg-gray-100 text-gray-600',
  suspended: 'bg-red-100 text-red-700',
  operativo: 'bg-emerald-100 text-emerald-800',
  mantenimiento: 'bg-amber-100 text-amber-800',
  de_baja: 'bg-gray-100 text-gray-500',
  en_ejecucion: 'bg-sky-100 text-sky-800',
  adjudicado: 'bg-purple-100 text-purple-800',
  ejecutado: 'bg-emerald-100 text-emerald-800',
}

const STATUS_LABELS: Record<string, string> = {
  published: 'Publicado', draft: 'Borrador', archived: 'Archivado',
  active: 'Activo', inactive: 'Inactivo', suspended: 'Suspendido',
  operativo: 'Operativo', mantenimiento: 'Mantenimiento', de_baja: 'De baja',
  en_ejecucion: 'En ejecución', adjudicado: 'Adjudicado', ejecutado: 'Ejecutado',
}

export function ResourceManager({
  title, description, resource, rows, fields, displayKeys,
}: {
  title: string
  description: string
  resource: AdminResource
  rows: Array<Record<string, unknown>>
  fields: ResourceField[]
  displayKeys: string[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [pending, setPending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [search, setSearch] = useState('')

  const emptyValues = useMemo(
    () => ({
      ...Object.fromEntries(fields.map((f) => [f.key, f.defaultValue ?? ''])),
      ...(resource === 'documents' ? { file_name: '' } : {}),
    }),
    [fields, resource],
  )
  const [values, setValues] = useState<Record<string, string>>(emptyValues)
  const imageField = fields.find((f) => f.type === 'image')

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter((row) =>
      displayKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(q)),
    )
  }, [rows, search, displayKeys])

  function startCreate() {
    setEditing(null); setValues(emptyValues); setImageFile(null); setOpen(true)
  }
  function startEdit(row: Record<string, unknown>) {
    setEditing(row); setImageFile(null)
    setValues({
      ...Object.fromEntries(fields.map((f) => [f.key, row[f.key] == null ? '' : String(row[f.key])])),
      ...(resource === 'documents' ? { file_name: String(row.file_name ?? '') } : {}),
    })
    setOpen(true)
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setPending(true)
    let uploadedPath: string | null = null
    try {
      let nextValues = values
      const previousImage = imageField && editing ? String(editing[imageField.key] ?? '') : ''
      if (imageFile && imageField) {
        setUploading(true)
        const uploaded = await uploadImage(imageFile, resource)
        uploadedPath = uploaded.path
        nextValues = { ...values, [imageField.key]: uploaded.publicUrl }
        setValues(nextValues)
      }
      await saveAdminResource({ data: { resource, ...(editing?.id ? { id: String(editing.id) } : {}), values: nextValues } })
      if (imageField && previousImage && previousImage !== nextValues[imageField.key]) void removeStoredImage(previousImage)
      toast.success(editing ? 'Registro actualizado correctamente' : 'Registro creado correctamente')
      setOpen(false); setImageFile(null); await router.invalidate()
    } catch (error) {
      if (uploadedPath) await removeStoredImage(uploadedPath)
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar el registro')
    } finally { setPending(false); setUploading(false) }
  }

  async function remove(row: Record<string, unknown>) {
    if (!window.confirm('¿Eliminar este registro de forma permanente? Esta acción no se puede deshacer.')) return
    try {
      await deleteAdminResource({ data: { resource, id: String(row.id) } })
      toast.success('Registro eliminado')
      await router.invalidate()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo eliminar')
    }
  }

  async function uploadDocument(file: File) {
    setUploading(true)
    try {
      const safeName = file.name.normalize('NFD').replace(/[\u0300-\u036f]/gu, '').replace(/[^a-zA-Z0-9._-]/gu, '-').toLowerCase()
      const path = `${new Date().getFullYear()}/${crypto.randomUUID()}-${safeName}`
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.storage.from('public-documents').upload(path, file, { contentType: 'application/pdf', upsert: false })
      if (error) throw error
      const { data } = supabase.storage.from('public-documents').getPublicUrl(path)
      setValues((current) => ({ ...current, file_path: data.publicUrl, file_name: file.name }))
      toast.success('PDF cargado correctamente')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo cargar el PDF')
    } finally { setUploading(false) }
  }

  const statusVal = (row: Record<string, unknown>) => String(row.status ?? row.content_status ?? '')
  const avatarChar = (row: Record<string, unknown>) => String(row[displayKeys[0] ?? 'id'] ?? '?').slice(0, 2).toUpperCase()

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold tracking-[.17em] text-earth-700 uppercase">Gestor de contenido</p>
          <h1 className="mt-1.5 font-display text-4xl font-semibold text-forest-950">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button onClick={startCreate} className="shrink-0 rounded-full bg-forest-900 text-white hover:bg-forest-800 shadow-sm">
          <Plus className="size-4" />
          Nuevo registro
        </Button>
      </div>

      {/* Search bar */}
      {rows.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-forest-900/15"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-forest-900/10 bg-white shadow-sm">
        {/* Table header */}
        <div className="hidden grid-cols-[2fr_1fr_auto] items-center gap-4 border-b border-forest-900/8 bg-[#f8f6ef] px-5 py-3 md:grid">
          <span className="text-[10px] font-extrabold tracking-[.14em] text-muted-foreground uppercase">Registro</span>
          <span className="text-[10px] font-extrabold tracking-[.14em] text-muted-foreground uppercase">Estado</span>
          <span className="text-[10px] font-extrabold tracking-[.14em] text-muted-foreground uppercase">Acciones</span>
        </div>

        <div className="divide-y divide-forest-900/8">
          {filteredRows.map((row) => {
            const sv = statusVal(row)
            return (
              <div key={String(row.id)} className="grid gap-3 p-4 md:grid-cols-[2fr_1fr_auto] md:items-center">
                {/* Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="hidden shrink-0 size-9 rounded-xl bg-forest-100 font-display text-sm font-bold text-forest-800 md:grid place-items-center">
                    {avatarChar(row)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-forest-950 leading-snug">
                      {String(row[displayKeys[0] ?? 'id'] ?? '—')}
                    </p>
                    {displayKeys[1] && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {String(row[displayKeys[1]] ?? '')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status badge */}
                <div>
                  {sv ? (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wide uppercase ${STATUS_COLORS[sv] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[sv] ?? sv}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>

                {/* Actions - always in a row, never overlapping */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => startEdit(row)}
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5 rounded-lg border-forest-900/15 text-xs font-semibold"
                    aria-label="Editar"
                  >
                    <Pencil className="size-3.5" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => remove(row)}
                    size="icon"
                    variant="ghost"
                    className="size-8 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}

          {filteredRows.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="grid size-14 place-items-center rounded-2xl bg-forest-50 text-forest-400">
                <ChevronDown className="size-6" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {search ? 'No se encontraron resultados para tu búsqueda.' : 'No hay registros todavía.'}
              </p>
              {!search && (
                <Button onClick={startCreate} variant="outline" size="sm" className="rounded-full mt-1">
                  <Plus className="size-3.5" /> Crear primero
                </Button>
              )}
            </div>
          )}
        </div>

        {rows.length > 0 && (
          <div className="border-t border-forest-900/8 bg-[#f8f6ef] px-5 py-2.5 text-[11px] text-muted-foreground">
            {filteredRows.length} de {rows.length} registros
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={(next) => { if (!pending) { setOpen(next); if (!next) setImageFile(null) } }}>
        <DialogTrigger className="hidden" />
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editing ? 'Editar registro' : 'Nuevo registro'}
            </DialogTitle>
            <DialogDescription>
              Complete la información y defina su estado de publicación.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} className="mt-2 grid gap-5 sm:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.key}
                className={`grid gap-1.5 ${field.type === 'textarea' || field.type === 'file' || field.type === 'image' ? 'sm:col-span-2' : ''}`}
              >
                <Label htmlFor={field.key} className="text-sm font-semibold text-forest-900">
                  {field.label}
                  {field.required && <span className="ml-1 text-red-500">*</span>}
                </Label>

                {field.type === 'textarea' ? (
                  <Textarea
                    id={field.key}
                    required={field.required}
                    rows={5}
                    value={values[field.key] ?? ''}
                    onChange={(e) => setValues((cur) => ({ ...cur, [field.key]: e.target.value }))}
                    className="rounded-xl border-forest-900/15 resize-none"
                  />
                ) : field.type === 'select' ? (
                  <Select
                    value={values[field.key] ?? ''}
                    onValueChange={(v) => setValues((cur) => ({ ...cur, [field.key]: v }))}
                  >
                    <SelectTrigger id={field.key} className="w-full rounded-xl border-forest-900/15">
                      <SelectValue placeholder="Seleccione una opción" />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === 'image' ? (
                  <ImageUpload
                    value={values[field.key] ?? ''}
                    file={imageFile}
                    disabled={pending}
                    uploading={uploading}
                    onFile={(file) => {
                      const err = validateImage(file)
                      if (err) { toast.error(err); return }
                      setImageFile(file)
                    }}
                    onRemove={() => { setImageFile(null); setValues((cur) => ({ ...cur, [field.key]: '' })) }}
                  />
                ) : field.type === 'file' ? (
                  <div className="space-y-1.5">
                    <Input
                      id={field.key}
                      type="file"
                      accept="application/pdf"
                      required={field.required && !values[field.key]}
                      disabled={uploading}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadDocument(f) }}
                      className="rounded-xl border-forest-900/15 file:mr-3 file:rounded-lg file:border-0 file:bg-forest-100 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-forest-800"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      {uploading ? 'Cargando PDF…' : values.file_name || 'Solo se aceptan archivos PDF.'}
                    </p>
                  </div>
                ) : (
                  <Input
                    id={field.key}
                    type={field.type === 'number' ? 'number' : 'text'}
                    required={field.required}
                    value={values[field.key] ?? ''}
                    onChange={(e) => setValues((cur) => ({ ...cur, [field.key]: e.target.value }))}
                    className="rounded-xl border-forest-900/15"
                  />
                )}
                {field.hint && <p className="text-[11px] text-muted-foreground">{field.hint}</p>}
              </div>
            ))}

            <DialogFooter className="sm:col-span-2 pt-2 border-t border-forest-900/8">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="rounded-full"
              >
                Cancelar
              </Button>
              <Button
                disabled={pending || uploading}
                className="rounded-full bg-forest-900 text-white hover:bg-forest-800"
              >
                {uploading ? 'Subiendo imagen…' : pending ? 'Guardando…' : editing ? 'Actualizar' : 'Crear registro'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}

async function uploadImage(file: File, resource: AdminResource) {
  const form = new FormData()
  form.set('file', file)
  form.set('resource', resource)
  const result = await uploadLocalMedia({ data: form })
  return { path: result.url, publicUrl: result.url }
}

async function removeStoredImage(publicUrl: string) {
  if (!publicUrl.startsWith('/uploads/')) return
  await deleteLocalMedia({ data: { url: publicUrl } })
}
