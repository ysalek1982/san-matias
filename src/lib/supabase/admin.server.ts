import '@tanstack/react-start/server-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { getServerSupabaseEnv } from '@/lib/env'
import type { Database } from '@/types/database'

/**
 * Cliente privilegiado para tareas internas previamente autorizadas.
 * Bypassea RLS: nunca debe usarse como sustituto del usuario autenticado.
 */
export function createAdminServerClient(): SupabaseClient<Database> {
  const { url, serviceRoleKey } = getServerSupabaseEnv()

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  })
}

