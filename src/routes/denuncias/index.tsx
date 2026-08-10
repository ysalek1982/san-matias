import { createFileRoute, useRouter } from '@tanstack/react-router'
import { CheckCircle2, LockKeyhole, MapPin, MessageSquareWarning } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { PageHero } from '@/components/layout/page-hero'
import { LocationPicker } from '@/components/maps/location-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createComplaintTicket } from '@/server/complaints'
import { getComplaintCategories } from '@/server/public'

export const Route = createFileRoute('/denuncias/')({
  loader: () => getComplaintCategories(),
  component: ComplaintPage,
})

function ComplaintPage() {
  const categories = Route.useLoaderData()
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [ticket, setTicket] = useState<string | null>(null)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    const form = new FormData(event.currentTarget)
    try {
      const reportType = String(form.get('reportType') ?? '')
      const selectedCategory = String(form.get('category') ?? '')
      const finalCategory = reportType ? `[${reportType}] ${selectedCategory}` : selectedCategory

      const result = await createComplaintTicket({
        data: {
          fullName: String(form.get('fullName') ?? ''),
          identityDocument: String(form.get('identityDocument') ?? ''),
          email: String(form.get('email') ?? ''),
          phone: String(form.get('phone') ?? ''),
          category: finalCategory,
          location: String(form.get('location') ?? ''),
          description: String(form.get('description') ?? ''),
          latitude: form.get('latitude') ? Number(form.get('latitude')) : null,
          longitude: form.get('longitude') ? Number(form.get('longitude')) : null,
        },
      })
      setTicket(result.ticketNumber)
      toast.success('Reporte registrado correctamente')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo registrar el reporte')
    } finally {
      setPending(false)
    }
  }

  if (ticket) {
    return (
      <main>
        <PageHero
          eyebrow="Atención ciudadana"
          title="Reporte recibido con éxito"
          description="Su solicitud ha sido ingresada en la mesa de ayuda del Gobierno Municipal de San Matías."
        />
        <section className="mx-auto max-w-2xl px-6 py-20">
          <div className="rounded-[2rem] border border-forest-900/10 bg-white p-8 text-center shadow-xl shadow-forest-950/5 sm:p-12">
            <CheckCircle2 className="mx-auto size-16 text-emerald-600" />
            <p className="mt-7 text-xs font-extrabold tracking-widest text-muted-foreground uppercase">
              Número de ticket asignado
            </p>
            <p className="mt-2 font-display text-5xl font-semibold tracking-tight text-forest-950">{ticket}</p>
            <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-muted-foreground">
              Conserve este código de ticket. Le permitirá consultar el avance, responsable asignado y respuesta oficial
              sin necesidad de acudir al municipio.
            </p>
            <Button
              className="mt-8 rounded-full bg-forest-900 px-8 font-bold text-white hover:bg-forest-800"
              onClick={() => router.navigate({ to: '/denuncias/seguimiento', search: { ticket } })}
            >
              Consultar seguimiento online →
            </Button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main>
      <PageHero
        eyebrow="Contacto y denuncias"
        title="Su reporte inicia una solución"
        description="Describa la necesidad o problema en su barrio, obtenga un ticket digital y siga la respuesta municipal sin filas."
      />

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[.65fr_1.35fr]">
        {/* Sidebar Info */}
        <aside className="h-fit space-y-6 rounded-[2rem] bg-forest-900 p-8 text-white">
          <MessageSquareWarning className="size-10 text-earth-300" />
          <h2 className="font-display text-3xl font-semibold">Antes de enviar</h2>
          <div className="space-y-4 text-sm leading-6 text-white/70">
            <p>1. Seleccione si su reporte corresponde a un **Área Municipal** general o una **Denuncia Específica**.</p>
            <p>2. Marque en el mapa la ubicación exacta del problema o escriba una referencia clara.</p>
            <p>3. Describa los hechos con el mayor detalle posible.</p>
            <div className="flex gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur">
              <LockKeyhole className="mt-0.5 size-4 shrink-0 text-sky-200" />
              <p className="text-xs text-white/80">
                Sus datos personales están protegidos y solo son visibles para el personal autorizado.
              </p>
            </div>
          </div>
        </aside>

        {/* Complaint Form */}
        <form
          method="post"
          onSubmit={submit}
          className="grid gap-6 rounded-[2rem] border border-forest-900/10 bg-white p-7 sm:grid-cols-2 sm:p-10 shadow-sm"
        >
          {/* Report Classification */}
          <div className="grid gap-2 sm:col-span-2">
            <Label className="text-sm font-bold text-forest-950">Modalidad de reporte</Label>
            <div className="flex flex-wrap gap-4 mt-1">
              <label className="flex items-center gap-2.5 rounded-full border border-forest-200 px-5 py-2.5 text-sm font-semibold text-forest-900 cursor-pointer hover:bg-forest-50 focus-within:ring-2 focus-within:ring-forest-500">
                <input
                  type="radio"
                  name="reportType"
                  value="Área Municipal"
                  defaultChecked
                  className="size-4 text-forest-600 focus:ring-forest-500"
                />
                Área / Servicio Municipal
              </label>
              <label className="flex items-center gap-2.5 rounded-full border border-forest-200 px-5 py-2.5 text-sm font-semibold text-forest-900 cursor-pointer hover:bg-forest-50 focus-within:ring-2 focus-within:ring-forest-500">
                <input
                  type="radio"
                  name="reportType"
                  value="Denuncia Específica"
                  className="size-4 text-forest-600 focus:ring-forest-500"
                />
                Denuncia Específica
              </label>
            </div>
          </div>

          <Field label="Nombre completo *" name="fullName" required placeholder="Ej: Carlos Suárez" />
          <Field label="Cédula de identidad" name="identityDocument" placeholder="Ej: 8392102 SC" />
          <Field label="Teléfono de contacto *" name="phone" required placeholder="Ej: 71234567" />
          <Field label="Correo electrónico" name="email" type="email" placeholder="correo@ejemplo.com" />

          {/* Category */}
          <div className="grid gap-2">
            <Label htmlFor="category" className="text-sm font-semibold">Categoría *</Label>
            <Select name="category" required>
              <SelectTrigger id="category" className="w-full rounded-xl border-forest-900/15">
                <SelectValue placeholder="Seleccione una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    <span className="flex items-center gap-2">
                      <i className="size-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location text */}
          <Field label="Referencia de ubicación *" name="location" required placeholder="Ej: Calle Comercio esq. Bolívar, frente al mercado" />

          {/* Location map picker */}
          <div className="grid gap-2 sm:col-span-2">
            <Label className="flex items-center gap-1.5 text-sm font-semibold">
              <MapPin className="size-4 text-sky-600" /> Marcación geográfica en el mapa (Google Maps)
            </Label>
            <LocationPicker />
          </div>

          {/* Description */}
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="description" className="text-sm font-semibold">Descripción del problema *</Label>
            <Textarea
              id="description"
              name="description"
              minLength={10}
              required
              rows={6}
              placeholder="Explique detalladamente lo que ocurre, referencias de lugar y cualquier dato que ayude a la inspección..."
              className="rounded-xl border-forest-900/15 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-forest-900/10 pt-6 sm:col-span-2">
            <p className="max-w-md text-xs leading-5 text-muted-foreground">
              Al enviar acepta el tratamiento de estos datos exclusivamente para la gestión de su reporte municipal.
            </p>
            <Button
              disabled={pending}
              className="rounded-full bg-earth-600 px-8 font-bold text-white hover:bg-earth-700 shadow-sm"
            >
              {pending ? 'Registrando ticket…' : 'Enviar reporte digital'}
            </Button>
          </div>
        </form>
      </section>
    </main>
  )
}

function Field({
  label,
  name,
  type = 'text',
  required = false,
  placeholder,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name} className="text-sm font-semibold text-forest-950">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="rounded-xl border-forest-900/15"
      />
    </div>
  )
}
