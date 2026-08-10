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

export const uploadLocalMedia = createServerFn({ method: 'POST' })
  .validator((data: FormData) => data)
  .handler(async ({ data: form }) => {
    await requireEditor()
    const file = form.get('file')
    const resource = String(form.get('resource') ?? '')
    if (!(file instanceof File) || !resources.has(resource)) throw new Error('Solicitud de archivo inválida')
    const extension = extensions[file.type]
    if (!extension) throw new Error('Formato no permitido. Use JPG, PNG, WebP o AVIF.')
    if (file.size <= 0 || file.size > maxSize) throw new Error('La imagen debe pesar menos de 10 MB.')

    const year = String(new Date().getFullYear())
    const relativeDirectory = path.join('uploads', resource, year)
    const directory = safePublicPath(relativeDirectory)
    await mkdir(directory, { recursive: true })
    const fileName = `${randomUUID()}${extension}`
    await writeFile(path.join(directory, fileName), Buffer.from(await file.arrayBuffer()), { flag: 'wx' })
    return { url: `/${relativeDirectory.replaceAll('\\', '/')}/${fileName}` }
  })

export const deleteLocalMedia = createServerFn({ method: 'POST' })
  .validator((data: { url: string }) => data)
  .handler(async ({ data }) => {
    await requireEditor()
    if (!data.url.startsWith('/uploads/')) throw new Error('Ruta de archivo inválida')
    const target = safePublicPath(data.url.slice(1))
    await unlink(target).catch((error: NodeJS.ErrnoException) => { if (error.code !== 'ENOENT') throw error })
    return { ok: true }
  })

async function requireEditor() {
  const supabase = createAuthenticatedServerClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user) throw new Error('No autorizado')
  const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id', data.user.id).single()
  if (!profile?.is_active || !editorRoles.includes(profile.role)) throw new Error('No autorizado')
}

function safePublicPath(relativePath: string) {
  const publicRoot = path.resolve(process.cwd(), 'public')
  const target = path.resolve(publicRoot, relativePath)
  if (!target.startsWith(`${publicRoot}${path.sep}`)) throw new Error('Ruta de archivo insegura')
  return target
}
