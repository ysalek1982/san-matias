import { readFile } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD
if (!email || !password) throw new Error('ADMIN_EMAIL y ADMIN_PASSWORD son obligatorios')
if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres')

const envText = await readFile(new URL('../.env.local', import.meta.url), 'utf8')
const env = Object.fromEntries(
  envText.split(/\r?\n/u).filter((line) => line && !line.startsWith('#')).map((line) => {
    const separator = line.indexOf('=')
    return [line.slice(0, separator), line.slice(separator + 1)]
  }),
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({ perPage: 1_000 })
if (usersError) throw usersError

let user = usersData.users.find((candidate) => candidate.email?.toLowerCase() === email)
if (user) {
  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    email,
    password,
    email_confirm: true,
    user_metadata: { ...user.user_metadata, full_name: 'Administrador GAM San Matías' },
  })
  if (error) throw error
  user = data.user
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Administrador GAM San Matías' },
  })
  if (error) throw error
  user = data.user
}

const { error: profileError } = await supabase.from('profiles').upsert({
  id: user.id,
  email,
  full_name: 'Administrador GAM San Matías',
  role: 'superadmin',
  is_active: true,
})
if (profileError) throw profileError

console.log(JSON.stringify({ configured: true, email, role: 'superadmin' }))
