import { readFile } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'

const email = process.env.LOGIN_EMAIL?.trim().toLowerCase()
const password = process.env.LOGIN_PASSWORD
if (!email || !password) throw new Error('LOGIN_EMAIL y LOGIN_PASSWORD son obligatorios')

const envText = await readFile(new URL('../.env.local', import.meta.url), 'utf8')
const env = Object.fromEntries(envText.split(/\r?\n/u).filter((line) => line && !line.startsWith('#')).map((line) => {
  const separator = line.indexOf('=')
  return [line.slice(0, separator), line.slice(separator + 1)]
}))
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const { data, error } = await supabase.auth.signInWithPassword({ email, password })
if (error) throw error
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('email,role,is_active')
  .eq('id', data.user.id)
  .single()
if (profileError) throw profileError
if (!profile.is_active || profile.role !== 'superadmin') throw new Error('La cuenta no tiene acceso de superadministrador activo')
await supabase.auth.signOut()

console.log(JSON.stringify({ verified: true, email: profile.email, role: profile.role, active: profile.is_active }))
