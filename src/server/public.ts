import { createServerFn } from '@tanstack/react-start'

import { createPublicServerClient } from '@/lib/supabase/server'

function assertNoError(error: { message: string } | null, context: string): void {
  if (error) throw new Error(`${context}: ${error.message}`)
}

export const getHomeData = createServerFn({ method: 'GET' }).handler(async () => {
  const supabase = createPublicServerClient()
  const [works, news, banners] = await Promise.all([
    supabase.from('works').select('*').order('published_at', { ascending: false }).limit(3),
    supabase.from('news').select('*').order('published_at', { ascending: false }).limit(3),
    supabase.from('home_banners').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
  ])
  assertNoError(works.error, 'No se pudieron cargar las obras')
  assertNoError(news.error, 'No se pudieron cargar las noticias')
  return { works: works.data ?? [], news: news.data ?? [], banners: banners.data ?? [] }
})

export const getAuthorities = createServerFn({ method: 'GET' }).handler(async () => {
  const { data, error } = await createPublicServerClient().from('authorities').select('*').order('sort_order')
  assertNoError(error, 'No se pudieron cargar las autoridades')
  return data ?? []
})

export const getWorks = createServerFn({ method: 'GET' }).handler(async () => {
  const { data, error } = await createPublicServerClient().from('works').select('*').order('published_at', { ascending: false })
  assertNoError(error, 'No se pudieron cargar las obras')
  return data ?? []
})

export const getNews = createServerFn({ method: 'GET' }).handler(async () => {
  const { data, error } = await createPublicServerClient().from('news').select('*').order('published_at', { ascending: false })
  assertNoError(error, 'No se pudieron cargar las noticias')
  return data ?? []
})

export const getNewsArticle = createServerFn({ method: 'GET' })
  .validator((input: { slug: string }) => input)
  .handler(async ({ data: input }) => {
    const { data, error } = await createPublicServerClient().from('news').select('*').eq('slug', input.slug).single()
    assertNoError(error, 'No se pudo cargar la noticia')
    if (!data) throw new Error('La noticia no existe')
    return data
  })

export const getDocuments = createServerFn({ method: 'GET' }).handler(async () => {
  const { data, error } = await createPublicServerClient().from('documents').select('*').order('fiscal_year', { ascending: false })
  assertNoError(error, 'No se pudieron cargar los documentos')
  return data ?? []
})

export const getComplaintCategories = createServerFn({ method: 'GET' }).handler(async () => {
  const { data, error } = await createPublicServerClient().from('complaint_categories').select('*').eq('is_active', true).order('sort_order')
  assertNoError(error, 'No se pudieron cargar las categorías')
  return data ?? []
})

export const getProcedures = createServerFn({ method: 'GET' }).handler(async () => {
  const { data, error } = await createPublicServerClient().from('procedures').select('*').eq('status', 'published').order('category')
  assertNoError(error, 'No se pudieron cargar los trámites')
  return data ?? []
})
