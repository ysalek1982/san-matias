import { randomUUID } from 'node:crypto'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { createServerFn } from '@tanstack/react-start'

import { createAuthenticatedServerClient } from '@/lib/supabase/server'
import type { CmsRole } from '@/types/database'

const maxSize = 10 * 1024 * 1024
const extensions: Record<string, string> = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/avif': '.avif' }
const resources = new Set(['works', 'authorities', 'news'])
const editorRoles: CmsRole[] = ['superadmin', 'admin', 'editor']
const useCloudStorage = process.env.VERCEL === '1' || process.env.MEDIA_STORAGE === 'supabase'

export const uploadLocalMedia = createServerFn({ method: 'POST' })
  .validator((data: FormData) => data)
  .handler(async ({ data: form }) => {
    const supabase = await requireEditor()
    const file = form.get('file')
    const resource = String(form.get('resource') ?? '')
    if (!(file instanceof File) || !resources.has(resource)) throw new Error('Solicitud de archivo inválida')
    const extension = extensions[file.type]
    if (!extension) throw new Error('Formato no permitido. Use JPG, PNG, WebP o AVIF.')
    if (file.size <= 0 || file.size > maxSize) throw new Error('La imagen debe pesar menos de 10 MB.')

    const year = String(new Date().getFullYear())
    const fileName = `${randomUUID()}${extension}`
    if (useCloudStorage) {
      const storagePath = `${resource}/${year}/${fileName}`
      const { error } = await supabase.storage.from('public-media').upload(storagePath, Buffer.from(await file.arrayBuffer()), { contentType: file.type, cacheControl: '31536000', upsert: false })
      if (error) throw new Error(`No se pudo guardar la imagen: ${error.message}`)
      return { url: supabase.storage.from('public-media').getPublicUrl(storagePath).data.publicUrl }
    }

    const relativeDirectory = path.join('uploads', resource, year)
    const directory = safePublicPath(relativeDirectory)
    await mkdir(directory, { recursive: true })
    await writeFile(path.join(directory, fileName), Buffer.from(await file.arrayBuffer()), { flag: 'wx' })
    return { url: `/${relativeDirectory.replaceAll('\\', '/')}/${fileName}` }
  })

export const deleteLocalMedia = createServerFn({ method: 'POST' })
  .validator((data: { url: string }) => data)
  .handler(async ({ data }) => {
    const supabase = await requireEditor()
    const storageMarker = '/storage/v1/object/public/public-media/'
    const storageIndex = data.url.indexOf(storageMarker)
    if (storageIndex !== -1) {
      const storagePath = decodeURIComponent(data.url.slice(storageIndex + storageMarker.length))
      const { error } = await supabase.storage.from('public-media').remove([storagePath])
      if (error) throw new Error(`No se pudo eliminar la imagen: ${error.message}`)
      return { ok: true }
    }
    if (!data.url.startsWith('/uploads/')) throw new Error('Ruta de archivo inválida')
    if (!useCloudStorage) {
      const target = safePublicPath(data.url.slice(1))
      await unlink(target).catch((error: NodeJS.ErrnoException) => { if (error.code !== 'ENOENT') throw error })
    }
    return { ok: true }
  })

async function requireEditor() {
  const supabase = createAuthenticatedServerClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user) throw new Error('No autorizado')
  const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id', data.user.id).single()
  if (!profile?.is_active || !editorRoles.includes(profile.role)) throw new Error('No autorizado')
  return supabase
}

function safePublicPath(relativePath: string) {
  const publicRoot = path.resolve(process.cwd(), 'public')
  const target = path.resolve(publicRoot, relativePath)
  if (!target.startsWith(`${publicRoot}${path.sep}`)) throw new Error('Ruta de archivo insegura')
  return target
}
