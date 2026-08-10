import { ImagePlus, LoaderCircle, UploadCloud, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const maxSize = 10 * 1024 * 1024

export function validateImage(file: File) {
  if (!allowedTypes.includes(file.type)) return 'Use una imagen JPG, PNG, WebP o AVIF.'
  if (file.size > maxSize) return 'La imagen no puede superar los 10 MB.'
  return null
}

export function ImageUpload({ value, file, disabled, uploading, onFile, onRemove }: { value: string; file: File | null; disabled?: boolean; uploading?: boolean; onFile: (file: File) => void; onRemove: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const localPreview = useMemo(() => file ? URL.createObjectURL(file) : null, [file])
  const preview = localPreview ?? value

  useEffect(() => {
    return () => { if (localPreview) URL.revokeObjectURL(localPreview) }
  }, [localPreview])

  function choose(selected?: File) { if (selected && !disabled) onFile(selected) }

  return <div className="overflow-hidden rounded-2xl border border-forest-900/10 bg-[#f8f6ef]">
    {preview ? <div className="group relative aspect-[16/7] min-h-48 overflow-hidden bg-forest-950/5"><img src={preview} alt="Vista previa de la imagen seleccionada" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-forest-950/65 via-transparent to-transparent" /><div className="absolute right-4 bottom-4 left-4 flex flex-wrap items-end justify-between gap-3"><div className="min-w-0 text-white"><p className="text-xs font-extrabold tracking-wide uppercase">Vista previa</p><p className="mt-1 truncate text-xs text-white/75">{file?.name ?? 'Imagen publicada actualmente'}</p></div><div className="flex gap-2"><Button type="button" size="sm" variant="secondary" disabled={disabled} onClick={() => inputRef.current?.click()}><ImagePlus /> Reemplazar</Button><Button type="button" size="icon" variant="secondary" disabled={disabled} onClick={onRemove} aria-label="Quitar imagen"><X /></Button></div></div>{uploading && <div className="absolute inset-0 grid place-items-center bg-forest-950/70 text-white"><div className="text-center"><LoaderCircle className="mx-auto size-7 animate-spin" /><p className="mt-3 text-sm font-bold">Subiendo imagen…</p></div></div>}</div> : <button type="button" disabled={disabled} onClick={() => inputRef.current?.click()} onDragEnter={(event) => { event.preventDefault(); setDragging(true) }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); choose(event.dataTransfer.files[0]) }} className={`grid min-h-52 w-full place-items-center p-8 text-center transition ${dragging ? 'bg-sky-100 ring-2 ring-inset ring-sky-600' : 'hover:bg-forest-50'} disabled:cursor-not-allowed disabled:opacity-60`}><span><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-forest-950 text-white shadow-lg shadow-forest-950/15"><UploadCloud className="size-6" /></span><strong className="mt-4 block font-display text-xl text-forest-950">Arrastre una imagen aquí</strong><span className="mt-1 block text-xs leading-5 text-muted-foreground">o haga clic para buscar en su dispositivo<br />JPG, PNG, WebP o AVIF · máximo 10 MB</span></span></button>}
    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={disabled} className="sr-only" onChange={(event) => { choose(event.target.files?.[0]); event.target.value = '' }} />
  </div>
}
