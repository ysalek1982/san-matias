import '@tanstack/react-start/server-only'

import { createServerClient } from '@supabase/ssr'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getCookies, setCookie } from '@tanstack/react-start/server'

import { getPublicSupabaseEnv } from '@/lib/env'
import type { Database } from '@/types/database'

/** Cliente de solo lectura pública para loaders SSR; conserva las políticas RLS. */
export function createPublicServerClient(): SupabaseClient<Database> {
  const { url, publishableKey } = getPublicSupabaseEnv()

  return createClient<Database>(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  })
}

/**
 * Cliente SSR ligado a la sesión del usuario. Debe crearse dentro de un loader,
 * server function o middleware para que exista un contexto HTTP activo.
 */
export function createAuthenticatedServerClient(): SupabaseClient<Database> {
  const { url, publishableKey } = getPublicSupabaseEnv()

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return Object.entries(getCookies()).map(([name, value]) => ({ name, value }))
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          setCookie(name, value, options)
        }
      },
    },
  })
}
