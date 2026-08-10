import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

import { getPublicSupabaseEnv } from '@/lib/env'
import type { Database } from '@/types/database'

let browserClient: SupabaseClient<Database> | undefined

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (!browserClient) {
    const { url, publishableKey } = getPublicSupabaseEnv()
    browserClient = createBrowserClient<Database>(url, publishableKey)
  }

  return browserClient
}

