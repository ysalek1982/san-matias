function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`)
  }

  return value
}

export function getPublicSupabaseEnv(): {
  url: string
  publishableKey: string
} {
  return {
    url: required(
      import.meta.env.NEXT_PUBLIC_SUPABASE_URL,
      'NEXT_PUBLIC_SUPABASE_URL',
    ),
    publishableKey: required(
      import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ),
  }
}

export function getServerSupabaseEnv(): {
  url: string
  publishableKey: string
  serviceRoleKey: string
} {
  const publicEnv = getPublicSupabaseEnv()

  return {
    ...publicEnv,
    serviceRoleKey: required(
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      'SUPABASE_SERVICE_ROLE_KEY',
    ),
  }
}

